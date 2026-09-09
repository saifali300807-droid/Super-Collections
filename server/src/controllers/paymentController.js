const razorpay = require('../utils/razorpay');

/**
 * @route POST /api/payments/razorpay
 * Razorpay order create karta hai (service layer se). Keys na hone par DEMO
 * mode return — amount rupees me aata hai, service usse paise me badalti hai.
 * currency optional (default INR) accept hota hai.
 */
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency } = req.body;
    const amt = Number(amount);
    if (amount === undefined || Number.isNaN(amt) || amt <= 0)
      return res.status(400).json({ success: false, message: 'A valid amount is required' });

    try {
      const rzpOrder = await razorpay.createOrder({ amount: amt, currency: currency || 'INR' });
      if (!rzpOrder) {
        return res.json({
          success: true,
          demo: true,
          message: 'Running in DEMO payment mode (no Razorpay keys configured)',
        });
      }
      res.json({ success: true, demo: false, rzpOrder, keyId: process.env.RAZORPAY_KEY_ID });
    } catch (e) {
      // Razorpay upstream error → 502 as proper gateway status
      return res.status(502).json({ success: false, message: `Razorpay order failed: ${e.message}` });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @route POST /api/payments/verify
 * Real mode: HMAC signature verify. Demo mode (keys nahi) → seedha success.
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay.isConfigured()) {
      return res.json({ success: true, message: 'Payment verified (demo mode)' });
    }

    if (!razorpay.verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (err) {
    next(err);
  }
};
