import React from 'react';
import { Link } from 'react-router-dom';
import { resolveAssetUrl } from '../api/axios';

export const Loader = () => (
  <div className="loader-wrap">
    <div className="loader" />
  </div>
);

export default function ProductCard({ product }) {
  const [shared, setShared] = React.useState(false);

  /* 3D tilt + cursor-follow glow tracking */
  const onMove = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${((px - 0.5) * 14).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${((0.5 - py) * 10).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  };
  const onLeave = (e) => {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
  };

  const share = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/product/${product._id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: `${product.name} · Super Collection`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 1800);
      }
    } catch { /* share cancelled */ }
  };

  const discount =
    product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

  const img1 = resolveAssetUrl(product.images?.[0]);
  const img2 = resolveAssetUrl(product.images?.[1] || product.images?.[0]);

  return (
    <Link to={`/product/${product._id}`} className="card" onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className="card-img" title="Hover to preview">
        {img1 && (
          <img src={img1} alt={product.name} loading="lazy" className="img-front"
            onError={(e) => (e.target.style.display = 'none')} />
        )}
        {img2 && img2 !== img1 && (
          <img src={img2} alt="" aria-hidden="true" loading="lazy" className="img-hover"
            onError={(e) => (e.target.style.display = 'none')} />
        )}
        <div className="card-tags">
          {discount > 0 && <span className="tag discount">{discount}% OFF</span>}
          {product.isNewArrival && <span className="tag new">New</span>}
          {product.countInStock === 0 && <span className="tag out">Sold Out</span>}
        </div>
        <button className="share-btn" onClick={share} title="Share" aria-label={`Share ${product.name}`}>
          {shared ? '✓' : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          )}
        </button>
      </div>
      <div className="card-body">
        <div className="card-cat">{product.category}</div>
        <div className="card-name">{product.name}</div>
        <div className="stars">
          {product.numReviews > 0 ? (
            <>
              {'★'.repeat(Math.round(product.rating))}
              {'☆'.repeat(5 - Math.round(product.rating))}{' '}
              <span style={{ color: 'var(--muted)', letterSpacing: 0 }}>
                ({product.numReviews} rated)
              </span>
            </>
          ) : (
            <span style={{ color: 'var(--muted)', fontSize: '0.74rem', fontStyle: 'italic' }}>
              No ratings yet
            </span>
          )}
        </div>
        <div className="card-price">
          <span className="price">₹{product.price.toLocaleString('en-IN')}</span>
          {discount > 0 && <span className="price-old">₹{product.comparePrice.toLocaleString('en-IN')}</span>}
        </div>
      </div>
    </Link>
  );
}
