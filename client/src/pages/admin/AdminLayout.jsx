import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  /* Route change hote hi menu band — page open hote hi drawer chala jaye */
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  /* Escape key se bhi menu band ho */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* Menu khula ho to page scroll na kare */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="admin">
      {/* Right-side slide-in menu */}
      <aside className={`admin-side ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div className="admin-side-header">
          <Link to="/" className="logo-sm" onClick={closeMenu}>
            Super<span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Collection</span>
          </Link>
          <span className="admin-badge">Admin</span>
          <button className="admin-side-close" onClick={closeMenu} aria-label="Close menu">
            ✕
          </button>
        </div>

        <nav className="admin-nav">
          <div className="nav-section">
            <span className="nav-section-title">Overview</span>
            <NavLink to="/admin" end className="nav-link" onClick={closeMenu}>
              <span className="nav-icon">📊</span>
              <span>Dashboard</span>
            </NavLink>
          </div>

          <div className="nav-section">
            <span className="nav-section-title">Products</span>
            <NavLink to="/admin/products/new" className="nav-link" onClick={closeMenu}>
              <span className="nav-icon">➕</span>
              <span>Add Product</span>
            </NavLink>
            <NavLink to="/admin/products" className="nav-link" onClick={closeMenu}>
              <span className="nav-icon">👗</span>
              <span>Edit Products</span>
            </NavLink>
          </div>

          <div className="nav-section">
            <span className="nav-section-title">Management</span>
            <NavLink to="/admin/orders" className="nav-link" onClick={closeMenu}>
              <span className="nav-icon">📦</span>
              <span>Orders</span>
            </NavLink>
            <NavLink to="/admin/users" className="nav-link" onClick={closeMenu}>
              <span className="nav-icon">👥</span>
              <span>Users</span>
            </NavLink>
          </div>

          <div className="nav-section">
            <span className="nav-section-title">Marketing</span>
            <NavLink to="/admin/sales" className="nav-link" onClick={closeMenu}>
              <span className="nav-icon">🏷️</span>
              <span>Sale Manager</span>
            </NavLink>
            <NavLink to="/admin/home" className="nav-link" onClick={closeMenu}>
              <span className="nav-icon">🏠</span>
              <span>Homepage</span>
            </NavLink>
          </div>

          <div className="nav-section">
            <span className="nav-section-title">Settings</span>
            <NavLink to="/admin/settings" className="nav-link" onClick={closeMenu}>
              <span className="nav-icon">⚙️</span>
              <span>Site Settings</span>
            </NavLink>
          </div>
        </nav>

        <div className="admin-side-footer">
          <Link to="/" className="nav-link view-store">
            <span className="nav-icon">🏠</span>
            <span>View Store</span>
          </Link>
        </div>
      </aside>

      {/* Backdrop — click karne se menu band */}
      <div className={`admin-backdrop ${menuOpen ? 'open' : ''}`} onClick={closeMenu} />

      <main className="admin-main">
        {/* Menu toggle — right side par */}
        <button
          className="admin-menu-toggle"
          onClick={() => setMenuOpen(true)}
          aria-label="Open admin menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <Outlet />
      </main>
    </div>
  );
}
