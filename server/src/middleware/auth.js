const jwt = require('jsonwebtoken');
const User = require('../models/User');

const COOKIE_NAME = 'sc_token';

/* JWT_EXPIRES_IN ("7d" jaisa) → milliseconds (cookie maxAge ke liye) */
const expiresInToMs = (str = '7d') => {
  const m = /^(\d+)([smhd])$/.exec(String(str).trim());
  if (!m) return 7 * 24 * 60 * 60 * 1000;
  const mult = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[m[2]];
  return Number(m[1]) * mult;
};

/* httpOnly cookie = JavaScript token ko padh NAHI sakti → XSS se token
   chori nahi ho sakta (localStorage se zyada safe). */
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // prod https-only
  // Production: Vercel (frontend) + Render (backend) alag origins —
  // cross-site cookie ke liye SameSite=None; dev localhost par Lax.
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: expiresInToMs(process.env.JWT_EXPIRES_IN),
  path: '/',
});

const setAuthCookie = (res, token) => res.cookie(COOKIE_NAME, token, cookieOptions());
const clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, { path: '/' });

// Protect routes — httpOnly cookie se token, warna Bearer header (API clients ke liye)
const protect = async (req, res, next) => {
  let token = req.cookies?.[COOKIE_NAME];
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (user.isBlocked) return res.status(403).json({ success: false, message: 'Your account has been blocked' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// Admin only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') next();
  else res.status(403).json({ success: false, message: 'Admin access only' });
};

// Verified email required (admins bypass)
const verifiedOnly = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.isVerified) next();
  else
    res.status(403).json({
      success: false,
      message: 'Please verify your email address before placing an order. Check the verification link sent to your inbox.',
      code: 'NOT_VERIFIED',
    });
};

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

module.exports = { protect, adminOnly, verifiedOnly, signToken, setAuthCookie, clearAuthCookie, COOKIE_NAME };
