import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

/* Guest (login nahi) cart browser localStorage me 'sc_cart_guest' par rehti hai.
   'sc_cart' purana SHARED key tha — usse SAB users ek hi cart dekhte the (bug).
   Ab use migrate karke delete kar dete hain; logged-in cart server/DB me hai. */
const GUEST_KEY = 'sc_cart_guest';
const LEGACY_KEY = 'sc_cart';

const migrateLegacyCart = () => {
  try {
    if (localStorage.getItem(GUEST_KEY) === null) {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) localStorage.setItem(GUEST_KEY, legacy);
      localStorage.removeItem(LEGACY_KEY);
    }
  } catch { /* storage unavailable */ }
};

const loadGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY)) || [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items) => {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(items));
  } catch { /* storage blocked */ }
};

migrateLegacyCart();

/* ── PER-USER CART ─────────────────────────────────────────────────────────
   Ab HAR user ki cart alag hai:
   • Guest (login nahi) → browser localStorage ('sc_cart_guest')
   • Logged-in user     → server DB (User.cart) — account-cookie se identify
   Login/logout par cart isi hisaab se switch hoti hai; kisi doosre user ka
   cart kabhi nahi dikhta (admin ka bi alag hai). */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const userId = user?._id;

  const [items, setItemsState] = useState([]);
  const itemsRef = useRef([]);
  const dirtyRef = useRef(false); // fetch ke dauraan mutation hua → stale response ignore
  const setItems = (next) => {
    itemsRef.current = next;
    setItemsState(next);
  };

  // Login/logout par cart switch karo — logged-in: server cart, guest: local cart
  useEffect(() => {
    if (!userId) {
      setItems(loadGuestCart());
      return;
    }
    dirtyRef.current = false;
    let cancelled = false;
    api
      .get('/cart')
      .then((res) => {
        // Bich me user ne kuch add/remove kiya ho to usko overwrite mat karo
        if (!cancelled && !dirtyRef.current) setItems(res.data.items || []);
      })
      .catch(() => {
        if (!cancelled && !dirtyRef.current) setItems([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line
  }, [userId]);

  // Har mutation ke baad save — logged-in: server, guest: localStorage
  const persist = (next) => {
    dirtyRef.current = true;
    if (!userId) {
      saveGuestCart(next);
      return;
    }
    api.put('/cart', { items: next }).catch(() => {
      /* server offline/error → cart memory me rahega, agli mutation par re-sync */
    });
  };

  const addItem = (product, size, qty = 1) => {
    const prev = itemsRef.current;
    const idx = prev.findIndex((i) => i.product === product._id && i.size === size);
    const next =
      idx > -1
        ? prev.map((i, j) => (j === idx ? { ...i, qty: i.qty + qty } : i))
        : [
            ...prev,
            {
              product: product._id,
              name: product.name,
              image: product.images[0] || '',
              price: product.price,
              size,
              qty,
            },
          ];
    setItems(next);
    persist(next);
  };

  const updateQty = (product, size, qty) => {
    const next =
      qty <= 0
        ? itemsRef.current.filter((i) => !(i.product === product && i.size === size))
        : itemsRef.current.map((i) => (i.product === product && i.size === size ? { ...i, qty } : i));
    setItems(next);
    persist(next);
  };

  const removeItem = (product, size) => {
    const next = itemsRef.current.filter((i) => !(i.product === product && i.size === size));
    setItems(next);
    persist(next);
  };

  const clearCart = () => {
    setItems([]);
    saveGuestCart([]);
    if (userId) api.delete('/cart').catch(() => {});
  };

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
