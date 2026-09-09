import React, { useEffect, useMemo, useState } from 'react';
import api, { resolveAssetUrl } from '../../api/axios';
import { useToast, errMsg } from '../../App';

const fallbackImg = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&q=80';
const FILTERS = ['All', 'In Sale', 'Not In Sale'];

export default function AdminSales() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () =>
    api.get('/products?limit=200').then((r) => setProducts(r.data.products)).catch(() => {});

  useEffect(() => { load(); }, []);

  const shown = useMemo(() => products.filter((p) => {
    if (filter === 'In Sale' && !(p.comparePrice > p.price)) return false;
    if (filter === 'Not In Sale' && p.comparePrice > p.price) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [products, filter, search]);

  /* Toggle sale: put product on sale with a discount %, or remove it */
  const toggleSale = async (p) => {
    const inSale = p.comparePrice > p.price;
    setBusy(true);
    try {
      if (inSale) {
        await api.put(`/products/${p._id}`, { comparePrice: 0 });
        toast(`"${p.name}" sale se hata diya`);
      } else {
        const d = window.prompt(`"${p.name}" — kitne % discount? (5–90)`, '30');
        const disc = Math.round(Number(d));
        if (!disc || disc <= 0 || disc >= 100) { setBusy(false); return; }
        const newPrice = Math.round(p.comparePrice > p.price ? p.comparePrice : p.price);
        // keep current price as selling price, set MRP so that discount matches
        const mrp = Math.round(newPrice / (1 - disc / 100));
        await api.put(`/products/${p._id}`, { comparePrice: mrp, price: newPrice });
        toast(`"${p.name}" ab ${disc}% OFF sale mein 🏷️`);
      }
      await load();
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', marginBottom: 6 }}>Sale Manager</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 16 }}>
        Kaun se product sale mein hain — toggle karo. Sale wale products homepage banner aur Sale page par dikhte hain.
      </p>

      <div className="cat-strip" style={{ justifyContent: 'flex-start', marginBottom: 18 }}>
        {FILTERS.map((f) => (
          <button key={f} className={`cat-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
        <input
          className="sale-search"
          placeholder="Search product…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrap admin-sales-table">
        <table>
          <thead>
            <tr><th>Image</th><th>Name</th><th>Price</th><th>MRP</th><th>Discount</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {shown.map((p) => {
              const inSale = p.comparePrice > p.price;
              const disc = inSale ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0;
              return (
                <tr key={p._id}>
                  <td data-label="Image"><img src={resolveAssetUrl(p.images?.[0] || fallbackImg)} alt="" style={{ width: 44, height: 54, objectFit: 'cover', borderRadius: 8 }} onError={(e) => (e.target.src = fallbackImg)} /></td>
                  <td data-label="Name"><b>{p.name}</b></td>
                  <td data-label="Price">₹{p.price.toLocaleString('en-IN')}</td>
                  <td data-label="MRP">{p.comparePrice > p.price ? `₹${p.comparePrice.toLocaleString('en-IN')}` : '—'}</td>
                  <td data-label="Discount">{disc > 0 ? <span className="disc-pill">-{disc}%</span> : '—'}</td>
                  <td data-label="Status">{inSale ? <span className="pill on">🏷️ In Sale</span> : <span className="pill off">Not In Sale</span>}</td>
                  <td data-label="Action" style={{ borderBottom: 'none' }}>
                    <button className={`btn btn-sm ${inSale ? 'btn-outline' : ''}`} disabled={busy} onClick={() => toggleSale(p)}>
                      {inSale ? 'Remove From Sale' : 'Put On Sale'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {shown.length === 0 && <div className="empty" style={{ padding: '40px 0' }}><h3>No products</h3></div>}
      </div>
    </>
  );
}
