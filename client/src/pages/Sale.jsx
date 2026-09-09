import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import ProductCard, { Loader } from '../components/ProductCard';

const CATEGORIES = ['All', 'Suits', 'Kurtis', 'Lehengas', 'Sarees', 'Sharara Sets', 'Gowns', 'Dresses', 'Co-ord Sets', 'Tops'];
const DISCOUNT_CHIPS = [
  { label: 'All Sale', value: 0 },
  { label: '50%+ OFF', value: 50 },
  { label: '60%+ OFF', value: 60 },
  { label: '70%+ OFF', value: 70 },
];

const off = (p) =>
  p.comparePrice > p.price
    ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
    : 0;

export default function Sale() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [disc, setDisc] = useState(50); // user ke liye sirf 50%+ wale dikhte hain
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    api.get('/products', {
      params: { sale: true, minDiscount: 50, limit: 60 },
    })
      .then((r) => setProducts(r.data.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* client-side search + category + sort (server already filtered ≥50%) */
  const shown = useMemo(() => {
    let list = products.filter((p) => off(p) >= disc);
    if (category !== 'All') list = list.filter((p) => p.category === category);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.fabric || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q));
    }
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'discount') list = [...list].sort((a, b) => off(b) - off(a));
    else list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [products, search, category, disc, sort]);

  const maxOff = useMemo(() => (products.length ? Math.max(...products.map(off)) : 50), [products]);

  return (
    <>
      {/* Soft, elegant sale hero */}
      <div className="container" style={{ paddingTop: 38 }}>
        <div className="sale-hero">
          <span className="petal p1" aria-hidden="true">🌸</span>
          <span className="petal p2" aria-hidden="true">🌸</span>
          <span className="petal p3" aria-hidden="true">✨</span>
          <div className="sale-hero-eyebrow">Festive Season Special</div>
          <h1>Up To <em>50%+ Off</em> Sale</h1>
          <p>
            Sirf 50% se jyada discount wale handpicked suits, kurtis, lehengas &amp;
            sarees — prices that feel like a celebration. Jab tak stock hai!
          </p>
          <div className="sale-stats">
            <span>🏷️ <b>{products.length}</b> products on sale</span>
            <span>🔥 Up to <b>{maxOff}%</b> OFF</span>
            <span>🕐 Limited time only</span>
          </div>
        </div>
      </div>

      <div className="section container sale-page" style={{ paddingTop: 40 }}>
        <div className="section-head">
          <div className="eyebrow">Limited Time</div>
          <h2>Sale <em style={{ color: 'var(--accent)' }}>Collection</em></h2>
          <div className="line" />
        </div>

        {/* Search + filters + sort */}
        <div className="shop-toolbar">
          <div className="tool-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.4-4.4" />
            </svg>
            <input
              placeholder="Search sale items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="discount">Biggest Discount</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>

        <div className="disc-chips">
          {DISCOUNT_CHIPS.map((d) => (
            <button
              key={d.value}
              className={`disc-chip ${disc === d.value ? 'active' : ''}`}
              onClick={() => setDisc(d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader />
        ) : shown.length === 0 ? (
          <div className="empty">
            <h3>Abhi koi sale item nahi mila 🏷️</h3>
            <p>Naye offers ke liye thodi der baad dekhein — filter hata kar try karein.</p>
          </div>
        ) : (
          <div className="grid">
            {shown.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </>
  );
}
