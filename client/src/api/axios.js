import axios from 'axios';

/* Dev me Vite proxy (/api → localhost:5000) kaam karta hai.
   Production me Vercel/Netlify par backend alag URL hota hai — isliye VITE_API_URL support. */
const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

/* Backend origin for static assets (/uploads/... images & videos).
   • Dev: VITE_API_URL na ho to http://localhost:5000 (Vite proxy bhi /uploads
     forward karta hai).
   • Production + VITE_API_URL set (frontend/backend alag): backend origin.
   • Production + VITE_API_URL empty (Render single service — same origin): ''
     Rakhne par /uploads relative hi rahega (koi fix nahi chahiye).
   Absolute URLs (Unsplash, Cloudinary, data:, blob:) unchanged rehte hain. */
export const BACKEND_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '')
).replace(/\/+$/, '');

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
