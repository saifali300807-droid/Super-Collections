import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import { errMsg } from '../App';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setMsg({ type: 'err', text: 'Passwords do not match' });
    setLoading(true);
    try {
      const res = await api.put(`/auth/reset-password/${token}`, { password });
      setMsg({ type: 'ok', text: res.data.message });
      setDone(true);
    } catch (err) {
      setMsg({ type: 'err', text: errMsg(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <h2>Reset Password</h2>
      <p className="sub">Choose a new password for your account</p>
      {msg.text && <div className={`form-msg ${msg.type}`}>{msg.text}</div>}
      {done ? (
        <Link to="/login" className="btn btn-block">Go To Sign In</Link>
      ) : (
        <form onSubmit={submit}>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" required minLength={6} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 chars" />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" required value={confirm}
              onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
          </div>
          <button className="btn btn-block" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
      )}
    </div>
  );
}
