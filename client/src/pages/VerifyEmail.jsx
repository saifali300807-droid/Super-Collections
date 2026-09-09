import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../App';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { setUser } = useAuth();
  const devCode = location.state?.devVerifyCode;
  const email = location.state?.email || '';

  const [code, setCode] = useState(devCode || '');
  const [state, setState] = useState({ loading: false, ok: false, message: '' });

  const submit = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast('Please enter a valid 6-digit code', 'error');
      return;
    }
    setState({ loading: true, ok: false, message: '' });
    try {
      const res = await api.post('/auth/verify-email', { code });
      // Verify ho gaya → fresh user object lo (isVerified: true)
      // taaki navbar ka "Resend / Get link" banner turant gayab ho jaye
      try {
        const me = await api.get('/auth/me');
        setUser(me.data.user);
        localStorage.setItem('sc_user', JSON.stringify(me.data.user));
      } catch { /* cookie expire ho to koi baat nahi */ }
      setState({ loading: false, ok: true, message: res.data.message });
      toast('Email verified successfully! 👑');
      // Register ke waqt hi session cookie set ho chuki hai — user already
      // logged-in hai, isliye dobara login page bhejne ki zaroorat nahi.
      // Seedha shop par le jao (professional UX: verification = seamless).
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed';
      setState({ loading: false, ok: false, message: msg });
      toast(msg, 'error');
    }
  };

  return (
    <div className="form-page" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: 14 }}>📬</div>
      <h2>Verify Your Email</h2>
      <p className="sub">
        We've sent a 6-digit verification code to <b>{email}</b>.
        Enter it below to activate your account.
      </p>
      {devCode && (
        <div className="form-msg ok" style={{ textAlign: 'left', marginBottom: 20 }}>
          <b>DEV MODE:</b> SMTP not configured, so code is shown here:
          <br />
          <code style={{ color: '#1a8a4a', fontSize: '1.2rem', letterSpacing: '0.3em' }}>{devCode}</code>
        </div>
      )}
      <form onSubmit={submit} style={{ maxWidth: 300, margin: '0 auto' }}>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label>Verification Code</label>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.2rem' }}
            autoComplete="one-time-code"
            required
            autoFocus
            disabled={state.loading}
          />
        </div>
        {state.message && (
          <div className={`form-msg ${state.ok ? 'ok' : 'err'}`} style={{ marginBottom: 12 }}>
            {state.message}
          </div>
        )}
        <button className="btn btn-block" disabled={state.loading}>
          {state.loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
      <p style={{ marginTop: 20, color: 'var(--muted)', fontSize: '0.85rem' }}>
        Didn't receive the code? <Link to="/register" style={{ color: 'var(--accent)' }}>Sign up again</Link>
      </p>
    </div>
  );
}
