import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sc_user')) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      /* Auth httpOnly cookie se hoti hai — /auth/me cookie ke saath chalti hai.
         Cookie invalid/expired ho to server 401 dega → logout. */
      api
        .get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('sc_user', JSON.stringify(res.data.user));
        })
        .catch(() => logout(false))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) localStorage.setItem('sc_token', res.data.token);
    localStorage.setItem('sc_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.token) localStorage.setItem('sc_token', res.data.token);
    localStorage.setItem('sc_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  /* One-tap Google/Apple sign-in (also creates the account if new —
     auto-verified by the provider, no email-code step) */
  const socialAuth = async (provider, payload = {}) => {
    const res = await api.post('/auth/social', { provider, ...payload });
    if (res.data.token) localStorage.setItem('sc_token', res.data.token);
    localStorage.setItem('sc_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  /* Server httpOnly cookie clear karta hai — JS usse delete nahi kar sakti */
  const logout = async (redirect = true) => {
    try {
      await api.post('/auth/logout');
    } catch { /* cookie already gone */ }
    localStorage.removeItem('sc_token');
    localStorage.removeItem('sc_user');
    setUser(null);
    if (redirect) window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, socialAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
