import React, { useEffect, useState } from 'react';
import api, { resolveAssetUrl } from '../../api/axios';
import { useToast, errMsg } from '../../App';

const uploadVideoFile = async (file) => {
  const formData = new FormData();
  formData.append('video', file);
  const res = await api.post('/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data.url;
};

export default function AdminSettings() {
  const toast = useToast();
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLight, setUploadingLight] = useState(false);
  const [uploadingDark, setUploadingDark] = useState(false);

  useEffect(() => {
    api.get('/settings').then((r) => {
      const d = r.data.settings || {};
      setS({
        heroVideos: { light: d.heroVideos?.light || '', dark: d.heroVideos?.dark || '' },
        hero: {
          eyebrow: d.hero?.eyebrow || '', title: d.hero?.title || '', subtitle: d.hero?.subtitle || '',
        },
        contact: {
          address: d.contact?.address || '', phone: d.contact?.phone || '',
          email: d.contact?.email || '', hours: d.contact?.hours || '',
          mapQuery: d.contact?.mapQuery || '',
        },
        commerce: {
          taxRate: Number(d.commerce?.taxRate) || 5,
          shippingRate: Number(d.commerce?.shippingRate) || 49,
          freeShippingAbove: Number(d.commerce?.freeShippingAbove) || 999,
        },
      });
    }).catch(() => toast('Settings load failed', 'error'));
  }, []);

  const set = (path, val) => setS((old) => {
    if (!old) return old;
    const [a, b] = path.split('.');
    return { ...old, [a]: { ...old[a], [b]: val } };
  });

  const handleVideoUpload = async (theme, file) => {
    if (!file) return;
    if (theme === 'light') setUploadingLight(true);
    else setUploadingDark(true);
    try {
      const url = await uploadVideoFile(file);
      set(`heroVideos.${theme}`, url);
      toast(`${theme === 'light' ? 'Light' : 'Dark'} theme video uploaded ✓`);
    } catch {
      toast('Video upload failed', 'error');
    } finally {
      if (theme === 'light') setUploadingLight(false);
      else setUploadingDark(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/settings', s);
      toast('Site settings saved ✓');
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!s) return <div className="loader-wrap"><div className="loader" /></div>;

  return (
    <>
      <div className="admin-toolbar">
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', margin: 0 }}>Site Settings</h1>
        <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
      </div>

      <div className="settings-grid admin-settings-grid">
        <div className="settings-card">
          <h3>🎬 Hero Videos (theme ke according)</h3>
          <p className="settings-hint">Apni video upload karo — light theme ke liye bright video, dark ke liye moody. Video na ho to hero me sirf poster image dikhega (koi demo video nahi).</p>
          <div className="form-group">
            <label>☀️ Light Theme Video</label>
            <div className="video-upload-row">
              <label className="video-upload-btn">
                {uploadingLight ? 'Uploading…' : '📁 Choose Video'}
                <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => handleVideoUpload('light', e.target.files[0])} />
              </label>
              {s.heroVideos.light && (
                <div className="video-preview">
                  <video key={s.heroVideos.light} src={resolveAssetUrl(s.heroVideos.light)} muted loop autoPlay playsInline preload="auto" style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                  <button className="video-clear-btn" onClick={() => set('heroVideos.light', '')}>✕</button>
                </div>
              )}
            </div>
          </div>
          <div className="form-group">
            <label>🌙 Dark Theme Video</label>
            <div className="video-upload-row">
              <label className="video-upload-btn">
                {uploadingDark ? 'Uploading…' : '📁 Choose Video'}
                <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => handleVideoUpload('dark', e.target.files[0])} />
              </label>
              {s.heroVideos.dark && (
                <div className="video-preview">
                  <video key={s.heroVideos.dark} src={resolveAssetUrl(s.heroVideos.dark)} muted loop autoPlay playsInline preload="auto" style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                  <button className="video-clear-btn" onClick={() => set('heroVideos.dark', '')}>✕</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h3>✍️ Hero Text / Description</h3>
          <div className="form-group">
            <label>Small Line (eyebrow)</label>
            <input value={s.hero.eyebrow} onChange={(e) => set('hero.eyebrow', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Main Title</label>
            <input value={s.hero.title} onChange={(e) => set('hero.title', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Subtitle</label>
            <textarea rows={3} value={s.hero.subtitle} onChange={(e) => set('hero.subtitle', e.target.value)} />
          </div>
        </div>

        <div className="settings-card">
          <h3>💵 Store Charges — GST &amp; Shipping</h3>
          <p className="settings-hint">Ye values directly cart, checkout aur order billing me use hoti hain. GST %, shipping charge aur free-delivery threshold yahan se control karo — code change ki zaroorat nahi.</p>
          <div className="form-row">
            <div className="form-group">
              <label>GST / Tax Rate (%)</label>
              <input type="number" min="0" max="100" step="0.5"
                value={s.commerce.taxRate}
                onChange={(e) => set('commerce.taxRate', Number(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label>Safe Delivery Charge (₹)</label>
              <input type="number" min="0" step="1"
                value={s.commerce.shippingRate}
                onChange={(e) => set('commerce.shippingRate', Number(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label>Free Delivery Above (₹)</label>
              <input type="number" min="0" step="1"
                value={s.commerce.freeShippingAbove}
                onChange={(e) => set('commerce.freeShippingAbove', Number(e.target.value) || 0)} />
            </div>
          </div>
          <p className="settings-hint" style={{ marginTop: 6 }}>Order total &lt; threshold → shipping charge lagta hai; uske barabar ya upar → FREE delivery.</p>
        </div>

        <div className="settings-card">
          <h3>📞 Contact Details &amp; Map</h3>
          <div className="form-group">
            <label>Address</label>
            <input value={s.contact.address} onChange={(e) => set('contact.address', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input value={s.contact.phone} onChange={(e) => set('contact.phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input value={s.contact.email} onChange={(e) => set('contact.email', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Opening Hours</label>
              <input value={s.contact.hours} onChange={(e) => set('contact.hours', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Map Location (Google Maps query)</label>
              <input value={s.contact.mapQuery} onChange={(e) => set('contact.mapQuery', e.target.value)} placeholder="e.g. Johari Bazaar, Jaipur" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
