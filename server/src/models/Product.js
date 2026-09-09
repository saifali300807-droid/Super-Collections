const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    slug: { type: String, unique: true },
    brand: { type: String, default: 'Super Collection' },
    category: {
      type: String,
      required: true,
    },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    comparePrice: { type: Number, default: 0 },
    images: [{ type: String }],
    video: { type: String, default: '' },
    // Optional colour variants — each has its own set of images (admin's choice)
    colorVariants: [
      {
        color: { type: String, default: '' },
        images: [{ type: String }],
        video: { type: String, default: '' },
      },
    ],
    description: { type: String, default: '' },
    fabric: { type: String, default: '' },
    sizes: { type: [String], default: ['XS', 'S', 'M', 'L', 'XL'] },
    countInStock: { type: Number, required: true, min: 0, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    // customer reviews
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, default: 'Customer' },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      + '-' + Date.now().toString(36);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
