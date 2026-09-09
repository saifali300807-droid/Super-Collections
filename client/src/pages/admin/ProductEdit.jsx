import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useToast, errMsg } from '../../App';

const BLANK = {
  name: '', category: '', price: '', comparePrice: '', discount: '', fabric: '',
  description: '', mainImg: '', secondImg: '', sideImgs: '', video: '',
  countInStock: 10, sizes: 'XS,S,M,L,XL', isFeatured: false, isNewArrival: false,
  useVariants: false, variants: [],
};

/* ── Image upload widget — "Choose from files" instead of only typing URLs ── */
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

/* ── Video upload widget — "Choose from files" for video ── */
function VideoField({ label, value, onChange, hint }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const upload = async (files) => {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('video', files[0]);
      const res = await api.post('/upload/video', fd);
      onChange(res.data.url);
      toast('Video uploaded ✓');
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
        {busy ? '⏳ Uploading…' : '🎬 Choose Video'}
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          disabled={busy}
          onChange={(e) => upload(e.target.files)}
        />
      </span>
      {value && (
        <div style={{ marginTop: 8 }}>
          <video src={value} controls style={{ maxWidth: '300px', maxHeight: '180px' }} />
          <button type="button" className="btn btn-danger btn-sm" style={{ marginTop: 6 }}
            onClick={() => onChange('')}>✕ Remove Video</button>
        </div>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Uploaded video URL will appear here"
        readOnly
        style={{ marginTop: 8 }}
      />
      {hint && <small className="img-hint">{hint}</small>}
    </div>
  );
}

export default function ProductEdit() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch all categories from products + category circles from settings
    Promise.all([
      api.get('/products?limit=200'),
      api.get('/settings')
    ]).then(([productsRes, settingsRes]) => {
      const productCats = [...new Set(productsRes.data.products.map((p) => p.category).filter(Boolean))];
      const circles = settingsRes.data.settings?.categoryCircles || [];
      const circleCats = circles.map((c) => c.name).filter(Boolean);
      const allCats = [...new Set([...productCats, ...circleCats])];
      setCategories(allCats);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/${id}`)
      .then((res) => {
        const p = res.data.product;
        const imgs = p.images || [];
        const variants = (p.colorVariants || []).map((v) => ({
          color: v.color || '',
          mainImg: v.images?.[0] || '',
          sideImgs: (v.images || []).slice(1).join('\n'),
          video: v.video || '',
        }));
        setForm({
          name: p.name, category: p.category,
          price: String(p.price || ''),
          comparePrice: p.comparePrice ? String(p.comparePrice) : '',
          discount: p.comparePrice > p.price
            ? String(Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100))
            : '',
          fabric: p.fabric, description: p.description,
          mainImg: imgs[0] || '', secondImg: imgs[1] || '',
          sideImgs: imgs.slice(2).join('\n'),
          video: p.video || '',
          countInStock: p.countInStock, sizes: (p.sizes || []).join(','),
          isFeatured: p.isFeatured, isNewArrival: p.isNewArrival,
          useVariants: variants.length > 0, variants,
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  /* ── Price calculator: any 2 of (price, MRP, discount) → third. Rounded. ── */
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

  /* ── Variant helpers ── */
  const setVariant = (i, key, val) =>
    setForm((f) => ({ ...f, variants: f.variants.map((v, j) => (j === i ? { ...v, [key]: val } : v)) }));
  const addVariant = () => set('variants', [...form.variants, { color: '', mainImg: '', sideImgs: '', video: '' }]);
  const delVariant = (i) => set('variants', form.variants.filter((_, j) => j !== i));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const images = [form.mainImg, form.secondImg,
        ...form.sideImgs.split('\n')].map((s) => s.trim()).filter(Boolean);
      const colorVariants = form.useVariants
        ? form.variants
            .filter((v) => v.color.trim())
            .map((v) => ({
              color: v.color.trim(),
              images: [v.mainImg, ...v.sideImgs.split('\n')].map((s) => s.trim()).filter(Boolean),
              video: v.video || '',
            }))
        : [];
      const body = {
        name: form.name, category: form.category, fabric: form.fabric, description: form.description,
        price: Math.round(Number(form.price)),
        comparePrice: Math.round(Number(form.comparePrice)) || 0,
        countInStock: Number(form.countInStock),
        images, colorVariants,
        video: form.video || '',
        sizes: form.sizes.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
        isFeatured: form.isFeatured, isNewArrival: form.isNewArrival,
      };
      if (isEdit) await api.put(`/products/${id}`, body);
      else await api.post('/products', body);
      toast(isEdit ? 'Product updated ✓' : 'Product added ✓');
      navigate('/admin/products');
    } catch (err) {
      toast(errMsg(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loader-wrap"><div className="loader" /></div>;

  return (
    <>
      <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      <form className="form-page wide product-edit-form" style={{ margin: 0, boxShadow: 'none', maxWidth: 'none' }} onSubmit={submit}>
        <div className="form-row">
          <div className="form-group">
            <label>Product Name</label>
            <input required value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)}>
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* ── Price calculator ── */}
        <div className="price-calc">
          <div className="pc-head">🧮 Price Calculator — koi bhi 2 bharo, teesra khud calculate hoga (round off)</div>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label>New / Selling Price (₹)</label>
              <input type="number" required min="0" value={form.price}
                onChange={(e) => { set('price', e.target.value); calc('price'); }} />
            </div>
            <div className="form-group">
              <label>Old Price / MRP (₹)</label>
              <input type="number" min="0" value={form.comparePrice}
                onChange={(e) => { set('comparePrice', e.target.value); calc('comparePrice'); }} />
            </div>
            <div className="form-group">
              <label>Discount (%)</label>
              <input type="number" min="0" max="99" value={form.discount}
                onChange={(e) => { set('discount', e.target.value); calc('discount'); }} />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Stock Quantity</label>
            <input type="number" required min="0" value={form.countInStock} onChange={(e) => set('countInStock', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Fabric</label>
            <input value={form.fabric} onChange={(e) => set('fabric', e.target.value)} placeholder="e.g. Pure Silk" />
          </div>
        </div>

        {/* ── Product images ── */}
        <div className="img-section">
          <div className="img-section-title">📷 Product Images</div>
          <div className="form-row">
            <ImageField
              label="1 · Main Image (front)"
              value={form.mainImg}
              onChange={(v) => set('mainImg', v)}
              required
            />
            <ImageField
              label="2 · Second Main Image (hover preview)"
              value={form.secondImg}
              onChange={(v) => set('secondImg', v)}
            />
          </div>
          <ImageField
            label="3 · Side Images (side angles — multiple select karein)"
            value={form.sideImgs}
            onChange={(v) => set('sideImgs', v)}
            multi
            hint="Ye product page par thumbnails ban ke dikhti hain — customer hover karke dekhta hai"
          />
          <VideoField
            label="4 · Product Video (optional)"
            value={form.video}
            onChange={(v) => set('video', v)}
            hint="MP4/WebM/MOV — product page par video player me dikhega"
          />
        </div>
        {/* ── Colour variants (optional) ── */}
        <div className="img-section">
          <div className="img-section-title">🎨 Colour Variants (optional — admin ki choice)</div>
          <div className="form-check">
            <input type="checkbox" id="useVar" checked={form.useVariants}
              onChange={(e) => {
                set('useVariants', e.target.checked);
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
                  {v.mainImg && (
                    <img
                      className="img-preview"
                      src={v.mainImg}
                      alt=""
                      onError={(e) => { e.target.style.opacity = 0.25; }}
                    />
                  )}
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
              <VideoField
                label="Variant Video (optional)"
                value={v.video}
                onChange={(val) => setVariant(i, 'video', val)}
                hint="MP4/WebM/MOV — is variant ke liye alag video"
              />
            </div>
          ))}
          {form.useVariants && (
            <button type="button" className="btn btn-outline btn-sm" onClick={addVariant}>+ Add Colour Variant</button>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Sizes (comma separated)</label>
            <input value={form.sizes} onChange={(e) => set('sizes', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
        </div>
        <div className="form-check">
          <input type="checkbox" id="feat" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} />
          <label htmlFor="feat" style={{ textTransform: 'none', letterSpacing: 0 }}>⭐ Featured (homepage pe dikhayen)</label>
        </div>
        <div className="form-check">
          <input type="checkbox" id="new" checked={form.isNewArrival} onChange={(e) => set('isNewArrival', e.target.checked)} />
          <label htmlFor="new" style={{ textTransform: 'none', letterSpacing: 0 }}>🆕 New Arrival badge</label>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/products')}>Cancel</button>
        </div>
      </form>
    </>
  );
}
