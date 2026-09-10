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

const api = axios.create({ baseURL: BASE, withCredentials: true, timeout: 60000 }); // auth token har request ke saath jayega; 60s timeout = UI kabhi hang na ho

/* Auth token (Bearer) — cross-site browsers third-party cookie block kar dete hain,
   isliye login response se mila token localStorage mein rakhte hain aur har request
   par header me bhejte hain. Cookie (agar mila) bhi extra layer hai. */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* 401 aaye to cached user info + token clear karo (session invalid). */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sc_user');
      localStorage.removeItem('sc_token');
    }
    return Promise.reject(err);
  }
);

export default api;
