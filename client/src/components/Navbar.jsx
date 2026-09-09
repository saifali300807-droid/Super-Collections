import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

/* ── Premium animated logo mark — lotus medallion monogram ── */
const CrownMark = () => (
  <svg className="logo-mark" viewBox="0 0 48 48" aria-hidden="true">
    <defs>
      <linearGradient id="scGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f6d486" />
        <stop offset="0.55" stopColor="#c99d3f" />
        <stop offset="1" stopColor="#8a641c" />
      </linearGradient>
      <radialGradient id="scPearl" cx="0.35" cy="0.3" r="1">
        <stop offset="0" stopColor="#fff7e2" />
        <stop offset="1" stopColor="#d9b15e" />
      </radialGradient>
    </defs>
    {/* lotus petals rotating slowly */}
    <g className="logo-petals">
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="24" cy="9.5" rx="6" ry="13.5"
          fill="url(#scGold)" opacity="0.3"
          transform={`rotate(${a} 24 24)`} />
      ))}
    </g>
    {/* pearl orb + rings */}
    <circle cx="24" cy="24" r="20.5" fill="none" stroke="url(#scGold)" strokeWidth="1.4" />
    <circle className="logo-orb" cx="24" cy="24" r="15.6" fill="url(#scPearl)" />
    <circle cx="24" cy="24" r="18" fill="none" stroke="url(#scGold)" strokeWidth="0.7" opacity="0.8" strokeDasharray="2.4 3" />
    {/* elegance monogram */}
    <text x="24" y="29.4" textAnchor="middle"
      fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic"
      fontWeight="700" fontSize="13.5" fill="url(#scGold)">S</text>
  </svg>
);

/* ── Clean SVG icons (no emoji) ── */
const I = {
  palette: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21a9 9 0 1 1 9-9c0 2.2-1.8 3.5-3.6 3.5h-1.9a2 2 0 0 0-1.5 3.3c.4.5.5 1.4-.2 1.8-.5.3-1.1.4-1.8.4z" />
      <circle cx="7.5" cy="11" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="7" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  mail: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </svg>
  ),
  theme: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.9 5.8L20 10.6l-6.1 1.2L12 17.6l-1.9-5.8L4 10.6l6.1-1.8z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
    </svg>
  ),
  bag: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.3 8h11.4l-1.1 11.2a1.6 1.6 0 0 1-1.6 1.3H9a1.6 1.6 0 0 1-1.6-1.3z" />
      <path d="M9 10V7a3 3 0 0 1 6 0v3" />
    </svg>
  ),
  logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
  user: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  orders: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  ),
  sparkle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.9 5.8L20 10.6l-6.1 1.2L12 17.6l-1.9-5.8L4 10.6l6.1-1.8z" />
    </svg>
  ),
  heart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.5C7 16.5 3.5 13.3 3.5 9.6 3.5 7 5.5 5 8 5c1.6 0 3.1.8 4 2.1C12.9 5.8 14.4 5 16 5c2.5 0 4.5 2 4.5 4.6 0 3.7-3.5 6.9-8.5 10.9z" />
    </svg>
  ),
  grid: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  ),
  search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.4-4.4" />
    </svg>
  ),
  back: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  ),
  top: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  ),
};

const Logo = () => (
  <Link to="/" className="logo">
    <CrownMark />
    Super<span>Collection</span>
  </Link>
);

