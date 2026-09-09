import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>Super<span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Collection</span></h4>
            <p>
              Curated traditional & luxury wear for the modern woman. Suits, kurtis,
              lehengas & sarees — crafted with love, delivered with grace.
            </p>
          </div>
          <div>
            <h4>Shop</h4>
            <Link to="/shop?category=Suits">Suits</Link>
            <Link to="/shop?category=Kurtis">Kurtis</Link>
            <Link to="/shop?category=Lehengas">Lehengas</Link>
            <Link to="/shop?category=Sarees">Sarees</Link>
            <Link to="/sale">🔥 Sale</Link>
          </div>
          <div>
            <h4>Account</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/cart">Shopping Bag</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Super Collection · All rights reserved · Made with 👑
        </div>
      </div>
    </footer>
  );
}
