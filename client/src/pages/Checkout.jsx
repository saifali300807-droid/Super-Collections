import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCommerce } from '../hooks/useCommerce';
import { useToast, errMsg } from '../App';

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const config = useCommerce();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [address, setAddress] = useState({
    fullName: user?.name || '', phone: '', address: '', city: '', state: '', pincode: '',
  });

  const freeAbove = Number(config.freeShippingAbove) || 999;
  const shipRate = Number(config.shippingRate) || 99;
  const taxRate = Number(config.taxRate) || 5;

  const shipping = subtotal >= freeAbove ? 0 : shipRate;
  const tax = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + shipping + tax;

  if (items.length === 0)
    return (
      <div className="empty">
        <h3>Nothing to checkout</h3>
        <Link to="/shop" className="btn" style={{ marginTop: 16 }}>Shop Now</Link>
      </div>
    );

  const handlePay = async (order) => {
    const payRes = await api.post('/payments/razorpay', { amount: order.totalPrice });

    if (payRes.data.demo) {
      // ── DEMO MODE (payment gateway keys not configured) ──
      const ok = window.confirm(
        `DEMO PAYMENT MODE 💳\n\nPayment gateway keys set nahi hain, isliye ye simulated payment hai.\nAsli UPI/Card payment ke liye server/.env me RAZORPAY_KEY_ID aur RAZORPAY_KEY_SECRET set karke server restart karein.\n\nOrder Total: ₹${order.totalPrice.toLocaleString('en-IN')}\n\nProceed with demo payment?`
      );
      if (!ok) return;
      await api.put(`/orders/${order._id}/pay`, { id: 'demo_' + Date.now(), demo: true });
      clearCart();
      toast('Demo payment successful! 🎉');
      navigate(`/order-success/${order._id}`);
      return;
    }

    // ── REAL RAZORPAY CHECKOUT ──
    await loadRazorpay();
    const options = {
      key: payRes.data.keyId,
      amount: payRes.data.rzpOrder.amount,
      currency: 'INR',
      name: 'Super Collection',
      description: 'Luxury Girls Wear',
      order_id: payRes.data.rzpOrder.id,
      prefill: { name: address.fullName, email: user.email, contact: address.phone },
      theme: { color: '#b98a2f' },
      handler: async (response) => {
        await api.post('/payments/verify', response);
        await api.put(`/orders/${order._id}/pay`, {
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
        clearCart();
        toast('Payment successful! 🎉');
        navigate(`/order-success/${order._id}`);
      },
      modal: { ondismiss: () => toast('Payment cancelled — order saved as Pending', 'error') },
    };
    new window.Razorpay(options).open();
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(address.phone)) return setError('Please enter a valid 10-digit phone number');
    if (!/^\d{6}$/.test(address.pincode)) return setError('Please enter a valid 6-digit pincode');

    setLoading(true);
    try {
      const res = await api.post('/orders', {
        items: items.map((i) => ({ product: i.product, size: i.size, qty: i.qty })),
        shippingAddress: address,
        paymentMethod,
      });

      if (paymentMethod === 'COD') {
        clearCart();
        toast('Order placed! Pay on delivery 💰');
        navigate(`/order-success/${res.data.order._id}`);
      } else {
        await handlePay(res.data.order);
      }
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">Checkout</h1>
      <div className="cart-layout checkout-page">
        <form className="form-page wide" style={{ margin: 0, boxShadow: 'none' }} onSubmit={submit}>
          <h3 style={{ fontFamily: 'var(--serif)', marginBottom: 18 }}>Shipping Details</h3>
          {error && <div className="form-msg err">{error}</div>}
          {[
            ['fullName', 'Full Name'],
            ['phone', 'Phone (10 digits)'],
            ['address', 'Address (house, street, area)'],
            ['city', 'City'],
            ['state', 'State'],
            ['pincode', 'Pincode'],
          ].map(([k, label]) => (
            <div className="form-group" key={k}>
              <label>{label}</label>
              <input required value={address[k]} onChange={(e) => setAddress({ ...address, [k]: e.target.value })} />
            </div>
          ))}

          <h3 style={{ fontFamily: 'var(--serif)', margin: '22px 0 14px' }}>Payment Method</h3>
          <label className="form-check">
            <input type="radio" checked={paymentMethod === 'Razorpay'} onChange={() => setPaymentMethod('Razorpay')} />
            💳 Online Pay (UPI · Card · NetBanking)
          </label>
          <label className="form-check">
            <input type="radio" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
            📦 Cash on Delivery
          </label>
          <button className="btn btn-block" style={{ marginTop: 22 }} disabled={loading}>
            {loading
              ? 'Placing order...'
              : paymentMethod === 'COD'
                ? `Place Order · ₹${total.toLocaleString('en-IN')}`
                : `Pay Now · ₹${total.toLocaleString('en-IN')}`}
          </button>
        </form>

        <div className="summary checkout-summary">
          <h3>Your Order</h3>
          {items.map((i) => (
            <div className="sum-row" key={`${i.product}-${i.size}`}>
              <span>{i.name} × {i.qty} <em style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>({i.size})</em></span>
              <span>₹{(i.price * i.qty).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div className="sum-row"><span>Safe Delivery</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
          <div className="sum-row"><span>GST ({taxRate}%)</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
          <div className="sum-row total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
          {shipping === 0 ? (
            <div className="free-ship-line free-ship-locked" style={{ marginTop: 8 }}>🚚 Free delivery unlocked for this order</div>
          ) : (
            <div className="free-ship-line" style={{ marginTop: 8 }}>
              🚚 Free delivery on orders over ₹{freeAbove.toLocaleString('en-IN')} — add ₹{(freeAbove - subtotal).toLocaleString('en-IN')} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
