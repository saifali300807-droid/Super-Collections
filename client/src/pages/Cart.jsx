import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCommerce } from '../hooks/useCommerce';
import { resolveAssetUrl } from '../api/axios';

export default function Cart() {
  const { items, updateQty, removeItem, subtotal, clearCart } = useCart();
  const config = useCommerce();
  const navigate = useNavigate();

  const freeAbove = Number(config.freeShippingAbove) || 999;
  const shipRate = Number(config.shippingRate) || 99;
  const taxRate = Number(config.taxRate) || 5;

  const shipping = subtotal >= freeAbove || subtotal === 0 ? 0 : shipRate;
  const tax = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + shipping + tax;
  // FREE delivery ke liye kitna aur chahiye
  const remaining = subtotal < freeAbove ? freeAbove - subtotal : 0;
  const progressPct = Math.min(100, subtotal / freeAbove * 100);

  if (items.length === 0)
    return (
      <div className="empty">
        <h3>Your bag is empty</h3>
        <p style={{ marginBottom: 22 }}>Add some luxury to it ✨</p>
        <Link to="/shop" className="btn">Shop Now</Link>
      </div>
    );

  return (
    <div className="container">
      <h1 className="page-title">Shopping Bag</h1>
      <div className="cart-layout cart-page">
        <div>
          {items.map((i) => (
            <div className="cart-item" key={`${i.product}-${i.size}`}>
              <img src={resolveAssetUrl(i.image)} alt={i.name}
                onError={(e) => (e.target.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&q=80')} />
              <div>
                <h4>{i.name}</h4>
                <div className="muted">Size: {i.size} · ₹{i.price.toLocaleString('en-IN')}</div>
                <div className="qty-picker" style={{ margin: 0 }}>
                  <button onClick={() => updateQty(i.product, i.size, i.qty - 1)}>−</button>
                  <span>{i.qty}</span>
                  <button onClick={() => updateQty(i.product, i.size, i.qty + 1)}>+</button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, color: 'var(--accent)' }}>
                  ₹{(i.price * i.qty).toLocaleString('en-IN')}
                </div>
                <button className="btn-outline btn btn-sm" style={{ marginTop: 12 }} onClick={() => removeItem(i.product, i.size)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
            <Link to="/shop" className="btn btn-outline btn-sm">← Continue Shopping</Link>
            <button className="btn-outline btn btn-sm btn-danger" onClick={clearCart}>Clear Bag</button>
          </div>
        </div>

        <div className="summary">
          <h3>Order Summary</h3>
          <div className="sum-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
          <div className="sum-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
          <div className="sum-row"><span>GST ({taxRate}%)</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
          <div className="sum-row total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>

          {/* Free delivery condition — premium communication */}
          <div className="free-ship-note">
            {remaining > 0 ? (
              <>
                <div className="free-ship-line">🚚 Add <b>₹{remaining.toLocaleString('en-IN')}</b> more for <b>FREE delivery</b></div>
                <div className="free-ship-track">
                  <div className="free-ship-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="free-ship-meta">Free delivery on orders over ₹{freeAbove.toLocaleString('en-IN')}</div>
              </>
            ) : (
              <div className="free-ship-line free-ship-locked">🎉 You've unlocked <b>FREE delivery</b> on this order!</div>
            )}
          </div>

          <button className="btn btn-block" style={{ marginTop: 20 }} onClick={() => navigate('/checkout')}>
            Proceed To Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
