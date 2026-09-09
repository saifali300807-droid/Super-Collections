import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast, errMsg } from '../App';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { name: form.name, email: form.email };
      if (form.password) body.password = form.password;
      const res = await api.put('/auth/profile', body);
      setUser(res.data.user);
      localStorage.setItem('sc_user', JSON.stringify(res.data.user));
      setForm({ ...form, password: '' });
      toast('Profile updated ✓');
    } catch (err) {
      toast(errMsg(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <h2>My Profile</h2>
      <p className="sub">
        {user?.role === 'admin' ? '👑 Admin Account' : 'Member'} ·{' '}
        {user?.isVerified ? '✅ Verified' : '⚠️ Not verified'}
      </p>
      <form onSubmit={submit}>
        <div className="form-group">
          <label>Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label>New Password (optional)</label>
          <input type="password" value={form.password} minLength={6}
            onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave blank to keep current" />
        </div>
        <button className="btn btn-block" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
}
