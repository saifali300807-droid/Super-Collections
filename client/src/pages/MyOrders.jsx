import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast, errMsg } from '../App';
import { Loader } from '../components/ProductCard';
import { paymentLabel } from '../utils/paymentLabel';
import { resolveAssetUrl } from '../api/axios';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    api.get('/orders/mine')
      .then((res) => setOrders(res.data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setOpenId(openId === id ? null : id);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await api.put(`/orders/${id}/cancel`);
      toast('Order cancelled');
      const res = await api.get('/orders/mine');
      setOrders(res.data.orders);
    } catch (err) {
      toast(errMsg(err), 'error');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container">
      <h1 className="page-title">My Orders</h1>
      {orders.length === 0 ? (
        <div className="empty">
          <h3>No orders yet</h3>
          <Link to="/shop" className="btn" style={{ marginTop: 16 }}>Start Shopping</Link>
        </div>
      ) : (
        <div className="my-orders-list">
          {orders.map((o) => {
            const cancelled = o.status === 'Cancelled';
            const isOpen = openId === o._id;
            const img = o.items[0]?.image;
            return (
              <div className={`oc-card ${isOpen ? 'open' : ''}`} key={o._id}>
                <div className="oc-row" onClick={() => toggle(o._id)}>
                  <div className="oc-left">
                    {img ? (
                      <img className="oc-thumb" src={resolveAssetUrl(img)} alt={o.items[0].name}
                        onError={(e) => (e.target.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=120&q=80')} />
                    ) : (
                      <div className="oc-thumb oc-thumb-fallback">📦</div>
                    )}
                    <div className="oc-meta">
                      <b className="oc-num">#{o.orderNumber}</b>
                      <span className="oc-date">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <b className="oc-total">₹{o.totalPrice.toLocaleString('en-IN')}</b>
                    </div>
                  </div>
                  <div className="oc-right">
                    <span className={`oc-badge ${cancelled ? 'Cancelled' : o.status}`}>
                      {cancelled ? 'Cancelled' : o.status}
                    </span>
                    <span className="oc-chevron">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isOpen && (
                  <div className="oc-detail">
                    <div className="oc-detail-grid">
                      <div className="oc-detail-col">
                        <div className="oc-detail-title">Delivery Address</div>
                        <div className="oc-detail-line"><b>Name:</b> {o.shippingAddress.fullName}</div>
                        <div className="oc-detail-line"><b>Phone:</b> {o.shippingAddress.phone}</div>
                        <div className="oc-detail-line"><b>Address:</b> {o.shippingAddress.address}</div>
                        <div className="oc-detail-line"><b>City:</b> {o.shippingAddress.city}, {o.shippingAddress.state}</div>
                        <div className="oc-detail-line"><b>Pincode:</b> {o.shippingAddress.pincode}</div>
                      </div>
                      <div className="oc-detail-col">
                        <div className="oc-detail-title">Status</div>
                        <div className="oc-status-vertical">
                          {['Order Placed', 'Packed', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                            const orderSteps = ['Order Placed', 'Packed', 'Processing', 'Shipped', 'Delivered'];
                            const cur = orderSteps.indexOf(o.status === 'Cancelled' ? 'Order Placed' : o.status);
                            const done = i <= cur;
                            return (
                              <div key={step} className={`oc-vs-step ${done ? 'done' : ''} ${cancelled ? 'cancelled' : ''}`}>
                                <span className="oc-vs-dot">{done && !cancelled ? '✓' : '●'}</span>
                                <span className="oc-vs-label">{step}</span>
                              </div>
                            );
                          })}
                        </div>
                        {cancelled && <div className="oc-cancelled-note">✕ This order was cancelled</div>}
                      </div>
                    </div>

                    <div className="oc-items-full">
                      <div className="oc-detail-title">Items</div>
                      {o.items.map((it, i) => (
                        <div className="oc-item-row" key={i}>
                          <span>{it.name} <em>({it.size})</em></span>
                          <span>× {it.qty}</span>
                          <span>₹{(it.price * it.qty).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    <div className="oc-detail-line oc-pay-line">
                      <b>Payment:</b> {o.isPaid ? '✅ Paid' : paymentLabel(o.paymentMethod)}
                    </div>

                    {['Pending', 'Packed', 'Processing'].includes(o.status) && (
                      <button className="btn-outline btn btn-sm btn-danger" style={{ marginTop: 12 }} onClick={() => cancel(o._id)}>Cancel Order</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
