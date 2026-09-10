import axios from 'axios';

/* ── Backend URL resolution ──────────────────────────────────────
   Production build HAMESHA LIVE backend use karta hai (Render par galat
   VITE_API_URL set hone se bachne ke liye). Dev me localhost:5000.
   Agar backend domain kabhi badle to sirf LIVE_BACKEND update karo. */
const LIVE_BACKEND = 'https://super-collections-1.onrender.com';
const RESOLVED = import.meta.env.DEV ? 'http://localhost:5000' : LIVE_BACKEND;

/* API base — sabhi environments me resolved backend ka /api. */
const BASE = `${RESOLVED}/api`;

/* Backend origin for static assets (/uploads/... images & videos). */
export const BACKEND_URL = RESOLVED.replace(/\/+$/, '');

/* DB me file paths RELATIVE store hote hain (/uploads/xyz.jpg) — render ke
   waqt unhe backend origin ke saath full URL banao. */
export const resolveAssetUrl = (url) => {
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url) || /^(data|blob):/i.test(url)) return url;
  return url.startsWith('/') ? `${BACKEND_URL}${url}` : `${BACKEND_URL}/${url}`;
};

const api = axios.create({ baseURL: BASE, withCredentials: true, timeout: 60000 }); // httpOnly auth cookie har request ke saath jayegi; 60s timeout = UI kabhi hang na ho

/* Token localStorage me NAHI hai — server httpOnly cookie set karta hai.
   401 aaye to sirf cached user info clear karo (cookie expired/invalid). */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sc_user');
    }
    return Promise.reject(err);
  }
);

export default api;
