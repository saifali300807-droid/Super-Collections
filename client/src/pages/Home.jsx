import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { resolveAssetUrl } from '../api/axios';
import ProductCard from '../components/ProductCard';
import { useTheme } from '../context/ThemeContext';
import { useProductUpdates } from '../hooks/useSocket';

/* ── Theme-aware hero poster (image background — koi demo video NAHI hai).
   Hero video SIRF tab chalega jab admin ne Settings me apni video upload ki ho. ── */
const HERO_POSTERS = {
  light: '',
  dark: '',
};

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Home() {
  const { theme } = useTheme();
  const mode = theme === 'dark' ? 'dark' : 'light';
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [pool, setPool] = useState([]);            // saare products (random slider ke liye)
  const [manualSlides, setManualSlides] = useState([]); // admin ne custom slides set ki hain to wahi
  const [circles, setCircles] = useState([]);
  const [site, setSite] = useState({ hero: null, heroVideos: { light: '', dark: '' } });
  const [videoIdx, setVideoIdx] = useState(0);
  const navigate = useNavigate();

  // Real-time updates handler
  /* Valid circles filter — DB kabhi-kabhi invalid image string store kar deta hai
   (e.g. "/uploads/[object Object]") jo 404 lavta hai. Unhe nikal do. */
const validCircle = (c) => c && c.name && c.image && !String(c.image).includes('[object') && String(c.image).trim() !== '';
const validCircles = (arr) => (Array.isArray(arr) ? arr : []).filter(validCircle);

  const handleRealtimeUpdate = useCallback((type, data) => {
    if (type === 'product') {
      loadData(); // Refresh product data
    } else if (type === 'settings') {
      // Update settings directly
      const nextManual = Array.isArray(data.sliderProducts) ? data.sliderProducts.filter((p) => p?._id) : [];
      setManualSlides((prev) => (JSON.stringify(prev.map((p) => p?._id)) === JSON.stringify(nextManual.map((p) => p?._id)) ? prev : nextManual));
      const nextCircles = Array.isArray(data.categoryCircles) ? data.categoryCircles : [];
      setCircles((prev) => (JSON.stringify(prev) === JSON.stringify(nextCircles) ? prev : nextCircles));
      setSite((prev) => {
        const next = { hero: data.hero || null, heroVideos: data.heroVideos || { light: '', dark: '' } };
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
    }
  }, []);

  useProductUpdates(handleRealtimeUpdate);

  /* Restart the source chain whenever the theme flips */
  useEffect(() => { setVideoIdx(0); }, [mode]);

  /* ── Live updates: har 15 second me data refresh — bina refresh ke changes dikhte hain ── */
  const loadData = useCallback(() => {
    api.get('/products?featured=true&limit=8').then((r) => {
      const next = r.data.products || [];
      setFeatured((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    }).catch(() => {});
    /* Saare products — slider pool. Admin naya product add karte hi pool badlega. */
    api.get('/products?limit=100').then((res) => {
      const next = res.data.products || [];
      setPool((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
      const nextNew = next.filter((p) => p.isNewArrival).slice(0, 4);
      setNewArrivals((prev) => (JSON.stringify(prev) === JSON.stringify(nextNew) ? prev : nextNew));
    }).catch(() => {});
    api.get('/settings').then((r) => {
      const s = r.data.settings || {};
      const nextManual = Array.isArray(s.sliderProducts) ? s.sliderProducts.filter((p) => p?._id) : [];
      setManualSlides((prev) => (JSON.stringify(prev.map((p) => p?._id)) === JSON.stringify(nextManual.map((p) => p?._id)) ? prev : nextManual));
      const nextCircles = Array.isArray(s.categoryCircles) ? s.categoryCircles : [];
      setCircles((prev) => (JSON.stringify(prev) === JSON.stringify(nextCircles) ? prev : nextCircles));
      setSite((prev) => {
        const next = { hero: s.hero || null, heroVideos: s.heroVideos || { light: '', dark: '' } };
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 30000); // Fallback polling every 30s
    /* tab wapas aane par turant refresh */
    const onVisible = () => { if (document.visibilityState === 'visible') loadData(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [loadData]);

  /* Admin video URL — relative URL (/uploads/xxx) ko backend origin ke saath
     full URL banao (resolveAssetUrl VITE_API_URL/http://localhost:5000 handle karta hai). */
  const videoSrc = site.heroVideos[mode] || '';
  const sources = videoSrc ? [resolveAssetUrl(videoSrc)] : [];
  const heroText = {
    eyebrow: site.hero?.eyebrow || 'Traditional · Ethnic · Handpicked',
    title: site.hero?.title || 'Tradition You Can Wear',
    subtitle: site.hero?.subtitle || "Suits, kurtis, lehengas & banarasi sarees — every thread woven with India's timeless craft. Heritage that never fades.",
  };
  const heroPoster = HERO_POSTERS[mode];

  /* ── SLIDER LOGIC ──
     • Admin ne custom slides set ki hain → wahi dikhengi (change/replace kar sakta hai)
     • Warna automatic: saare products me se RANDOM 16 slides (hamesha variety) ── */
  /* Admin ne category circles set ki hain → wahi dikhengi. Agar nahi set ki
     to products se categories derive karke circles banao (representative image
     sabse pehle wale product ka) — section kabhi khali nahi rehta. */
  const derivedCircles = useMemo(() => {
    const byCat = new Map();
    for (const p of pool) {
      if (!p.category) continue;
      if (!byCat.has(p.category)) {
        byCat.set(p.category, { name: p.category, category: p.category, image: p.images?.[0] || '' });
      }
    }
    return [...byCat.values()];
  }, [pool]);

  const slides = useMemo(() => {
    if (manualSlides.length > 0) return manualSlides;
    if (pool.length === 0) return [];
    return [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(16, pool.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualSlides, pool]);

  /* Seamless loop — agar slides kam hain to track ko screen se lamba karne ke liye repeat karo.
     Track width viewport se chhoti hogi to animation ke end me khali jagah dikhti hai (gap). */
  const MIN_SLIDE_CARDS = 8;
  const loopReps = Math.max(2, Math.ceil(MIN_SLIDE_CARDS / Math.max(slides.length, 1)));
  const loopSlides = Array.from({ length: loopReps }, () => slides).flat();

  return (
    <>
      <section className="hero">
        {heroPoster && (
          <img className="hero-poster" src={heroPoster} alt="" aria-hidden="true" />
        )}
        {!reducedMotion && videoIdx < sources.length && (
          <video
            key={`${mode}-${videoIdx}`}
            className="hero-video"
            src={sources[videoIdx]}
            autoPlay muted loop playsInline preload="metadata"
            onError={() => setVideoIdx((i) => i + 1)}
          />
        )}
        <div className="hero-scrim" />
        <div className="hero-content">
          <div className="hero-eyebrow">{heroText.eyebrow}</div>
          <h1>{heroText.title}</h1>
          <p>{heroText.subtitle}</p>
          <div className="hero-cta">
            <Link to="/shop" className="btn">Explore Collection</Link>
            <Link to="/sale" className="btn btn-outline">Sale · 50%+ Off</Link>
          </div>
        </div>
      </section>

      {/* ── Auto-sliding product rail (automatic: latest products, infinite loop) ── */}
      {slides.length > 0 && (
        <section className="slider-section" aria-label="Featured slider">
          <div className="slider-window">
            <div className={`slider-track ${reducedMotion ? 'paused' : ''}`}>
              {[...loopSlides, ...loopSlides].map((p, i) => (
                <Link key={`${p._id}-${i}`} to={`/product/${p._id}`} className="slide-card">
                  {p.images?.[0] && (
                    <img
                      src={resolveAssetUrl(p.images[0])}
                      alt={p.name}
                      loading="lazy"
                      onError={(e) => (e.target.style.display = 'none')}
                    />
                  )}
                  <span className="slide-info">
                    <b>{p.name}</b>
                    <i>₹{Number(p.price).toLocaleString('en-IN')}</i>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Category circles — circular images + naam neeche ── */}
      {(validCircles(circles).length > 0 || derivedCircles.length > 0) && (
        <section className="section container" style={{ paddingTop: 48 }}>
          <div className="section-head">
            <div className="eyebrow">Traditional Collection</div>
            <h2>Shop By Category</h2>
            <div className="line" />
          </div>
          <div className="cat-circles">
            {(validCircles(circles).length > 0 ? validCircles(circles) : derivedCircles).map((c, i) => (
              <button
                key={`${c.name}-${i}`}
                className="cat-circle"
                onClick={() => navigate(`/shop?category=${encodeURIComponent(c.category || c.name)}`)}
                title={`View all ${c.name}`}
              >
                <span className="cat-circle-img">
                  {c.image ? (
                    <img src={resolveAssetUrl(c.image)} alt="" loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }} />
                  ) : null}
                  <span className="cat-circle-fallback" style={c.image ? { display: 'none' } : {}}>
                    {c.name.slice(0, 1)}
                  </span>
                </span>
                <span className="cat-circle-name">{c.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="section container" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <div className="eyebrow">Handpicked</div>
          <h2>Featured Pieces</h2>
          <div className="line" />
        </div>
        <Link to="/shop?featured=true" className="section-more">View All Featured →</Link>
        <div className="grid">
          {featured.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {newArrivals.length > 0 && (
        <section className="section container" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <div className="eyebrow">Just Dropped</div>
            <h2>New Arrivals</h2>
            <div className="line" />
          </div>
          <Link to="/shop" className="section-more">View All New Arrivals →</Link>
          <div className="grid">
            {newArrivals.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── Sale banner ── */}
      <section className="container" style={{ paddingTop: 8 }}>
        <div className="sale-banner">
          <span className="sale-flare" aria-hidden="true" />
          <span className="sale-flare two" aria-hidden="true" />
          <div className="sale-copy">
            <div className="sale-eyebrow">Limited Time Only</div>
            <h2>Mega <em>Sale</em> — 50%+ Off</h2>
            <p>Sirf 50% se zyada discount wale suits, kurtis, lehengas &amp; sarees — festive prices on handpicked traditional wear.</p>
            <Link to="/sale" className="btn sale-btn">Shop The Sale</Link>
          </div>
          <div className="sale-badge" aria-hidden="true">
            <span>50%+</span>
          </div>
        </div>
      </section>

      {/* ── Contact strip ── */}
      <section className="container" style={{ paddingTop: 40 }}>
        <div className="contact-strip">
          <div>
            <div className="eyebrow">We&apos;d Love To Hear From You</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.6rem, 3.4vw, 2.3rem)', marginTop: 8 }}>
              Visit Our Boutique Or Drop Us A Line
            </h2>
          </div>
          <Link to="/contact" className="btn btn-outline contact-btn">Contact Us</Link>
        </div>
      </section>

      {/* ── Simple Features ── */}
      <section className="section container" style={{ paddingTop: 20 }}>
        <div className="section-head">
          <div className="eyebrow">Why Choose Us</div>
          <h2>Our Promise</h2>
          <div className="line" />
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🚚</span>
            <h3>Safe Delivery</h3>
            <p>FREE above ₹999 · India Post, across India</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔁</span>
            <h3>Easy Returns</h3>
            <p>7-day hassle-free return policy</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔒</span>
            <h3>Secure Payment</h3>
            <p>100% secure & encrypted checkout</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🤝</span>
            <h3>Quality Guaranteed</h3>
            <p>Handpicked traditional craftsmanship</p>
          </div>
        </div>
      </section>

      <section className="section container" style={{ paddingTop: 0, paddingBottom: 20 }}>
        <div className="section-head">
          <h2 style={{ fontFamily: 'var(--serif)' }}>
            “Elegance is the only beauty that <em style={{ color: 'var(--accent)' }}>never fades</em>.”
          </h2>
          <div className="line" />
        </div>
      </section>
    </>
  );
}
