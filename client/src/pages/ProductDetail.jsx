import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { resolveAssetUrl } from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast, errMsg } from '../App';
import { Loader } from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState('M');
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [variant, setVariant] = useState(-1);
  const [revRating, setRevRating] = useState(0);
  const [revComment, setRevComment] = useState('');
  const [revBusy, setRevBusy] = useState(false);

  const refresh = () => api.get(`/products/${id}`).then((res) => setProduct(res.data.product));

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data.product);
        if (res.data.product.sizes?.length) setSize(res.data.product.sizes[1] || res.data.product.sizes[0]);
      })
      .catch(() => toast('Product not found', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!revRating) { toast('Pehle star rating select karein ⭐', 'error'); return; }
    setRevBusy(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating: revRating, comment: revComment });
      toast('Thanks for your review! ⭐');
      setRevComment(''); setRevRating(0);
      await refresh();
    } catch (errRes) {
      toast(errMsg(errRes), 'error');
    } finally {
      setRevBusy(false);
    }
  };

  if (loading) return <Loader />;
  if (!product) return null;

  /* Gallery: original images + optional colour-variant image sets */
  const variants = (product.colorVariants || []).filter((v) => v && v.color);
  const images = (variant >= 0 && variants[variant]?.images?.length
    ? variants[variant].images
    : (product.images || [])).filter(Boolean);
  const mainImg = resolveAssetUrl(images[activeImg] || images[0]);
  const discount =
    product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;
  const pickVariant = (i) => { setVariant(i); setActiveImg(0); };
  const stock = product.countInStock;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: `${product.name} · Super Collection`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast('Link copied to clipboard 🔗');
      }
    } catch { /* share cancelled */ }
  };

  return (
    <div className="section container" style={{ paddingTop: 46 }}>
      <div className="pd product-detail-page">
        {/* ── Gallery ── */}
        <div className="pd-imgs">
          <div className="pd-main-img">
            {mainImg && (
              <img src={mainImg} alt={product.name}
                onError={(e) => (e.target.style.display = 'none')} />
            )}
            {discount > 0 && <span className="pd-sale-tag">-{discount}% OFF</span>}
            <button className="share-btn" onClick={share} title="Share" aria-label={`Share ${product.name}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          </div>

          {images.length > 1 && (
            <div className="pd-thumbs">
              {images.map((im, i) => (
                <button key={i} className={`pd-thumb ${i === activeImg ? 'active' : ''}`}
                  onMouseEnter={() => setActiveImg(i)} onClick={() => setActiveImg(i)}
                  aria-label={`View ${i + 1}`}>
                  <img src={resolveAssetUrl(im)} alt="" loading="lazy" onError={(e) => (e.target.style.display = 'none')} />
                </button>
              ))}
            </div>
          )}

          {variants.length > 0 && (
            <div className="pd-variants">
              <label>Colour Variants — same design, more shades</label>
              <div className="swatch-row">
                <button className={`swatch-btn ${variant === -1 ? 'active' : ''}`}
                  onMouseEnter={() => pickVariant(-1)} onClick={() => pickVariant(-1)}>
                  {product.images?.[0] && <img src={resolveAssetUrl(product.images[0])} alt="" onError={(e) => (e.target.style.display = 'none')} />}
                  <i>Original</i>
                </button>
                {variants.map((v, i) => (
                  <button key={i} className={`swatch-btn ${variant === i ? 'active' : ''}`}
                    onMouseEnter={() => pickVariant(i)} onClick={() => pickVariant(i)}>
                    {v.images?.[0] && <img src={resolveAssetUrl(v.images[0])} alt="" onError={(e) => (e.target.style.display = 'none')} />}
                    <i>{v.color}</i>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="pd-info">
          <div className="pd-cat">{product.category} · {product.brand}</div>
          <h1>{product.name}</h1>
          <div className="stars">
            {product.numReviews > 0 ? (
              <>
                {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}{' '}
                <span style={{ color: 'var(--muted)' }}>
                  {product.rating} / 5 · {product.numReviews} people rated
                </span>
              </>
            ) : (
              <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
                No ratings yet — be the first to review
              </span>
            )}
          </div>
          <div className="pd-price">
            ₹{product.price.toLocaleString('en-IN')}
            {discount > 0 && (
              <>
                <span className="pd-price-old">₹{product.comparePrice.toLocaleString('en-IN')}</span>
                <span className="pd-price-save">Save ₹{(product.comparePrice - product.price).toLocaleString('en-IN')}</span>
              </>
            )}
          </div>
          <p className="pd-desc">
            {product.description}
            {(product.fabric || product.brand) && (
              <span className="pd-desc-meta">
                {product.fabric && <> · Fabric: {product.fabric}</>}
                {product.brand && <> · Brand: {product.brand}</>}
                · Category: {product.category}
                · {product.countInStock > 0 ? `In Stock (${product.countInStock})` : 'Sold Out'}
              </span>
            )}
          </p>

          <label className="pd-label">Select Size</label>
          <div className="size-picker">
            {product.sizes.map((s) => (
              <button key={s} className={`size-btn ${size === s ? 'active' : ''}`} onClick={() => setSize(s)}>
                {s}
              </button>
            ))}
          </div>

          <label className="pd-label">Quantity</label>
          <div className="qty-picker">
            <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty(Math.min(qty + 1, stock || 1))}>+</button>
          </div>

          <p className={`pd-stock ${stock > 0 ? 'in' : 'out'}`}>
            {stock > 0 ? `✔ In Stock (${stock} available)` : '✖ Out of Stock'}
          </p>

          <div className="pd-actions">
            <button
              className="btn"
              disabled={product.countInStock === 0}
              onClick={() => {
                addItem(product, size, qty);
                toast('Added to your bag 🛍');
              }}
            >
              Add To Bag
            </button>
            <button
              className="btn btn-outline"
              disabled={product.countInStock === 0}
              onClick={() => {
                addItem(product, size, qty);
                navigate('/checkout');
              }}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* ── Customer Reviews ── */}
      <section className="pd-reviews">
        <div className="section-head" style={{ textAlign: 'left', marginBottom: 16 }}>
          <div className="eyebrow">Ratings &amp; Reviews</div>
          <h2 className="rev-heading">What Customers Say</h2>
        </div>
        <div className="rev-layout">
          <div>
            {product.reviews?.length > 0 ? (
              product.reviews.slice().reverse().map((rv, i) => (
                <div className="rev-card" key={i}>
                  <div className="rev-head">
                    <b>{rv.name}</b>
                    <span className="rev-date">{new Date(rv.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="stars" style={{ marginBottom: 6 }}>
                    {'★'.repeat(Math.round(rv.rating))}{'☆'.repeat(5 - Math.round(rv.rating))}
                  </div>
                  {rv.comment && <p>{rv.comment}</p>}
                </div>
              ))
            ) : (
              <div className="empty" style={{ padding: '40px 10px' }}>
                <h3>No reviews yet</h3>
                <p>Is product pe pehli rating aap de sakte hain!</p>
              </div>
            )}
          </div>

          <form className="rev-form" onSubmit={submitReview}>
            <h3>Rate This Product</h3>
            <p className="rev-sub">Aapka rating aur review dusron ki madad karega.</p>
            {!user ? (
              <p className="form-msg ok" style={{ fontSize: '0.9rem' }}>
                Review dene ke liye <Link to="/login">sign in</Link> karein.
              </p>
            ) : (
              <>
                <div className="rev-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={s <= revRating ? 'on' : ''}
                      onClick={() => setRevRating(s)}
                      aria-label={`${s} star`}
                    >
                      {s <= revRating ? '★' : '☆'}
                    </button>
                  ))}
                </div>
                <div className="form-group">
                  <label>Your Review</label>
                  <textarea
                    rows={4}
                    value={revComment}
                    onChange={(e) => setRevComment(e.target.value)}
                    placeholder="Is product ke baare mein kya pasand aaya…"
                  />
                </div>
                <button className="btn btn-block" disabled={revBusy}>
                  {revBusy ? 'Submitting…' : 'Submit Review'}
                </button>
              </>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
