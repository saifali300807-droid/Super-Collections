const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    // Social sign-in (Google / Apple) — providerId is the provider's account ID.
    // 'local' = form signup, provider accounts are auto-verified at creation.
    authProvider: { type: String, enum: ['local', 'google', 'apple'], default: 'local' },
    providerId: { type: String, default: '', index: true },
    verifyCode: { type: String },
    verifyCodeExpires: { type: Date },
    resetToken: { type: String },
    resetExpires: { type: Date },
    // PER-USER CART (server-side) — har user ki cart alag hoti hai, kisi se
    // share nahi. Client (CartContext) logged-in hone par isi DB cart se
    // load/add/remove karta hai; guest cart sirf browser localStorage me.
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        size: { type: String, default: 'M' },
        qty: { type: Number, default: 1, min: 1, max: 99 },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.getVerifyCode = function () {
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  // Hash the code before storing
  this.verifyCode = crypto.createHash('sha256').update(code).digest('hex');
  this.verifyCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  return code;
};

userSchema.methods.getResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return token;
};

module.exports = mongoose.model('User', userSchema);
