import { useEffect, useState } from 'react';
import api from '../api/axios';

const DEFAULT_COMMERCE = { taxRate: 5, shippingRate: 99, freeShippingAbove: 999 };

/* Settings.commerce (GST + shipping rules) — server orderController bhi inhi
   values se totals calculate karta hai, isliye summary aur actual order bill
   kabhi mismatch nahi karte. Fetch once, then cache module-level. */
let cached = null;

export const useCommerce = () => {
  const [commerce, setCommerce] = useState(cached || DEFAULT_COMMERCE);

  useEffect(() => {
    if (cached) return;
    api.get('/settings/commerce')
      .then((r) => {
        const c = r.data?.commerce || DEFAULT_COMMERCE;
        cached = {
          taxRate: Number(c.taxRate) || DEFAULT_COMMERCE.taxRate,
          shippingRate: Number(c.shippingRate) || DEFAULT_COMMERCE.shippingRate,
          freeShippingAbove: Number(c.freeShippingAbove) || DEFAULT_COMMERCE.freeShippingAbove,
        };
        setCommerce(cached);
      })
      .catch(() => {});
  }, []);

  return commerce;
};

export default useCommerce;