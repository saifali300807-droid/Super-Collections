import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard, { Loader } from '../components/ProductCard';
import { useProductUpdates } from '../hooks/useSocket';

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(() => params.get('keyword') || '');
  const [categories, setCategories] = useState(['All']);
  const [pages, setPages] = useState(1);

  const category = params.get('category') || 'All';
  const featured = params.get('featured') || '';
  const sale = params.get('sale') || '';
  const sort = params.get('sort') || '';
  const page = Number(params.get('page') || 1);

  // Real-time updates handler
  const handleRealtimeUpdate = useCallback((type) => {
    if (type === 'product') {
      fetchProducts();
    }
  }, []);

  useProductUpdates(handleRealtimeUpdate);

  useEffect(() => {
    api.get('/settings').then((res) => {
      const circles = res.data.settings?.categoryCircles || [];
      const catNames = circles.map((c) => c.name).filter(Boolean);
      setCategories(['All', ...catNames]);
    }).catch(() => {});
  }, []);

  const fetchProducts = useCallback(() => {
    const q = { page, limit: 12 };
    if (category !== 'All') q.category = category;
    if (featured) q.featured = featured;
    if (sale) q.sale = sale;
    if (sort) q.sort = sort;
    if (keyword) q.keyword = keyword;
    setLoading(true);
    api.get('/products', { params: q })
      .then((res) => {
        setProducts(res.data.products);
        setPages(res.data.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [params, keyword]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* Sync the search box with the URL so a navbar search lands here */
  useEffect(() => {
    const urlKw = params.get('keyword') || '';
    if (urlKw !== keyword) setKeyword(urlKw);
  }, [params]);

  /* Small debounce → keep the keyword in the URL (search / filters live) */
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params);
      if (keyword && keyword.trim()) next.set('keyword', keyword.trim());
      else next.delete('keyword');
      if (next.toString() !== params.toString()) setParams(next, { replace: true });
    }, 450);
    return () => clearTimeout(t);
  }, [keyword]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'All') next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const setCategory = (c) => { setKeyword(''); update('category', c); };
  const setSort = (s) => update('sort', s);
  const setPage = (p) => {
    const next = new URLSearchParams(params);
    next.set('page', String(p));
    setParams(next);
  };

  return (
    <div className="section container" style={{ paddingTop: 46 }}>
      <div className="section-head">
        <div className="eyebrow">{sale ? 'Limited Time' : 'The Boutique'}</div>
        <h2>
          {sale ? (
            <>Sale <em style={{ color: 'var(--accent)' }}>Collection</em></>
          ) : featured ? 'Featured Collection' : category === 'All' ? 'All Collection' : category}
        </h2>
        <div className="line" />
      </div>

      <div className="cat-strip" style={{ marginBottom: 34 }}>
        {categories.map((c) => (
          <button key={c} className={`cat-chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="admin-toolbar" style={{ justifyContent: 'center' }}>
        <input
          placeholder="Search dresses, sarees, gowns..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select className="status-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="" style={{ fontWeight: 600, color: 'var(--accent)' }}>✨ Newest</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating">Top Rated</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <div className="empty"><h3>No products found</h3><p>Try a different search or category.</p></div>
      ) : (
        <div className="grid">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}

      {pages > 1 && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 40 }}>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} className={`cat-chip ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
