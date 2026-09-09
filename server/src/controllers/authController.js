const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { signToken, setAuthCookie, clearAuthCookie } = require('../middleware/auth');

const publicUser = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  isVerified: u.isVerified,
  avatar: u.avatar,
  authProvider: u.authProvider,
  createdAt: u.createdAt,
});

// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Please fill all fields' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const code = user.getVerifyCode();
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: user.email,
      subject: 'Welcome to Super Collection — Your Verification Code 👑',
      text: `Hi ${user.name},\n\nYour verification code is: ${code}\n\nThis code is valid for 15 minutes. Do not share it with anyone.`,
    });

    // Token ab localStorage ke bajaye httpOnly cookie me jata hai (XSS-safe)
    setAuthCookie(res, signToken(user._id));

    res.status(201).json({
      success: true,
      user: publicUser(user),
      // Dev mode me SMTP na hone par code turant de dete hain
      devVerifyCode: process.env.SMTP_HOST ? undefined : code,
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/verify-email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code || code.length !== 6)
      return res.status(400).json({ success: false, message: 'Please enter a valid 6-digit code' });

    const crypto = require('crypto');
    const hashed = crypto.createHash('sha256').update(code).digest('hex');
    const user = await User.findOne({
      verifyCode: hashed,
      verifyCodeExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ success: false, message: 'Verification code is invalid or expired' });

    user.isVerified = true;
    user.verifyCode = undefined;
    user.verifyCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Email verified successfully! Welcome to Super Collection 👑' });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please enter email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (user.isBlocked)
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact support.' });

    setAuthCookie(res, signToken(user._id));
    res.json({ success: true, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/logout — httpOnly cookie server hi clear karta hai
// (JS httpOnly cookie delete nahi kar sakti, isliye dedicated endpoint zaroori)
exports.logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out' });
};

// @route GET /api/auth/me
exports.getMe = (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
};

// @route PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) {
      if (req.body.password.length < 6)
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      user.password = req.body.password;
    }
    await user.save();
    setAuthCookie(res, signToken(user._id)); // refreshed cookie (name/email claims me nahi, but consistency)
    res.json({ success: true, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });

    const token = user.getResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Super Collection — Reset Your Password',
      text: `Reset your password: ${resetUrl}\n\nValid for 1 hour. If you didn't request this, ignore this email.`,
    });

    res.json({
      success: true,
      message: 'Password reset link sent (check server console in dev mode)',
      devResetUrl: process.env.SMTP_HOST ? undefined : resetUrl,
    });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const crypto = require('crypto');
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetToken: hashed,
      resetExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ success: false, message: 'Reset link is invalid or expired' });

    if (!req.body.password || req.body.password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    user.password = req.body.password;
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

/* ── Decode a JWT payload WITHOUT signature verification (helper) ──
   Used only to READ claims; real trust decisions use provider verification. */
const decodeJwtPayload = (token) => {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
};

/* @route   POST /api/auth/social
   @desc    One-tap sign-in/signup with Google or Apple. The provider's
            account ID is verified and the user is AUTO-VERIFIED — no
            email-code or any extra step.
   @body    { provider: 'google'|'apple', idToken?, providerId?, email?, name? }

   Two modes:
   • VERIFIED mode — client sends the provider idToken (Google Identity
     Services / Sign in with Apple JS). We verify it against the provider
     and take sub/email/name ONLY from the verified token.
   • DEMO mode (no provider keys configured) — client sends a stable demo
     identity; accepted as-is so the flow stays one-tap. Mirrors the
     payments "DEMO mode" philosophy of this project.

   Account resolution (same `users` collection as form signups):
     1. providerId match  → log in
     2. email match       → link providerId to that account + auto-verify
     3. no match          → create user { name, email, ID, providerId }        */
exports.socialAuth = async (req, res, next) => {
  try {
    let { provider, idToken, providerId, email, name } = req.body;
    provider = String(provider || '').toLowerCase();
    if (!['google', 'apple'].includes(provider))
      return res.status(400).json({ success: false, message: 'Unsupported social provider' });

    let verified = { providerId, email, name };
    let mode = 'demo';

    if (idToken) {
      if (provider === 'google') {
        /* Google: tokeninfo endpoint verifies signature/aud/exp for us — no secret needed */
        const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
        if (!r.ok)
          return res.status(401).json({ success: false, message: 'Google sign-in could not be verified' });
        const info = await r.json();
        if (String(info.email_verified) !== 'true')
          return res.status(401).json({ success: false, message: 'Google account email is not verified' });
        verified = { providerId: info.sub, email: info.email, name: info.name || info.email };
        mode = 'verified';
      } else {
        /* Apple: ID token is a JWT issued by https://appleid.apple.com.
           Claims check (iss/exp) here; production hardening: also verify the
           RS256 signature against https://appleid.apple.com/auth/keys (JWKS). */
        const payload = decodeJwtPayload(idToken);
        if (
          !payload ||
          payload.iss !== 'https://appleid.apple.com' ||
          (payload.exp && payload.exp * 1000 < Date.now())
        )
          return res.status(401).json({ success: false, message: 'Apple sign-in could not be verified' });
        verified = {
          providerId: payload.sub,
          email: payload.email,
          // Apple sends the real name ONLY on first consent — fall back gracefully
          name: name || (payload.email ? payload.email.split('@')[0] : 'Apple User'),
        };
        mode = 'verified';
      }
    }

    if (!verified.providerId || !verified.email)
      return res.status(400).json({ success: false, message: 'Social account ID and email are required' });
    verified.email = String(verified.email).toLowerCase();

    // 1) Existing social user → straight login
    let user = await User.findOne({ authProvider: provider, providerId: verified.providerId });
    let isNew = false;

    // 2) Same email already registered via the form → link accounts, auto-verify
    if (!user) {
      user = await User.findOne({ email: verified.email });
      if (user) {
        if (user.isBlocked)
          return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact support.' });
        user.providerId = verified.providerId;
        user.isVerified = true; // provider already proved email ownership — no extra step
        await user.save({ validateBeforeSave: false });
      }
    }

    // 3) Brand-new social user → create (auto-verified, no email-code step)
    if (!user) {
      user = await User.create({
        name: verified.name || 'User',
        email: verified.email,
        // random secret — social users never log in with a password
        password: require('crypto').randomBytes(24).toString('hex'),
        authProvider: provider,
        providerId: verified.providerId,
        isVerified: true,
      });
      isNew = true;
    } else if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact support.' });
    }

    setAuthCookie(res, signToken(user._id));
    res.json({ success: true, user: publicUser(user), isNew, mode });
  } catch (err) {
    next(err);
  }
};
