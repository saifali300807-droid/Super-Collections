import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { resolveAssetUrl } from '../../api/axios';
import { useToast, errMsg } from '../../App';

const BLANK = {
  name: '', category: '', price: '', comparePrice: '', discount: '', fabric: '',
  description: '', mainImg: '', secondImg: '', sideImgs: '',
  countInStock: 10, sizes: 'XS,S,M,L,XL', isFeatured: false, isNewArrival: false,
  useVariants: false, variants: [],
};

function ImageField({ label, value, onChange, multi = false, required = false, hint }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const urls = value ? value.split('\n').map((s) => s.trim()).filter(Boolean) : [];

  const upload = async (files) => {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      const fd = new FormData();
      if (multi) {
        [...files].slice(0, 8).forEach((f) => fd.append('images', f));
        const res = await api.post('/upload/many', fd);
        onChange([...urls, ...res.data.urls].join('\n'));
      } else {
        fd.append('image', files[0]);
        const res = await api.post('/upload', fd);
        onChange(res.data.url);
      }
      toast('Image uploaded ✓');
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="img-field form-group">
      <label>{label}</label>
      <span className="fake-upload-btn">
        {busy ? '⏳ Uploading…' : '📁 Choose File'}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multi}
          disabled={busy}
          onChange={(e) => upload(e.target.files)}
        />
      </span>
      {!multi && value && (
        <img
          className="img-preview"
          src={value}
          alt=""
          onError={(e) => { e.target.style.opacity = 0.25; }}
        />
      )}
      {multi ? (
        <textarea
          rows={Math.min(3, Math.max(1, urls.length ? 2 : 1))}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={'Uploaded images will appear here'} />
      ) : (
        <input
          value={value}
          required={required && !value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Uploaded image URL will appear here"
          readOnly
        />
      )}
      {hint && <small className="img-hint">{hint}</small>}
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState('');
  const toast = useToast();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [editModal, setEditModal] = useState({ open: false, product: null });
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/products', { params: { limit: 100, keyword } })
      .then((res) => setProducts(res.data.products))
      .catch(() => {});
    // Load categories for dropdown
    api.get('/settings').then((res) => {
      const circles = res.data.settings?.categoryCircles || [];
      const catNames = circles.map((c) => c.name).filter(Boolean);
      const productCats = [...new Set(products.map((p) => p.category).filter(Boolean))];
      setCategories([...new Set([...catNames, ...productCats])]);
    }).catch(() => {});
  };
  useEffect(load, [keyword]);

  const remove = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast('Product deleted 🗑');
      load();
    } catch (err) {
      toast(errMsg(err), 'error');
    }
  };

  const openEdit = async (p) => {
    setForm({
      name: p.name, category: p.category,
      price: String(p.price || ''),
      comparePrice: p.comparePrice ? String(p.comparePrice) : '',
      discount: p.comparePrice > p.price
        ? String(Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100))
        : '',
      fabric: p.fabric, description: p.description,
      mainImg: p.images?.[0] || '', secondImg: p.images?.[1] || '',
      sideImgs: (p.images || []).slice(2).join('\n'),
      countInStock: p.countInStock, sizes: (p.sizes || []).join(','),
      isFeatured: p.isFeatured, isNewArrival: p.isNewArrival,
      useVariants: (p.colorVariants || []).length > 0,
      variants: (p.colorVariants || []).map((v) => ({
        color: v.color || '',
        mainImg: v.images?.[0] || '',
        sideImgs: (v.images || []).slice(1).join('\n'),
      })),
    });
    setEditModal({ open: true, product: p });
  };

  const closeEdit = () => {
    setEditModal({ open: false, product: null });
    setForm(BLANK);
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const calc = (changed) => setForm((f) => {
    const P = parseFloat(f.price), C = parseFloat(f.comparePrice), D = parseFloat(f.discount);
    const n = { ...f };
    if (changed === 'price' && !Number.isNaN(P) && P > 0) {
      if (!Number.isNaN(D) && D > 0 && D < 100) n.comparePrice = String(Math.round(P / (1 - D / 100)));
      else if (!Number.isNaN(C) && C > P) n.discount = String(Math.round(((C - P) / C) * 100));
    } else if (changed === 'comparePrice' && !Number.isNaN(C) && C > 0) {
      if (!Number.isNaN(P) && P > 0 && P <= C) n.discount = String(Math.round(((C - P) / C) * 100));
      else if (!Number.isNaN(D) && D > 0 && D < 100) n.price = String(Math.round(C * (1 - D / 100)));
    } else if (changed === 'discount' && !Number.isNaN(D) && D >= 0 && D < 100) {
      if (!Number.isNaN(P) && P > 0) n.comparePrice = String(Math.round(P / (1 - D / 100)));
      else if (!Number.isNaN(C) && C > 0) n.price = String(Math.round(C * (1 - D / 100)));
    }
    return n;
  });

  const setVariant = (i, key, val) =>
    setForm((f) => ({ ...f, variants: f.variants.map((v, j) => (j === i ? { ...v, [key]: val } : v)) }));
  const addVariant = () => setField('variants', [...form.variants, { color: '', mainImg: '', sideImgs: '' }]);
  const delVariant = (i) => setField('variants', form.variants.filter((_, j) => j !== i));

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editModal.product) return;
    setSaving(true);
    try {
      const images = [form.mainImg, form.secondImg, ...form.sideImgs.split('\n')].map((s) => s.trim()).filter(Boolean);
      const colorVariants = form.useVariants
        ? form.variants
            .filter((v) => v.color.trim())
            .map((v) => ({
              color: v.color.trim(),
              images: [v.mainImg, ...v.sideImgs.split('\n')].map((s) => s.trim()).filter(Boolean),
            }))
        : [];
      const body = {
        name: form.name, category: form.category, fabric: form.fabric, description: form.description,
        price: Math.round(Number(form.price)),
        comparePrice: Math.round(Number(form.comparePrice)) || 0,
        countInStock: Number(form.countInStock),
        images, colorVariants,
        sizes: form.sizes.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
        isFeatured: form.isFeatured, isNewArrival: form.isNewArrival,
      };
      await api.put(`/products/${editModal.product._id}`, body);
      toast('Product updated ✓');
      closeEdit();
      load();
    } catch (err) {
      toast(errMsg(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1>Products</h1>
      <div className="admin-toolbar">
        <input placeholder="Search products..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <Link to="/admin/products/new" className="btn btn-sm">＋ Add Product</Link>
      </div>
      <div className="table-wrap admin-products-table">
        <table>
          <thead>
            <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td data-label="Image">
                  {p.images?.[0] && (
                    <img src={resolveAssetUrl(p.images[0])} alt="" style={{ width: 46, height: 58, objectFit: 'cover', borderRadius: 8 }}
                      onError={(e) => (e.target.style.opacity = 0.3)} />
                  )}
                </td>
                <td data-label="Name"><b>{p.name}</b></td>
                <td data-label="Category">{p.category}</td>
                <td data-label="Price">₹{p.price.toLocaleString('en-IN')}</td>
                <td data-label="Stock" style={{ color: p.countInStock === 0 ? '#c0392b' : p.countInStock <= 5 ? '#b4750a' : 'inherit' }}>
                  {p.countInStock}
                </td>
                <td data-label="Rating">★ {p.rating}</td>
                <td data-label="Actions" style={{ borderBottom: 'none' }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn-icon" onClick={() => openEdit(p)} title="Edit product" aria-label="Edit product">✏️</button>
                    <button className="btn btn-sm btn-danger" onClick={() => remove(p._id, p.name)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editModal.open && (
        <div className="modal-backdrop" onClick={closeEdit}>
          <div className="modal-card product-edit-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeEdit} aria-label="Close">✕</button>
            <h3 className="modal-title">Edit Product: {editModal.product?.name}</h3>
            <form className="form-page wide product-edit-form" onSubmit={submitEdit} style={{ margin: 0, boxShadow: 'none', maxWidth: 'none', padding: '20px 24px' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input required value={form.name} onChange={(e) => setField('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setField('category', e.target.value)}>
                    <option value="">Select Category</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Price calculator */}
              <div className="price-calc">
                <div className="pc-head">🧮 Price Calculator — koi bhi 2 bharo, teesra khud calculate hoga (round off)</div>
                <div className="form-row" style={{ marginBottom: 0 }}>
                  <div className="form-group">
                    <label>New / Selling Price (₹)</label>
                    <input type="number" required min="0" value={form.price}
                      onChange={(e) => { setField('price', e.target.value); calc('price'); }} />
                  </div>
                  <div className="form-group">
                    <label>Old Price / MRP (₹)</label>
                    <input type="number" min="0" value={form.comparePrice}
                      onChange={(e) => { setField('comparePrice', e.target.value); calc('comparePrice'); }} />
                  </div>
                  <div className="form-group">
                    <label>Discount (%)</label>
                    <input type="number" min="0" max="99" value={form.discount}
                      onChange={(e) => { setField('discount', e.target.value); calc('discount'); }} />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input type="number" required min="0" value={form.countInStock} onChange={(e) => setField('countInStock', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Fabric</label>
                  <input value={form.fabric} onChange={(e) => setField('fabric', e.target.value)} placeholder="e.g. Pure Silk" />
                </div>
              </div>

              {/* Product images */}
              <div className="img-section">
                <div className="img-section-title">📷 Product Images</div>
                <div className="form-row">
                  <ImageField
                    label="1 · Main Image (front)"
                    value={form.mainImg}
                    onChange={(v) => setField('mainImg', v)}
                    required
                  />
                  <ImageField
                    label="2 · Second Main Image (hover preview)"
                    value={form.secondImg}
                    onChange={(v) => setField('secondImg', v)}
                  />
                </div>
                <ImageField
                  label="3 · Side Images (side angles — multiple select karein)"
                  value={form.sideImgs}
                  onChange={(v) => setField('sideImgs', v)}
                  multi
                  hint="Ye product page par thumbnails ban ke dikhti hain — customer hover karke dekhta hai"
                />
              </div>

              {/* Colour variants */}
              <div className="img-section">
                <div className="img-section-title">🎨 Colour Variants (optional — admin ki choice)</div>
                <div className="form-check">
                  <input type="checkbox" id="useVar" checked={form.useVariants}
                    onChange={(e) => {
                      setField('useVariants', e.target.checked);
                      if (e.target.checked && form.variants.length === 0) addVariant();
                    }} />
                  <label htmlFor="useVar" style={{ textTransform: 'none', letterSpacing: 0 }}>
                    Is product ke colour variants hain (same design, different colour + apni images)
                  </label>
                </div>
                {form.useVariants && form.variants.map((v, i) => (
                  <div className="variant-box" key={i}>
                    <div className="variant-head">
                      <b>Variant {i + 1}</b>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => delVariant(i)}>Remove ✕</button>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Colour Name</label>
                        <input value={v.color} onChange={(e) => setVariant(i, 'color', e.target.value)} placeholder="e.g. Maroon" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Variant Main Image</label>
                        <span className="fake-upload-btn">
                          📁 Choose File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const fd = new FormData();
                              fd.append('image', f);
                              api.post('/upload', fd)
                                .then((res) => setVariant(i, 'mainImg', res.data.url))
                                .catch((er) => toast(errMsg(er), 'error'));
                              e.target.value = '';
                            }}
                          />
                        </span>
                        <input value={v.mainImg} onChange={(e) => setVariant(i, 'mainImg', e.target.value)}
                          placeholder="Uploaded image URL will appear here"
                          readOnly />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Variant Side Images (multiple select karein)</label>
                      <ImageField
                        label=""
                        value={v.sideImgs}
                        onChange={(val) => setVariant(i, 'sideImgs', val)}
                        multi
                        hint="Ye variant page par thumbnails ban ke dikhti hain"
                      />
                    </div>
                  </div>
                ))}
                {form.useVariants && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={addVariant}>+ Add Colour Variant</button>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sizes (comma separated)</label>
                  <input value={form.sizes} onChange={(e) => setField('sizes', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows={4} value={form.description} onChange={(e) => setField('description', e.target.value)} />
                </div>
              </div>
              <div className="form-check">
                <input type="checkbox" id="feat" checked={form.isFeatured} onChange={(e) => setField('isFeatured', e.target.checked)} />
                <label htmlFor="feat" style={{ textTransform: 'none', letterSpacing: 0 }}>⭐ Featured (homepage pe dikhayen)</label>
              </div>
              <div className="form-check">
                <input type="checkbox" id="new" checked={form.isNewArrival} onChange={(e) => setField('isNewArrival', e.target.checked)} />
                <label htmlFor="new" style={{ textTransform: 'none', letterSpacing: 0 }}>🆕 New Arrival badge</label>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={closeEdit}>Cancel</button>
                <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
