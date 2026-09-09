const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @route GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [users, orders, products, revenueAgg] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const lowStock = await Product.countDocuments({ countInStock: { $lte: 5 } });

    res.json({
      success: true,
      stats: {
        users,
        orders,
        products,
        revenue: revenueAgg[0]?.total || 0,
        pendingOrders,
        lowStock,
        recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    // Sensitive fields (verify/reset tokens) response me kabhi mat bhejo
    const users = await User.find()
      .select('-password -verifyToken -verifyExpires -resetToken -resetExpires -cart')
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isBlocked } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user._id.toString() === req.user._id.toString())
      return res.status(400).json({ success: false, message: "You can't modify your own admin account" });

    if (role) user.role = role;
    if (typeof isBlocked === 'boolean') user.isBlocked = isBlocked;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: "You can't delete your own account" });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['Pending', 'Packed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!valid.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.status = status;
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};
