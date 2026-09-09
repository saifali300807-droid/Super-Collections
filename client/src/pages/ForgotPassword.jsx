import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { errMsg } from '../App';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '', devUrl: null });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMsg({ type: 'ok', text: res.data.message, devUrl: res.data.devResetUrl });
    } catch (err) {
      setMsg({ type: 'err', text: errMsg(err), devUrl: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <h2>Forgot Password</h2>
      <p className="sub">Enter your email — we'll send a reset link</p>
      {msg.text && <div className={`form-msg ${msg.type}`}>{msg.text}</div>}
      {msg.devUrl && (
        <div className="form-msg ok" style={{ wordBreak: 'break-all' }}>
          <b>DEV LINK:</b> <a href={msg.devUrl} style={{ color: '#1a8a4a' }}>{msg.devUrl}</a>
        </div>
      )}
      <form onSubmit={submit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <button className="btn btn-block" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
      </form>
      <div className="form-link"><Link to="/login">← Back to Sign In</Link></div>
    </div>
  );
}
