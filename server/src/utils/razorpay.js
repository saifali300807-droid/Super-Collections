const crypto = require('crypto');

/* Razorpay service layer — order creation + webhook-signature verification.
   Controllers isme business calls karte hain; keys sirf yahan client banane
   ke liye padhi jaati hain (process.env se). */

let instance = null;

const isConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

const client = () => {
  if (instance) return instance;
  if (!isConfigured()) return null;
  const Razorpay = require('razorpay');
  instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  return instance;
};

/* Razorpay order banata hai. amount rupees me leta hai aur paise (×100) par
   convert karta hai — Razorpay ka required format. currency whitelist store
   ki payment predictability ke liye rakhi gayi hai. */
const createOrder = async ({ amount, currency = 'INR', receipt } = {}) => {
  const rp = client();
  if (!rp) return null;
  const cur = String(currency || 'INR').toUpperCase();
  if (!['INR'].includes(cur)) throw new Error(`Unsupported currency: ${cur}`);
  return rp.orders.create({
    amount: Math.max(1, Math.round(Number(amount) * 100)),
    currency: cur,
    receipt: receipt || `rcpt_${Date.now()}`,
  });
};

/* Razorpay ki official scheme: HMAC-SHA256(orderId|paymentId).
   timingSafeEqual timing side-channel attack se bachata hai.
   Concise form: `expected = HMAC(secret, orderId|paymentId)`,
   `valid = timingSafeEqual(hexToBuf(expected), hexToBuf(signature))`. */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  if (!orderId || !paymentId || !signature || !process.env.RAZORPAY_KEY_SECRET) return false;
  try {
    const body = `${orderId}|${paymentId}`;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    const provided = Buffer.from(String(signature), 'hex');
    if (provided.length !== 32) return false; // sha256 digest = 32 bytes
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), provided);
  } catch {
    return false;
  }
};

module.exports = { isConfigured, createOrder, verifyPaymentSignature };