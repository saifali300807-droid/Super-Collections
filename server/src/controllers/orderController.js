const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Settings = require('../models/Settings');
const razorpay = require('../utils/razorpay');

const COMMERCE_DEFAULTS = { taxRate: 5, shippingRate: 49, freeShippingAbove: 999 };
const VALID_PAYMENT_METHODS = ['Razorpay', 'COD'];
const REQUIRED_ADDRESS = ['fullName', 'phone', 'address', 'city', 'state', 'pincode'];

/* Admin Settings.commerce se active GST/shipping rules — koi value na ho to
   safe defaults. Frontend (cart/checkout summary) isi API se calculate karta
   hai, isliye dono sides hamesha consistent. */
const getCommerceConfig = async () => {
  try {
    const settings = await Settings.findOne({ key: 'home' });
    const c = settings?.commerce || {};
    return {
      taxRate: Math.max(0, Math.min(100, Number(c.taxRate) || COMMERCE_DEFAULTS.taxRate)),
      shippingRate: Math.max(0, Number(c.shippingRate) || COMMERCE_DEFAULTS.shippingRate),
      freeShippingAbove: Math.max(0, Number(c.freeShippingAbove) || COMMERCE_DEFAULTS.freeShippingAbove),
    };
  } catch {
    return COMMERCE_DEFAULTS;
  }
};

// @route POST /api/orders (verified users)
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ success: false, message: 'Your cart is empty' });

    const method = paymentMethod || 'Razorpay';
    if (!VALID_PAYMENT_METHODS.includes(method))
      return res.status(400).json({ success: false, message: 'Invalid payment method' });

    if (!shippingAddress || typeof shippingAddress !== 'object')
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    for (const f of REQUIRED_ADDRESS) {
      if (!shippingAddress[f] || !String(shippingAddress[f]).trim())
        return res.status(400).json({ success: false, message: `Shipping ${f} is required` });
    }

    let itemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const qty = Number(item?.qty);
      if (!Number.isInteger(qty) || qty < 1 || qty > 99)
        return res.status(400).json({ success: false, message: 'Invalid quantity' });

      const product = await Product.findById(item.product);
      if (!product)
        return res.status(404).json({ success: false, message: 'Product not found' });
      if (product.countInStock < qty)
        return res.status(400).json({
          success: false,
          message: `${product.name} — only ${product.countInStock} left in stock`,
        });

      itemsPrice += product.price * qty;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        size: item.size || 'M',
        price: product.price,
        qty,
      });
    }

    // Prices hamesha SERVER side calculate hote hain (client-trusted kabhi nahi).
    // GST/shipping admin Settings.commerce se: free-delivery threshold tak
    // shippingRate, uske upar FREE; tax itemsPrice par lagta hai.
    const cfg = await getCommerceConfig();
    const shippingPrice = itemsPrice >= cfg.freeShippingAbove ? 0 : cfg.shippingRate;
    const taxPrice = Math.round((itemsPrice * cfg.taxRate) / 100);
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: method,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      pricingSnapshot: cfg,
    });

    // Reduce stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { countInStock: -item.qty } });
    }

    // Order server par save ho gaya — user ki PER-USER server cart ab empty.
    // (Items order me already locked hain; client bhi clearCart() call karta hai.)
    await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/orders/mine
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/orders/:id/pay
exports.updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Ownership check pehle — koi bhi user kisi bhi order ko paid mark karke
    // payment bypass nahi kar sakta (admin hamesha allowed).
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized to update this order' });

    const { demo, razorpay_order_id, razorpay_payment_id, razorpay_signature,
      razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Razorpay orders ke liye valid HMAC signature chahiye (ya demo mode).
    // Bina iske payment signature ka bypass nahi hota.
    // snake_case (Razorpay callback) aur camelCase (frontend pay call) dono accept.
    if (order.paymentMethod === 'Razorpay' && !demo) {
      const okSig = razorpay.verifyPaymentSignature(
        razorpay_order_id || razorpayOrderId,
        razorpay_payment_id || razorpayPaymentId,
        razorpay_signature || razorpaySignature
      );
      if (!okSig) {
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = { ...req.body, status: 'SUCCESS' };
    // status stays 'Pending' until admin updates it from the admin panel
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (order.status === 'Delivered' || order.status === 'Shipped' || order.status === 'Cancelled')
      return res.status(400).json({ success: false, message: 'Cannot cancel a shipped/delivered/cancelled order' });

    // Restock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { countInStock: item.qty } });
    }
    order.status = 'Cancelled';
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};
