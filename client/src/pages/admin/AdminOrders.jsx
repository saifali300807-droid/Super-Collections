import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast, errMsg } from '../../App';
import { paymentLabel } from '../../utils/paymentLabel';

const STATUSES = ['Pending', 'Packed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const toast = useToast();

  const load = () => api.get('/admin/orders').then((res) => setOrders(res.data.orders)).catch(() => {});
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      toast(`Order marked ${status} ✓`);
      load();
    } catch (err) {
      toast(errMsg(err), 'error');
    }
  };

  const shown = filter === 'All' ? orders : orders.filter((o) => o.status === filter);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.isPaid ? o.totalPrice : 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  return (
    <>
      <div className="admin-toolbar">
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', margin: 0 }}>Orders</h1>
      </div>

      {/* Orders Info Bar */}
      <div className="order-stats-bar">
        <div className="order-stat">
          <span className="order-stat-value">{orders.length}</span>
          <span className="order-stat-label">Total Orders</span>
        </div>
        <div className="order-stat">
          <span className="order-stat-value">₹{totalRevenue.toLocaleString('en-IN')}</span>
          <span className="order-stat-label">Revenue</span>
        </div>
        <div className="order-stat">
          <span className="order-stat-value">{pendingCount}</span>
          <span className="order-stat-label">Pending</span>
        </div>
        <div className="order-stat">
          <span className="order-stat-value">{deliveredCount}</span>
          <span className="order-stat-label">Delivered</span>
        </div>
      </div>

      <div className="cat-strip" style={{ justifyContent: 'flex-start', marginBottom: 22 }}>
        {['All', ...STATUSES].map((s) => (
          <button key={s} className={`cat-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Change Status</th></tr>
          </thead>
          <tbody>
            {shown.map((o) => (
              <tr key={o._id}>
                <td data-label="Order">
                  <b>#{o.orderNumber}</b>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    {new Date(o.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </td>
                <td data-label="Customer">
                  {o.user?.name}
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{o.user?.email}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    📍 {o.shippingAddress.city}, {o.shippingAddress.state} — {o.shippingAddress.pincode}
                  </div>
                </td>
                <td data-label="Items" style={{ fontSize: '0.82rem' }}>
                  {o.items.map((i) => (
                    <div key={i.product + i.size}>{i.name} × {i.qty} ({i.size})</div>
                  ))}
                </td>
                <td data-label="Total"><b>₹{o.totalPrice.toLocaleString('en-IN')}</b></td>
                <td data-label="Payment">
                  {o.isPaid ? '✅ Paid' : o.paymentMethod === 'COD' ? 'COD' : `⏳ ${paymentLabel(o.paymentMethod)} (Pending)`}
                </td>
                <td data-label="Status"><span className={`badge ${o.status}`}>{o.status}</span></td>
                <td data-label="Change Status" style={{ borderBottom: 'none' }}>
                  <select className="status-select" value={o.status} onChange={(e) => setStatus(o._id, e.target.value)}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
