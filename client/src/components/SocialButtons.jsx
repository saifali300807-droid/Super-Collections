import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast, errMsg } from '../App';

/* Real Google sign-in activates as soon as this env key is set
   (Vercel env var). Without it the button runs in DEMO mode. */
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });

/* Stable per-browser demo identity — behaves like one real social account.
   Created once, reused on every click (no extra steps, per the flow design). */
const demoIdentity = () => {
  const key = 'sc_demo_google';
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved?.providerId) return saved;
  } catch { /* regenerate below */ }
  const rand = Math.random().toString(36).slice(2, 10);
  const id = {
    providerId: `demo-google-${rand}`,
    email: `google.user.${rand}@demo.local`,
    name: 'Google Demo User',
  };
  localStorage.setItem(key, JSON.stringify(id));
  return id;
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.1 3.7-8.6z" />
    <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-6-2.2-7-5.1L1.2 17C3.2 21.1 7.3 24 12 24z" />
    <path fill="#FBBC05" d="M5 14.3c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.2 6.9C.4 8.5 0 10.2 0 12s.4 3.5 1.2 5.1L5 14.3z" />
    <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l2.8-2.7C16 1.2 14.2 0 12 0 7.3 0 3.2 2.9 1.2 6.9L5 9.7c1-2.9 3.8-5 7-5z" />
  </svg>
);

export default function SocialButtons({ onDone }) {
  const { socialAuth } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const googleBtnRef = useRef(null);

  const handle = async (payload = {}) => {
    if (busy) return;
    setBusy(true);
    try {
      const data = await socialAuth('google', payload);
      toast(
        data.isNew
          ? `Welcome, ${data.user.name}! Account created & verified automatically 👑`
          : `Welcome back, ${data.user.name}! 👑`
      );
      onDone?.(data);
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  /* Real Google Sign-In (GIS) — renders the official button when configured.
     The returned credential (idToken) is verified server-side; the user
     never fills anything → fully automatic. */
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    loadScript('https://accounts.google.com/gsi/client')
      .then(() => {
        if (!googleBtnRef.current || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resp) => handle({ idToken: resp.credential }),
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline', size: 'large', width: 320, text: 'continue_with',
        });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="social-stack">
      {/* Google: real GIS button when configured, else one-tap demo button */}
      {GOOGLE_CLIENT_ID ? (
        <div ref={googleBtnRef} className="social-gis-slot" />
      ) : (
        <button
          type="button"
          className="btn btn-outline social-btn"
          disabled={busy}
          onClick={() => handle(demoIdentity())}
        >
          <GoogleIcon />
          {busy ? 'Connecting…' : 'Continue with Google'}
        </button>
      )}
      {!GOOGLE_CLIENT_ID && (
        <small className="social-demo-note">
          Demo mode — set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>client/.env</code> for real Google sign-in
        </small>
      )}
    </div>
  );
}