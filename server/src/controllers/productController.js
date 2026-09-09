const Product = require('../models/Product');

// @route GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { keyword, category, sort, featured, sale, minDiscount, page = 1, limit = 12 } = req.query;
    const query = {};

    // Pagination sanitization — negative/huge/page=0 values ko guard karo
    let pageNum = Math.max(1, Number(page) || 1);
    let limitNum = Math.min(50, Math.max(1, Number(limit) || 12));

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } },
      ];
    }
    if (category && category !== 'All') query.category = category;
    if (featured === 'true') query.isFeatured = true;
    // Sale = product has a compare (original) price set above the selling price
    if (sale === 'true') query.comparePrice = { $gt: 0 };
    // Optional minimum discount filter, e.g. only items with 50%+ off.
    // Uses multiplication instead of $divide so we never divide by zero.
    if (minDiscount) {
      const n = Number(minDiscount);
      if (!Number.isNaN(n) && n > 0) {
        query.$expr = {
          $and: [
            { $gt: ['$comparePrice', 0] },
            {
              $gte: [
                { $multiply: [100, { $subtract: ['$comparePrice', '$price'] }] },
                { $multiply: [n, '$comparePrice'] },
              ],
            },
          ],
        };
      }
    }

    let sortQuery = { createdAt: -1 };
    if (sort === 'price-asc') sortQuery = { price: 1 };
    if (sort === 'price-desc') sortQuery = { price: -1 };
    if (sort === 'rating') sortQuery = { rating: -1 };
    if (sort === 'name') sortQuery = { name: 1 };

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortQuery)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      products,
      pages: Math.ceil(count / limitNum),
      total: count,
      page: pageNum,
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/products/:id/reviews (logged-in users)
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const r = Math.round(Number(rating));
    if (!r || r < 1 || r > 5)
      return res.status(400).json({ success: false, message: 'Rating 1 se 5 ke beech do' });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // one review per user — update if exists
    const existing = product.reviews.find(
      (rv) => String(rv.user) === String(req.user._id)
    );
    if (existing) {
      existing.rating = r;
      existing.comment = comment || existing.comment;
      existing.createdAt = Date.now();
    } else {
      product.reviews.push({ user: req.user._id, name: req.user.name || 'Customer', rating: r, comment: comment || '' });
    }

    // recompute average from REAL reviews only
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.length
      ? Math.round((product.reviews.reduce((s, rv) => s + rv.rating, 0) / product.reviews.length) * 10) / 10
      : 0;

    await product.save();
    res.status(201).json({ success: true, reviews: product.reviews, rating: product.rating, numReviews: product.numReviews });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/products (admin)
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    // Emit real-time event
    const io = req.app.get('io');
    if (io) io.emit('product:created', product);
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/products/:id (admin)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    // Emit real-time event
    const io = req.app.get('io');
    if (io) io.emit('product:updated', product);
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/products/:id (admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    // Emit real-time event
    const io = req.app.get('io');
    if (io) io.emit('product:deleted', { _id: req.params.id });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};
