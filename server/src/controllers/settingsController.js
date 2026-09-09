const Settings = require('../models/Settings');

// @route GET /api/settings (public)
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ key: 'home' }).populate('sliderProducts');
    if (!settings) {
      settings = await Settings.create({ key: 'home' });
      settings = await settings.populate('sliderProducts');
    }
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/commerce (public)
 * Cart/checkout summary ke liye GST + shipping rules. Frontend order banane
 * se pehle isi se totals dikhata hai — server order create par inhi values
 * se calculate karta hai, isliye koi mismatch nahi hota.
 */
exports.getCommerce = async (req, res, next) => {
  try {
    const settings = await Settings.findOne({ key: 'home' });
    const c = settings?.commerce || {};
    res.json({
      success: true,
      commerce: {
        taxRate: Number(c.taxRate) || 5,
        shippingRate: Number(c.shippingRate) || 49,
        freeShippingAbove: Number(c.freeShippingAbove) || 999,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/settings (admin)
exports.updateSettings = async (req, res, next) => {
  try {
    const { sliderProducts, categoryCircles, heroVideos, hero, contact, commerce } = req.body;
    const update = { sliderProducts, categoryCircles };
    if (heroVideos) update.heroVideos = heroVideos;
    if (hero) update.hero = hero;
    if (contact) update.contact = contact;
    if (commerce) update.commerce = commerce;

    const settings = await Settings.findOneAndUpdate(
      { key: 'home' },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('sliderProducts');

    // Emit real-time event
    const io = req.app.get('io');
    if (io) io.emit('settings:updated', settings);

    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};
