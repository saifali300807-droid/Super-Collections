import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast, errMsg, useConfirm } from '../../App';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const { user: me } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [selectedUser, setSelectedUser] = useState(null);

  const load = () => api.get('/admin/users').then((res) => setUsers(res.data.users)).catch(() => {});
  useEffect(() => { load(); }, []);

  const update = async (id, body, msg) => {
    try {
      await api.put(`/admin/users/${id}`, body);
      toast(msg);
      load();
      if (selectedUser?._id === id) setSelectedUser({ ...selectedUser, ...body });
    } catch (err) {
      toast(errMsg(err), 'error');
    }
  };

  const remove = async (id, name) => {
    const ok = await confirm({
      title: 'Delete this user?',
      message: `User "${name}" will be permanently removed from the store. Their past orders will remain in records.`,
      danger: true,
      confirmText: 'Yes, Delete',
    });
    if (!ok) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast('User deleted 🗑');
      load();
      if (selectedUser?._id === id) setSelectedUser(null);
    } catch (err) {
      toast(errMsg(err), 'error');
    }
  };

  const openDetails = (u) => setSelectedUser(u);
  const closeDetails = () => setSelectedUser(null);

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const verifiedCount = users.filter((u) => u.isVerified).length;
  const blockedCount = users.filter((u) => u.isBlocked).length;

  return (
    <>
      <div className="admin-toolbar">
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', margin: 0 }}>Users</h1>
      </div>

      {/* Users Info Bar */}
      <div className="order-stats-bar">
        <div className="order-stat">
          <span className="order-stat-value">{users.length}</span>
          <span className="order-stat-label">Total Users</span>
        </div>
        <div className="order-stat">
          <span className="order-stat-value">{adminCount}</span>
          <span className="order-stat-label">Admins</span>
        </div>
        <div className="order-stat">
          <span className="order-stat-value">{verifiedCount}</span>
          <span className="order-stat-label">Verified</span>
        </div>
        <div className="order-stat">
          <span className="order-stat-value">{blockedCount}</span>
          <span className="order-stat-label">Blocked</span>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>S.No.</th><th>Name</th><th style={{ width: '100px' }}>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u._id} onClick={() => openDetails(u)} style={{ cursor: 'pointer', opacity: u._id === me._id ? 0.5 : 1 }}>
                <td data-label="S.No.">{idx + 1}</td>
                <td data-label="Name"><b>{u.name}</b>{u._id === me._id && <em style={{ color: 'var(--muted)', marginLeft: 8 }}> (you)</em>}</td>
                <td data-label="Actions" style={{ borderBottom: 'none', textAlign: 'center' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>View →</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details Modal/Card */}
      {selectedUser && (
        <div className="user-details-backdrop" onClick={closeDetails}>
          <div className="user-details-card" onClick={(e) => e.stopPropagation()}>
            <button className="user-details-close" onClick={closeDetails} aria-label="Close">✕</button>
            <div className="user-details-header">
              <div className="user-avatar">{selectedUser.name.charAt(0).toUpperCase()}</div>
              <div>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', margin: 0 }}>{selectedUser.name}</h2>
                <p style={{ color: 'var(--muted)', margin: '4px 0 0' }}>{selectedUser.email}</p>
              </div>
            </div>
            <div className="user-details-body">
              <div className="detail-row">
                <span className="detail-label">Role</span>
                <span className="detail-value">
                  {selectedUser.role === 'admin' ? '👑 Admin' : '👤 User'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Verified</span>
                <span className="detail-value">{selectedUser.isVerified ? '✅ Yes' : '⚠️ No'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className="detail-value">
                  {selectedUser.isBlocked
                    ? <span className="badge Cancelled">Blocked</span>
                    : <span className="badge Delivered">Active</span>}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Joined</span>
                <span className="detail-value">{new Date(selectedUser.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Last Login</span>
                <span className="detail-value">{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString('en-IN') : 'Never'}</span>
              </div>
            </div>
            {selectedUser._id !== me._id && (
              <div className="user-details-actions">
                <button className="btn-outline btn btn-sm"
                  onClick={() => update(selectedUser._id, { role: selectedUser.role === 'admin' ? 'user' : 'admin' }, 'Role updated ✓')}>
                  {selectedUser.role === 'admin' ? 'Make User' : 'Make Admin'}
                </button>
                <button className="btn-outline btn btn-sm"
                  onClick={() => update(selectedUser._id, { isBlocked: !selectedUser.isBlocked }, selectedUser.isBlocked ? 'User unblocked ✓' : 'User blocked 🚫')}>
                  {selectedUser.isBlocked ? 'Unblock' : 'Block'}
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => remove(selectedUser._id, selectedUser.name)}>Delete</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}