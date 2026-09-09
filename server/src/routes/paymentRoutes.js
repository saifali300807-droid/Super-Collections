const express = require('express');
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');
const { protect, verifiedOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/razorpay', protect, verifiedOnly, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router;
