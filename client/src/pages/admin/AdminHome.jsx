import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { resolveAssetUrl } from '../../api/axios';
import { useToast } from '../../App';

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data.url;
};

/* Product ki pehli available image dhoondo (main ya colour variant) */
const pickImg = (p) => p?.images?.[0] || p?.colorVariants?.[0]?.images?.[0] || '';

export default function AdminHome() {
  const showToast = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [slider, setSlider] = useState([]);
  const [circles, setCircles] = useState([]);
  const [saving, setSaving] = useState(false);

  /* ── Add-slide picker modal ── */
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerStep, setPickerStep] = useState('ask');      // ask | list
  const [pickerQuery, setPickerQuery] = useState('');
  const [picking, setPicking] = useState([]);               // currently selected ids

  /* ── Add-category modal ── */
  const [catOpen, setCatOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catImg, setCatImg] = useState('');
  const [catBusy, setCatBusy] = useState(false);

  /* ── Expanded category in "existing categories" list ── */
  const [expandedCat, setExpandedCat] = useState(null);

  useEffect(() => {
    api.get('/products?limit=200').then((r) => setProducts(r.data.products)).catch(() => {});
    api.get('/settings').then((r) => {
      const s = r.data.settings || {};
      setSlider(s.sliderProducts || []);
      setCircles(s.categoryCircles || []);
    }).catch(() => {});
  }, []);

  /* DB me jo categories already exist karti hain — image + naam + product count ke saath */
  const existingCategories = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (!p?.category) return;
      if (!map[p.category]) {
        map[p.category] = { name: p.category, count: 0, image: pickImg(p) };
      }
      map[p.category].count += 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [products]);

  /* ── Slider helpers ── */
  const removeSlide = (idx) => setSlider((sl) => sl.filter((_, i) => i !== idx));
  const toggleSlide = (id) =>
    setSlider((sl) => (sl.some((x) => x._id === id) ? sl.filter((x) => x._id !== id) : [...sl]));
  const inSlider = (id) => slider.some((x) => x._id === id);

  /* ── Slide picker ── */
  const openPicker = () => { setPickerOpen(true); setPickerStep('ask'); setPicking([]); setPickerQuery(''); };
  const closePicker = () => setPickerOpen(false);
  const togglePick = (id) =>
    setPicking((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev]));

  /* Selected products ko slider me add karo (jo already hain unhe skip) */
  const addSelectedSlides = () => {
    const fresh = picking.map((id) => products.find((p) => p._id === id)).filter(Boolean);
    if (fresh.length === 0) return showToast('Koi product select nahi kiya', 'error');
    setSlider((sl) => {
      const merged = [...sl];
      fresh.forEach((p) => {
        if (!merged.some((x) => x._id === p._id)) merged.push(p);
      });
      return merged;
    });
    showToast(`${fresh.length} slide(s) added ✓`);
    closePicker();
  };

  /* ── Category helpers ── */
  const setC = (i, key, val) =>
    setCircles((cs) => cs.map((c, j) => (j === i ? { ...c, [key]: val } : c)));
  const deleteCategory = (index) => setCircles((cs) => cs.filter((_, j) => j !== index));

  const openCat = () => { setCatOpen(true); setCatName(''); setCatImg(''); };
  const submitCat = () => {
    const name = catName.trim();
    if (!name) return showToast('Category ka naam likho', 'error');
    if (circles.some((c) => c.name.toLowerCase() === name.toLowerCase()))
      return showToast('Ye category pehle se add hai', 'error');
    setCircles((cs) => [...cs, { name, image: catImg || '', category: name }]);
    setCatOpen(false);
    setCatImg('');
    showToast('Category saved ✓');
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/settings', { sliderProducts: slider.map((p) => p._id), categoryCircles: circles });
      showToast('Homepage updated ✓');
    } catch (e) {
      showToast(e.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* Search filter for the product picker grid */
  const filteredPicks = products.filter((p) =>
    !pickerQuery.trim() || (p.name || '').toLowerCase().includes(pickerQuery.trim().toLowerCase())
  );

  return (
    <>
      <div className="admin-toolbar">
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', margin: 0 }}>Homepage Manager</h1>
        <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
      </div>
      {/* ── Sliders — custom slides add/remove; warna automatic RANDOM slides ── */}
      <div className="admin-section" style={{ marginBottom: 30 }}>
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.3rem', margin: '18px 0 6px' }}>Sliders</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 14 }}>
          Default me saare products me se <b>RANDOM 16 slides</b> automatic chalti hain.
          Chahe to neeche se slides add karo — <b>Save Changes</b> ke baad sirf yahi slides chalengi.
        </p>

        {slider.length > 0 ? (
          <div className="slide-manage-list">
            {slider.map((p, i) => (
              <div className="slide-manage-row" key={p._id || i}>
                {pickImg(p) && <img src={resolveAssetUrl(pickImg(p))} alt="" onError={(e) => (e.target.style.opacity = 0.3)} />}
                <div className="sm-info">
                  <b>{p.name}</b>
                  <span>₹{Number(p.price).toLocaleString('en-IN')}</span>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => removeSlide(i)} title="Delete this slide">✕ Delete</button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginBottom: 10 }}>
            ℹ️ Abhi automatic random mode ON hai — koi bhi slide add karte ho to custom mode chalu ho jayega.
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn" onClick={openPicker}>＋ Add Slide</button>
          {slider.length > 0 && (
            <button className="btn btn-outline btn-sm" onClick={() => setSlider([])}>
              Clear All (back to auto mode)
            </button>
          )}
        </div>
      </div>
      {/* ── Manage Categories ── */}
      <div className="admin-section">
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.3rem', margin: '18px 0 6px' }}>Manage Categories</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 14 }}>
          Neeche sabhi categories ki list hai — kisi bhi category par click karo to uske andar ke products dikh jayenge.
        </p>

        <button className="btn" onClick={openCat} style={{ marginBottom: 20 }}>＋ Save Category</button>

        {/* DB me already exist karti hui categories — click karo to products dikh jayenge */}
        {existingCategories.length > 0 && (
          <>
            <h4 style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', margin: '0 0 10px' }}>
              Categories ({existingCategories.length})
            </h4>
            <div className="existing-cat-grid">
              {existingCategories.map((c) => (
                <div key={c.name} className={`existing-cat-card ${expandedCat === c.name ? 'open' : ''}`}
                  onClick={() => setExpandedCat((prev) => (prev === c.name ? null : c.name))}
                  title={`${c.name} — ${c.count} product${c.count > 1 ? 's' : ''} — click to view`}>
                  {c.image ? (
                    <img src={resolveAssetUrl(c.image)} alt={c.name} onError={(e) => (e.target.style.opacity = 0.3)} />
                  ) : (
                    <span className="cat-avatar">{c.name.slice(0, 1)}</span>
                  )}
                  <div className="existing-cat-info">
                    <b>{c.name}</b>
                    <span>{c.count} product{c.count > 1 ? 's' : ''}</span>
                  </div>
                  <span className="cat-chevron">{expandedCat === c.name ? '−' : '+'}</span>
                </div>
              ))}
            </div>

            {/* Expanded category → uske andar ke products */}
            {expandedCat && (
              <div className="cat-expanded">
                <div className="cat-expanded-head"><b>{expandedCat}</b> — sabhi products</div>
                {products.filter((p) => p.category === expandedCat).map((p) => (
                  <div className="cat-prod-row" key={p._id}>
                    {pickImg(p) && <img src={resolveAssetUrl(pickImg(p))} alt="" onError={(e) => (e.target.style.opacity = 0.3)} />}
                    <span className="cpr-name">{p.name}</span>
                    <span className="cpr-price">₹{Number(p.price).toLocaleString('en-IN')}</span>
                    <button className="btn btn-outline btn-sm" onClick={() => toggleSlide(p._id)}>
                      {inSlider(p._id) ? '✓ In Slider' : '＋ Add to Slider'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Custom category circles (homepage par dikhte hain) — edit/delete ── */}
        {circles.length > 0 && (
          <div style={{ marginTop: 26 }}>
            <h4 style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', marginBottom: 10 }}>Homepage Category Circles</h4>
            {circles.map((c, i) => (
              <div className="circle-row" key={i}>
                {c.image ? (
                  <img src={resolveAssetUrl(c.image)} alt="" className="circle-preview" onError={(e) => (e.target.style.opacity = 0.3)} />
                ) : (
                  <span className="circle-preview circle-avatar">{c.name?.slice(0, 1) || '?'}</span>
                )}
                <input placeholder="Name" value={c.name || ''} onChange={(e) => setC(i, 'name', e.target.value)} />
                <button className="btn-icon" onClick={() => setCircles((cs) => cs.filter((_, j) => j !== i))} title="Delete category" aria-label="Delete category">🗑</button>
              </div>
            ))}
          </div>
        )}

        <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: 22, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          ℹ️ Custom slider me jitni slides add ki hain wahi chalengi. List khaali rakho to saare products me se random slides automatic chalengi.
        </p>
      </div>
      {/* ══════════ Add-Slide Modal ══════════ */}
      {pickerOpen && (
        <div className="modal-backdrop" onClick={closePicker}>
          <div className="modal-card slide-picker" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closePicker} aria-label="Close">✕</button>

            {pickerStep === 'ask' && (
              <>
                <h3 className="modal-title">Add Slide</h3>
                <p className="modal-sub">Product pehle se existing hai ya naya add karna hai?</p>
                <div className="ask-grid">
                  <button className="ask-btn" onClick={() => setPickerStep('list')}>
                    <span className="ask-icon">👗</span>
                    <b>Existing Product</b>
                    <span>Saare products me se select karo</span>
                  </button>
                  <button className="ask-btn" onClick={() => navigate('/admin/products/new')}>
                    <span className="ask-icon">➕</span>
                    <b>New Product</b>
                    <span>Add product form khulega</span>
                  </button>
                </div>
              </>
            )}

            {pickerStep === 'list' && (
              <>
                <h3 className="modal-title">Select Products for Slider</h3>
                <p className="modal-sub">Simple click se select, wapas click se deselect — jo select hoga wo slider me add hoga.</p>
                <input
                  className="pp-search"
                  placeholder="🔍 Search products…"
                  value={pickerQuery}
                  onChange={(e) => setPickerQuery(e.target.value)}
                  autoFocus
                />
                <div className="pp-grid">
                  {filteredPicks.length === 0 && (
                    <div className="empty" style={{ gridColumn: '1 / -1' }}>
                      <h3>Koi product nahi mila</h3>
                    </div>
                  )}
                  {filteredPicks.map((p) => {
                    const selected = picking.includes(p._id);
                    const already = inSlider(p._id) && !picking.includes(p._id);
                    return (
                      <div key={p._id}
                        className={`pp-card ${selected ? 'selected' : ''} ${already ? 'in-slider' : ''}`}
                        onClick={() => togglePick(p._id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePick(p._id); } }}
                      >
                        {pickImg(p) ? (
                          <img src={resolveAssetUrl(pickImg(p))} alt={p.name} loading="lazy" onError={(e) => (e.target.style.display = 'none')} />
                        ) : (
                          <span className="pp-ph">{p.name.slice(0, 1)}</span>
                        )}
                        <span className="pp-check">{selected ? '✓' : ''}</span>
                        <div className="pp-info">
                          <b className="pp-name">{p.name}</b>
                          <span className="pp-price">₹{Number(p.price).toLocaleString('en-IN')}</span>
                          {already && <span className="pp-already">already in slider</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="modal-footer">
                  <button className="btn-outline btn btn-sm" onClick={closePicker}>Cancel</button>
                  <button className="btn btn-sm" onClick={addSelectedSlides} disabled={picking.length === 0}>
                    Add Selected ({picking.length})
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* ══════════ Add-Category Modal ══════════ */}
      {catOpen && (
        <div className="modal-backdrop" onClick={() => setCatOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setCatOpen(false)} aria-label="Close">✕</button>
            <h3 className="modal-title">Save New Category</h3>
            <p className="modal-sub">Naam aur image — bas itna hi.</p>

            <div className="form-group">
              <label>Category Name *</label>
              <input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Anarkali Suits"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Image Upload</label>
              {catImg ? (
                <div className="cat-image-preview">
                  <img src={resolveAssetUrl(catImg)} alt="preview" />
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => setCatImg('')}>✕ Remove</button>
                </div>
              ) : (
                <label className="fake-upload-btn" style={{ marginBottom: 0 }}>
                  📁 Upload Image
                  <input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setCatBusy(true);
                    try {
                      const url = await uploadImage(file);
                      setCatImg(url);
                      showToast('Image uploaded ✓');
                    } catch {
                      showToast('Upload failed', 'error');
                    } finally {
                      setCatBusy(false);
                    }
                  }} />
                </label>
              )}
              {catBusy && <small>Uploading…</small>}
            </div>

            <div className="modal-footer">
              <button className="btn-outline btn btn-sm" onClick={() => setCatOpen(false)}>Cancel</button>
              <button className="btn btn-sm" onClick={submitCat} disabled={!catName.trim()}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}