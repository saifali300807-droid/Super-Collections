const mongoose = require('mongoose');

/* Singleton doc (key: 'home') — controls the homepage slider & category circles.
   Admin can edit these from /admin/home-slider */
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'home', unique: true },
    sliderProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    categoryCircles: [
      {
        name: { type: String, default: '' },
        image: { type: String, default: '' },
        category: { type: String, default: '' },
      },
    ],
    /* Hero videos — admin can paste any mp4 URL per theme (fallback: local files) */
    heroVideos: {
      light: { type: String, default: '' },
      dark: { type: String, default: '' },
    },
    /* Hero text */
    hero: {
      eyebrow: { type: String, default: 'Traditional · Ethnic · Handpicked' },
      title: { type: String, default: 'Tradition You Can Wear' },
      subtitle: { type: String, default: 'Suits, kurtis, lehengas & banarasi sarees — every thread woven with India\'s timeless craft. Heritage that never fades.' },
    },
    /* Contact details (Contact page + map) */
    contact: {
      address: { type: String, default: 'Shop 24, Johari Bazaar, Jaipur, Rajasthan 302003' },
      phone: { type: String, default: '+91 98765 43210' },
      email: { type: String, default: 'hello@supercollection.in' },
      hours: { type: String, default: 'Mon – Sat, 10am – 8pm' },
      mapQuery: { type: String, default: 'Johari Bazaar, Jaipur, Rajasthan' },
    },
    /* Commerce rules — GST, shipping & free-delivery threshold.
       Admin in /admin/settings se control karta hai; orderController aur
       cart/checkout summary inhi values se totals calculate karte hain. */
    commerce: {
      taxRate: { type: Number, default: 5, min: 0, max: 100 },
      shippingRate: { type: Number, default: 49, min: 0 },
      freeShippingAbove: { type: Number, default: 999, min: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
