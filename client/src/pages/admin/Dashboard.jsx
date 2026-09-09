import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Loader } from '../../components/ProductCard';
import { paymentLabel } from '../../utils/paymentLabel';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data.stats)).catch(() => {});
  }, []);

  if (!stats) return <Loader />;

  const cards = [
    { label: 'Total Revenue (Paid)', value: `₹${stats.revenue.toLocaleString('en-IN')}` },
    { label: 'Orders', value: stats.orders },
    { label: 'Customers', value: stats.users },
    { label: 'Products', value: stats.products },
    { label: 'Pending Orders', value: stats.pendingOrders },
    { label: 'Low Stock (≤5)', value: stats.lowStock },
  ];

  return (
    <>
      <h1>Dashboard</h1>
      <div className="stat-grid">
        {cards.map((c) => (
          <div className="stat-card" key={c.label}>
            <div className="label">{c.label}</div>
            <div className="value">{c.value}</div>
          </div>
        ))}
      </div>

      <h3 style={{ fontFamily: 'var(--serif)', marginBottom: 14 }}>Recent Orders</h3>
      <div className="table-wrap dashboard-orders">
        <table>
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Payment</th><th>Status</th></tr>
          </thead>
          <tbody>
            {stats.recentOrders.map((o) => (
              <tr key={o._id}>
                <td data-label="Order"><b>#{o.orderNumber}</b></td>
                <td data-label="Customer">{o.user?.name || '—'}</td>
                <td data-label="Date">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                <td data-label="Total">₹{o.totalPrice.toLocaleString('en-IN')}</td>
                <td data-label="Payment">{o.isPaid ? '✅ Paid' : paymentLabel(o.paymentMethod)}</td>
                <td data-label="Status"><span className={`badge ${o.status}`}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