function ThemePanel({ open, onClose }) {
  const { theme, setTheme, custom, setCustom, presets, customDefault } = useTheme();
  const swatches = [
    { key: 'light', label: 'Light', color: '#ffffff' },
    { key: 'dark', label: 'Dark', color: '#0d0c10' },
    { key: 'custom', label: 'Custom', color: custom.accent },
  ];
  return (
    <>
      <div className={`panel-backdrop ${open ? 'show' : ''}`} onClick={onClose} />
      <div className={`theme-panel ${open ? 'open' : ''}`}>
      <button className="theme-close" onClick={onClose} title="Close" aria-label="Close appearance panel">✕</button>
      <h3>Appearance</h3>
      <div className="theme-opts">
        {swatches.map((s) => (
          <button key={s.key} className={`theme-opt ${theme === s.key ? 'active' : ''}`} onClick={() => setTheme(s.key)}>
            <span className="swatch" style={{ background: s.color, border: '1px solid var(--border)' }} />
            {s.label}
          </button>
        ))}
      </div>
      {theme === 'custom' && (
        <>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 14, letterSpacing: 1 }}>
            CUSTOMIZE YOUR THEME
          </p>
          {[
            ['accent', 'Accent'], ['accent2', 'Accent Dark'], ['bg', 'Background'],
            ['surface', 'Cards'], ['text', 'Text'], ['border', 'Borders'],
          ].map(([k, label]) => (
            <div className="custom-ctrl" key={k}>
              <span>{label}</span>
              <input
                type="color"
                value={custom[k]}
                onChange={(e) => setCustom({ ...custom, [k]: e.target.value })}
              />
            </div>
          ))}
          <button className="btn-outline btn btn-sm btn-block" onClick={() => setCustom(customDefault)}>
            Reset Custom Colors
          </button>
        </>
      )}
      </div>
    </>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [panelOpen, setPanelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profOpen, setProfOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  /* Close the mobile menu whenever the route changes */
  useEffect(() => { setMenuOpen(false); setProfOpen(false); }, [location.pathname, location.search]);

  /* Profile dropdown — bahar click karne par band */
  useEffect(() => {
    if (!profOpen) return;
    const close = (e) => {
      if (!e.target.closest('.nav-profile')) setProfOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [profOpen]);

  /* Sync search box when the URL already carries a keyword */
  useEffect(() => {
    setSearch(new URLSearchParams(location.search).get('keyword') || '');
  }, [location.search]);

  const goSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    navigate(`/shop?keyword=${encodeURIComponent(q)}`);
    setMenuOpen(false);
  };

  const logoutAndClose = () => { logout(); setMenuOpen(false); };

  return (
    <>
      <nav className="nav">
        <div className="container nav-inner">
          <Logo />
          <ul className="nav-links">
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/shop">Shop</NavLink></li>
            <li><NavLink to="/sale" className="sale-link">Sale</NavLink></li>
            <li><NavLink to="/contact">Contact</NavLink></li>
            {user?.role === 'admin' && <li><NavLink to="/admin">Admin</NavLink></li>}
          </ul>
          <form className="nav-search" onSubmit={goSearch} role="search" aria-label="Search products">
            <I.search />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dresses, sarees…"
              aria-label="Search products"
            />
          </form>
          <div className="nav-actions">
            {/* Single premium palette button — opens the appearance panel (Light / Dark / Custom) */}
            <button className="icon-btn palette-btn" title="Theme & appearance" onClick={() => setPanelOpen(true)}>
              <I.palette />
            </button>
            <button className="icon-btn" title="Cart" onClick={() => navigate('/cart')}>
              <I.bag />
              {count > 0 && <span className="cart-badge">{count}</span>}
            </button>
            {user ? (
              <div className="nav-profile">
                <button
                  className={`icon-btn profile-btn ${profOpen ? 'active' : ''}`}
                  title="My Account"
                  onClick={() => setProfOpen((o) => !o)}
                  aria-label="My account menu"
                  aria-expanded={profOpen}
                >
                  <I.user />
                </button>
                <div className={`profile-dropdown ${profOpen ? 'open' : ''}`}>
                  <div className="pd-head">
                    <span className="pd-avatar"><I.user /></span>
                    <div className="pd-id">
                      <b>{user.name}</b>
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <NavLink to="/profile" className="pd-item" onClick={() => setProfOpen(false)}>
                    <I.user />My Profile
                  </NavLink>
                  <NavLink to="/orders" className="pd-item" onClick={() => setProfOpen(false)}>
                    <I.orders />My Orders
                  </NavLink>
                  <button
                    className="pd-item pd-logout"
                    onClick={() => { logout(); setProfOpen(false); navigate('/'); }}
                  >
                    <I.logout />Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn btn-sm nav-signin">Sign In</Link>
            )}
            <button
              className={`hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>
      {user && !user.isVerified && user.role !== 'admin' && (
        <div className="verify-banner">
          ⚠️ Please verify your email to place orders.{' '}
          <Link to="/verify-pending">Resend / Get link</Link>
        </div>
      )}

      {/* Mobile slide-in menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-backdrop" onClick={() => setMenuOpen(false)} />
        <div className="mobile-panel">
          <div className="mobile-head">
            <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
              <CrownMark />
              Super<span>Collection</span>
            </Link>
            <button className="mobile-close" onClick={() => setMenuOpen(false)} title="Close menu" aria-label="Close menu">
              ✕
            </button>
          </div>
          <form className="mobile-search" onSubmit={goSearch} role="search">
            <I.search />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dresses, sarees…"
              aria-label="Search products"
            />
          </form>
          <nav className="mobile-links">
            <NavLink to="/" end><I.home />Home</NavLink>
            <NavLink to="/shop"><I.bag />Shop</NavLink>
            <NavLink to="/sale"><I.sparkle />Sale</NavLink>
            <NavLink to="/contact"><I.mail />Contact</NavLink>
            {user && <NavLink to="/orders"><I.heart />My Orders</NavLink>}
            {user?.role === 'admin' && <NavLink to="/admin"><I.grid />Admin</NavLink>}
          </nav>
          <div className="mobile-auth">
            {user ? (
              <button className="btn btn-outline btn-block" onClick={logoutAndClose}>Logout</button>
            ) : (
              <Link to="/login" className="btn btn-block">Sign In</Link>
            )}
            <button className="btn btn-outline btn-block" onClick={() => { setMenuOpen(false); setPanelOpen(true); }}>
              Theme & Appearance
            </button>
          </div>

          {/* 3D teddy bear — makes a heart with its paws and offers it to you */}
          <div className="menu-bear" aria-hidden="true">
            <svg className="bear-svg" viewBox="0 0 200 190">
              <defs>
                <radialGradient id="bFur" cx="38%" cy="28%" r="85%">
                  <stop offset="0%" stopColor="#e2aa5c" />
                  <stop offset="45%" stopColor="#c08a3e" />
                  <stop offset="100%" stopColor="#7d5320" />
                </radialGradient>
                <radialGradient id="bFurDark" cx="40%" cy="30%" r="85%">
                  <stop offset="0%" stopColor="#c89044" />
                  <stop offset="100%" stopColor="#6b4519" />
                </radialGradient>
                <radialGradient id="bMuzzle" cx="40%" cy="35%" r="80%">
                  <stop offset="0%" stopColor="#f7e7c9" />
                  <stop offset="100%" stopColor="#dfbf8e" />
                </radialGradient>
                <linearGradient id="bHeart" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffe08a" />
                  <stop offset="55%" stopColor="#f2b23c" />
                  <stop offset="100%" stopColor="#d98e1f" />
                </linearGradient>
                <filter id="bGlow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="5" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="bSoft" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="2.2" />
                </filter>
              </defs>

              <ellipse cx="100" cy="176" rx="58" ry="10" fill="#000" opacity="0.22" filter="url(#bSoft)" />
              <circle cx="58" cy="40" r="21" fill="url(#bFurDark)" />
              <circle cx="142" cy="40" r="21" fill="url(#bFurDark)" />
              <circle cx="58" cy="40" r="11" fill="#a5762f" opacity="0.85" />
              <circle cx="142" cy="40" r="11" fill="#a5762f" opacity="0.85" />
              <circle cx="54" cy="35" r="4" fill="#f3cf8f" opacity="0.5" />
              <circle cx="138" cy="35" r="4" fill="#f3cf8f" opacity="0.5" />
              <ellipse cx="100" cy="140" rx="52" ry="40" fill="url(#bFurDark)" />
              <ellipse cx="100" cy="146" rx="34" ry="28" fill="#e5c084" opacity="0.9" />
              <ellipse cx="100" cy="72" rx="55" ry="50" fill="url(#bFur)" />
              <ellipse cx="76" cy="46" rx="20" ry="12" fill="#fff" opacity="0.28" filter="url(#bSoft)" />
              <ellipse cx="79" cy="62" rx="13" ry="14" fill="#e5c084" opacity="0.55" />
              <ellipse cx="121" cy="62" rx="13" ry="14" fill="#e5c084" opacity="0.55" />
              <g className="bear-eyes">
                <ellipse cx="80" cy="62" rx="5.5" ry="6.5" fill="#2a1a0c" />
                <ellipse cx="120" cy="62" rx="5.5" ry="6.5" fill="#2a1a0c" />
                <circle cx="82" cy="59.5" r="2" fill="#fff" />
                <circle cx="122" cy="59.5" r="2" fill="#fff" />
                <circle cx="78.4" cy="64.5" r="0.9" fill="#fff" opacity="0.7" />
                <circle cx="118.4" cy="64.5" r="0.9" fill="#fff" opacity="0.7" />
              </g>
              <ellipse cx="100" cy="88" rx="26" ry="19" fill="url(#bMuzzle)" />
              <path d="M94 82 q6 -5 12 0 q-2 7 -6 7 q-4 0 -6 -7z" fill="#3a2413" />
              <ellipse cx="96.5" cy="82.5" rx="2.2" ry="1.4" fill="#8a6a4a" opacity="0.7" />
              <path d="M100 89 q0 7 -7 8 M100 89 q0 7 7 8" stroke="#5a3d20" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              <ellipse cx="66" cy="84" rx="9" ry="5" fill="#e8927c" opacity="0.4" filter="url(#bSoft)" />
              <ellipse cx="134" cy="84" rx="9" ry="5" fill="#e8927c" opacity="0.4" filter="url(#bSoft)" />
              <g className="bear-offer" filter="url(#bGlow)">
                <path className="bear-heart" d="M100 160 C 72 140, 76 112, 100 122 C 124 112, 128 140, 100 160 Z" fill="url(#bHeart)" />
                <path d="M92 128 q-4 4 -2 9" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.55" />
              </g>
              <g className="bear-paws">
                <ellipse cx="74" cy="146" rx="17" ry="13" fill="url(#bFur)" transform="rotate(-22 74 146)" />
                <ellipse cx="126" cy="146" rx="17" ry="13" fill="url(#bFur)" transform="rotate(22 126 146)" />
                <ellipse cx="70" cy="143" rx="7" ry="5" fill="#e5c084" opacity="0.85" transform="rotate(-22 70 143)" />
                <ellipse cx="130" cy="143" rx="7" ry="5" fill="#e5c084" opacity="0.85" transform="rotate(22 130 143)" />
              </g>
              <ellipse cx="66" cy="170" rx="15" ry="9" fill="url(#bFurDark)" />
              <ellipse cx="134" cy="170" rx="15" ry="9" fill="url(#bFurDark)" />
              <ellipse cx="66" cy="171" rx="8" ry="5" fill="#e5c084" opacity="0.8" />
              <ellipse cx="134" cy="171" rx="8" ry="5" fill="#e5c084" opacity="0.8" />
              <g className="bear-sparkles" fill="#f2b23c">
                <path d="M22 60 l3.2 8 8 3.2 -8 3.2 -3.2 8 -3.2 -8 -8 -3.2 8 -3.2z" />
                <path d="M176 44 l2.6 6.5 6.5 2.6 -6.5 2.6 -2.6 6.5 -2.6 -6.5 -6.5 -2.6 6.5 -2.6z" />
                <path d="M184 110 l2.2 5.5 5.5 2.2 -5.5 2.2 -2.2 5.5 -2.2 -5.5 -5.5 -2.2 5.5 -2.2z" />
                <path d="M16 118 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
              </g>
            </svg>
            <div className="bear-text">
              <span className="bear-title">Super Collection</span>
              <span className="bear-sub">Premium fashion for everyone</span>
            </div>
          </div>
        </div>
      </div>
      <ThemePanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
