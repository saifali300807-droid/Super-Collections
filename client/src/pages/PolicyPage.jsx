import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import POLICIES from '../data/policies';

/* ── Super Collection — Policy Pages ─────────────────────────────
   Professional & transparent legal design: plain language, clear
   structure, sticky "on this page" navigation, no dark patterns. */

const ORDER = ['privacy', 'returns', 'payment', 'delivery', 'terms'];
const ICONS = { privacy: '🛡️', returns: '🔁', payment: '📲', delivery: '📦', terms: '📜' };

const truncate = (text, n) => (text.length > n ? `${text.slice(0, n).trimEnd()}…` : text);

function Blocks({ blocks }) {
  return blocks.map((b, i) => {
    if (b.type === 'p') return <p key={i} className="policy-p">{b.text}</p>;
    if (b.type === 'list') {
      return (
        <ul key={i} className="policy-list">
          {b.items.map((it, j) => <li key={j}>{it}</li>)}
        </ul>
      );
    }
    if (b.type === 'table') {
      return (
        <div key={i} className="policy-table-wrap">
          <table>
            <thead>
              <tr>{b.headers.map((h, j) => <th key={j}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {b.rows.map((r, j) => (
                <tr key={j}>{r.map((c, k) => <td key={k}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  });
}

/* ── Overview: all policies at a glance ── */
function PolicyOverview() {
  return (
    <div className="section container policy-page" style={{ paddingTop: 46 }}>
      <div className="section-head">
        <div className="eyebrow">Legal &amp; Policies</div>
        <h2>Transparency, <em style={{ color: 'var(--accent)' }}>By Design</em></h2>
        <div className="line" />
      </div>
      <p className="policy-lede">
        Everything about how we handle your data, your payments, your deliveries and
        your returns — written in plain language and open for you to read anytime.
      </p>
      <div className="policy-cards">
        {ORDER.map((k) => {
          const p = POLICIES[k];
          return (
            <Link key={k} to={`/policies/${k}`} className="policy-card">
              <span className="policy-card-icon">{ICONS[k]}</span>
              <h3>{p.title}</h3>
              <p>{truncate(p.intro, 120)}</p>
              <span className="policy-card-more">Read policy →</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ── Individual policy page ── */
export default function PolicyPage() {
  const { slug } = useParams();
  const key = slug && POLICIES[slug] ? slug : null;

  if (slug && !key) return <Navigate to="/policies" replace />;
  if (!slug) return <PolicyOverview />;

  const p = POLICIES[key];
  const idx = ORDER.indexOf(key);
  const prev = idx > 0 ? ORDER[idx - 1] : null;
  const next = idx < ORDER.length - 1 ? ORDER[idx + 1] : null;

  const jump = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="section container policy-page" style={{ paddingTop: 46 }}>
      <nav className="policy-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span>/</span>
        <Link to="/policies">Policies</Link><span>/</span>
        <b>{p.title}</b>
      </nav>

      <header className="policy-hero">
        <span className="policy-hero-icon">{ICONS[key]}</span>
        <div className="eyebrow">Super Collection · Legal</div>
        <h1>{p.title}</h1>
        <div className="policy-meta">
          <span className="policy-updated">Last updated · {p.updated}</span>
          <span className="policy-secure">✔ Plain language · No hidden clauses</span>
        </div>
        <p className="policy-intro">{p.intro}</p>
      </header>

      <div className="policy-layout">
        <aside className="policy-side">
          <div className="policy-side-card">
            <h4>On this page</h4>
            <ol className="policy-toc">
              {p.sections.map((s, i) => (
                <li key={i}>
                  <a href={`#s${i}`} onClick={(e) => jump(e, `s${i}`)}>{s.heading}</a>
                </li>
              ))}
            </ol>
          </div>
          <div className="policy-side-card">
            <h4>All policies</h4>
            {ORDER.map((k) => (
              <Link key={k} to={`/policies/${k}`} className={`policy-side-link ${k === key ? 'active' : ''}`}>
                <span className="policy-side-icon">{ICONS[k]}</span> {POLICIES[k].title}
              </Link>
            ))}
          </div>
        </aside>

        <article className="policy-body">
          {p.sections.map((s, i) => (
            <section key={i} id={`s${i}`} className="policy-section">
              <h2>{s.heading}</h2>
              <Blocks blocks={s.blocks} />
            </section>
          ))}

          <div className="policy-cta">
            <h3>Still have a question?</h3>
            <p>Our team replies within one business day.</p>
            <Link to="/contact" className="btn">Contact Support</Link>
          </div>

          <div className="policy-pager">
            {prev && (
              <Link className="policy-pager-link" to={`/policies/${prev}`}>
                ← {POLICIES[prev].title}
              </Link>
            )}
            {next && (
              <Link className="policy-pager-link policy-pager-next" to={`/policies/${next}`}>
                {POLICIES[next].title} →
              </Link>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
