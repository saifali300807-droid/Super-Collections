import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

/* ── Super Collection · Premium Confirm Dialog ───────────────────
   Native window.confirm ki jagah — brand-matched, smooth, professional.
   Usage:
     const confirm = useConfirm();
     const ok = await confirm({ title: 'Delete product?', message: '...', danger: true, confirmText: 'Delete' });
     if (!ok) return;
   (opts as plain string bhi chalega — sirf message ke liye) */

const ConfirmContext = createContext(() => Promise.resolve(false));
export const useConfirm = () => useContext(ConfirmContext);

const ICONS = { danger: '🗑️', warning: '⚠️', info: '💡' };

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setState(typeof opts === 'string' ? { message: opts } : opts);
    });
  }, []);

  const close = useCallback((result) => {
    resolver.current?.(result);
    resolver.current = null;
    setState(null);
  }, []);

  /* Escape = cancel; overlay click = cancel; Enter = confirm */
  useEffect(() => {
    if (!state) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [state, close]);

  const kind = state?.danger ? 'danger' : state?.kind || 'info';

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="cm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) close(false); }}>
          <div className={`cm-box cm-${kind}`} role="dialog" aria-modal="true">
            <span className="cm-icon">{state.icon || ICONS[kind]}</span>
            <h3 className="cm-title">{state.title || 'Are you sure?'}</h3>
            {state.message && <p className="cm-msg">{state.message}</p>}
            <div className="cm-actions">
              <button className="cm-btn cm-cancel" onClick={() => close(false)}>
                {state.cancelText || 'Cancel'}
              </button>
              <button
                className={`cm-btn cm-ok ${kind === 'danger' ? 'cm-ok-danger' : 'cm-ok-primary'}`}
                onClick={() => close(true)}
                autoFocus
              >
                {state.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export default ConfirmProvider;