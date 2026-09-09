const User = require('../models/User');
const Product = require('../models/Product');

/* ── PER-USER CART (server/DB) ─────────────────────────────────────────────
   Har user ki cart User.cart me ALAG store hoti hai — isliye koi bhi do users
   (ya admin) kabhi ek hi cart nahi dekhte. Pehle client localStorage me ek hi
   'sc_cart' key SAB users ke liye use hoti thi (shared browser = shared cart),
   wahi bug tha; ab cart account-specific hai. */

// @route GET /api/cart — logged-in user ki apni cart, fresh product info ke saath.
// Prices/names/images client ke bajaye server se aate hain (stale data nahi).
exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    const items = [];
    for (const ci of user?.cart || []) {
      const p = await Product.findById(ci.product).select('name images price countInStock').lean();
      if (!p || p.countInStock < 1) continue; // deleted/out-of-stock → drop
      items.push({
        product: p._id,
        name: p.name,
        image: p.images?.[0] || '',
        price: p.price,
        size: ci.size || 'M',
        qty: Math.min(ci.qty, p.countInStock),
      });
    }
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/cart — client ka poora bag server par save karo (replace).
// qty re-validate hoti hai (1–99, stock se cap); invalid/deleted items drop.
exports.replaceCart = async (req, res, next) => {
  try {
    const incoming = Array.isArray(req.body?.items) ? req.body.items : [];
    const cleaned = [];
    for (const item of incoming) {
      const qty = Number(item?.qty);
      if (!Number.isInteger(qty) || qty < 1 || qty > 99) continue;
      if (!item?.product) continue;
      const product = await Product.findById(item.product).select('countInStock').lean();
      if (!product || product.countInStock < 1) continue;
      cleaned.push({
        product: product._id,
        size: String(item.size || 'M').slice(0, 20),
        qty: Math.min(qty, product.countInStock),
      });
    }
    await User.findByIdAndUpdate(req.user._id, { $set: { cart: cleaned } });
    res.json({ success: true, items: cleaned });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/cart — order place hone par client cart clear karta hai
exports.clearCart = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });
    res.json({ success: true, items: [] });
  } catch (err) {
    next(err);
  }
};