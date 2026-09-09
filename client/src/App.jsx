import React, { createContext, useContext, useState, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import Sale from './pages/Sale';

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import ProductEdit from './pages/admin/ProductEdit';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminHome from './pages/admin/AdminHome';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSales from './pages/admin/AdminSales';

/* ── Toast system ── */
const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={`toast ${toast?.type || ''} ${toast ? 'show' : ''}`}>{toast?.msg}</div>
    </ToastContext.Provider>
  );
}

const errMsg = (e) => e.response?.data?.message || e.message || 'Something went wrong';

export { errMsg };

/* ── Scroll to top on every route change (fixes "page opens mid/bottom") ── */
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

/* ── Floating Back + Back-to-top buttons ──
   ~1cm (40px) se zyada scroll → Back button dikhne lagega; top par wapas → hide */
function FloatingNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = React.useState(false);
  const [y, setY] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => {
      const cur = window.scrollY;
      setVisible(cur > 40);   // 1cm+ scroll → show; top (≤40px) → hide
      setY(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onHome = location.pathname === '/';

  const goBack = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <>
      <button
        className={`float-back ${!onHome && visible ? '' : 'hidden'}`}
        onClick={goBack}
        title="Back to previous page"
        aria-label="Back to previous page"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        className={`float-top ${y > 420 && visible ? '' : 'hidden'}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Back to top"
        aria-label="Back to top"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5" /><path d="M5 12l7-7 7 7" />
        </svg>
      </button>
    </>
  );
}

export default function App() {
  const location = useLocation();

  /* Premium scroll-reveal: fade-up elements as they enter the viewport */
  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    const seen = new WeakSet();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in-view');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );
    const SELECTOR = '.card, .section-head, .stat-card, .form-page, .summary';

    const scan = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        el.classList.add('rv');
        io.observe(el);
      });
    };
    scan();

    /* Catch dynamically rendered content (e.g. products after fetch) */
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { io.disconnect(); mo.disconnect(); };
  }, [location.pathname]);

  return (
    <ToastProvider>
      <ScrollToTop />
      <Navbar />
      <main className="page-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sale" element={<Sale />} />

          <Route path="/admin" element={<ProtectedRoute admin><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<ProductEdit />} />
            <Route path="products/:id" element={<ProductEdit />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="home" element={<AdminHome />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="sales" element={<AdminSales />} />
          </Route>
        </Routes>
      </main>
      <Footer />
      <FloatingNav />
    </ToastProvider>
  );
}
