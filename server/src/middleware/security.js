/* Lightweight in-memory rate limiter (zero dependencies).
   Brute-force/credential-stuffing se bachane ke liye auth endpoints par lagaaya.
   Multi-instance / serverless production me shared store (Redis) chahiye —
   is project ke single-instance deploy ke liye ye kaafi hai. */
const buckets = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_LIMIT = 20;

const clientKey = (req) => {
  // Reverse-proxy (Render) ke peeche asli IP X-Forwarded-For ke pehle hop me
  const fwd = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || req.ip || (req.socket && req.socket.remoteAddress) || 'unknown';
};

const rateLimit = (limit = DEFAULT_LIMIT) => (req, res, next) => {
  const now = Date.now();
  const key = clientKey(req);

  let rec = buckets.get(key);
  if (!rec || now >= rec.resetAt) {
    rec = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, rec);
  }
  rec.count += 1;

  if (rec.count > limit) {
    res.setHeader('Retry-After', String(Math.ceil((rec.resetAt - now) / 1000)));
    return res.status(429).json({
      success: false,
      message: 'Too many attempts. Please wait a few minutes and try again.',
    });
  }

  // Occasional sweep — map kabhi unbounded na ho
  if (buckets.size > 1000) {
    for (const [k, v] of buckets) if (now >= v.resetAt) buckets.delete(k);
  }
  next();
};

module.exports = { rateLimit };