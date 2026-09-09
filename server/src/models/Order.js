const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, default: '' },
  size: { type: String, default: 'M' },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ['Razorpay', 'COD'], default: 'Razorpay' },
    paymentResult: {
      id: String,
      status: String,
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    status: {
      type: String,
      enum: ['Order Placed', 'Packed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Order Placed',
    },
    itemsPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    // Commerce rules jo order banate waqt active the — admin baad me rates
    // badal de to bhi purane orders ke liye snapshot par audit hota hai.
    pricingSnapshot: {
      taxRate: { type: Number, default: 5 },
      shippingRate: { type: Number, default: 99 },
      freeShippingAbove: { type: Number, default: 999 },
    },
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'SC' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 90 + 10);
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
