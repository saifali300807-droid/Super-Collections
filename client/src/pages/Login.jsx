import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast, errMsg } from '../App';
import SocialButtons from '../components/SocialButtons';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast(`Welcome back, ${data.user.name}! 👑`);
      if (data.user.role === 'admin') navigate('/admin');
      else navigate(location.state?.from || '/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  /* Same one-tap flow as signup: logs in existing social users,
     or creates + auto-verifies the account if it's their first time */
  const onSocialDone = (data) => {
    if (data.user.role === 'admin') navigate('/admin');
    else navigate(location.state?.from || '/');
  };

  return (
    <div className="form-page">
      <h2>Welcome Back</h2>
      <p className="sub">Sign in to continue your elegance journey</p>
      {error && <div className="form-msg err">{error}</div>}

      <SocialButtons onDone={onSocialDone} />
      <div className="social-divider"><span>or sign in with email</span></div>

      <form onSubmit={submit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
        </div>
        <button className="btn btn-block" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
      <div className="form-link">
        <Link to="/forgot-password">Forgot Password?</Link>
      </div>
      <div className="form-link">
        New here? <Link to="/register">Create Account</Link>
      </div>
    </div>
  );
}
