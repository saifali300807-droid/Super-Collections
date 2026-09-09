const express = require('express');
const { register, verifyEmail, login, logout, getMe, updateProfile, forgotPassword, resetPassword, socialAuth } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { rateLimit } = require('../middleware/security');

const router = express.Router();

router.post('/register', rateLimit(15), register);
router.post('/login', rateLimit(30), login);
router.post('/social', rateLimit(15), socialAuth);
router.post('/verify-email', rateLimit(15), verifyEmail);
router.post('/logout', logout);
router.post('/forgot-password', rateLimit(5), forgotPassword);
router.put('/reset-password/:token', rateLimit(10), resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
