import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import { Loader } from '../components/ProductCard';
import { paymentLabel } from '../utils/paymentLabel';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data.order)).catch(() => {});
  }, [id]);

  if (!order) return <Loader />;

  return (
    <div className="form-page" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3.4rem', marginBottom: 10 }}>👑</div>
      <h2>Thank You!</h2>
      <p className="sub">
        Order <b>#{order.orderNumber}</b> placed successfully.
      </p>
      <div className="form-msg ok" style={{ textAlign: 'left' }}>
        <b>Status:</b> {order.status} · <b>Payment:</b> {order.isPaid ? 'Paid ✓' : `${paymentLabel(order.paymentMethod)} (Pending)`}
        <br />
        <b>Total:</b> ₹{order.totalPrice.toLocaleString('en-IN')}
        <br />
        <b>Deliver to:</b> {order.shippingAddress.fullName}, {order.shippingAddress.address}, {order.shippingAddress.city} — {order.shippingAddress.pincode}
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/orders" className="btn">Track My Orders</Link>
        <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
      </div>
    </div>
  );
}
