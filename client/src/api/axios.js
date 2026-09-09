import axios from 'axios';

/* ── Backend URL resolution ──────────────────────────────────────
   Priority: 1) VITE_API_URL (frontend build par set — recommended)
             2) Dev = 'http://localhost:5000' (Vite proxy)
             3) Production fallback = LIVE backend URL — yahan update
                karo agar backend ka domain kabhi badle. */
const FALLBACK_BACKEND = 'https://super-collections-1.onrender.com';
const RESOLVED = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : FALLBACK_BACKEND);

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

const api = axios.create({ baseURL: BASE, withCredentials: true }); // httpOnly auth cookie har request ke saath jayegi

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
