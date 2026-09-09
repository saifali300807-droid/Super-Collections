import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast, errMsg } from '../App';
import SocialButtons from '../components/SocialButtons';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      const data = await register(form.name, form.email, form.password);
      if (data.devVerifyCode) {
        navigate('/verify-email', { state: { devVerifyCode: data.devVerifyCode, email: form.email } });
      } else {
        toast('Account created! Please check your email for the 6-digit verification code 👑');
        navigate('/verify-email', { state: { email: form.email } });
      }
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  /* Social accounts are verified automatically by the provider —
     straight to the shop, no /verify-email step */
  const onSocialDone = (data) => {
    navigate(data.user.role === 'admin' ? '/admin' : '/');
  };

  return (
    <div className="form-page">
      <h2>Join Super Collection</h2>
      <p className="sub">Create your account — luxury awaits</p>
      {error && <div className="form-msg err">{error}</div>}

      {/* ── Option 1 · Social sign-up — one tap, auto-verified ── */}
      <SocialButtons onDone={onSocialDone} />
      <div className="social-divider"><span>or sign up with email</span></div>

      {/* ── Option 2 · Standard form — account identified by email ── */}
      <form onSubmit={submit}>
        <div className="form-group">
          <label>Full Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Password</label>
            <input type="password" required minLength={6} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 chars" />
          </div>
          <div className="form-group">
            <label>Confirm</label>
            <input type="password" required value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Repeat" />
          </div>
        </div>
        <button className="btn btn-block" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
      </form>
      <div className="form-link">
        Already a member? <Link to="/login">Sign In</Link>
      </div>
    </div>
  );
}
