import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../App';

export default function Contact() {
  const showToast = useToast();
  const [c, setC] = useState({
    address: 'Shop 24, Johari Bazaar, Jaipur, Rajasthan 302003',
    phone: '+91 98765 43210',
    email: 'hello@supercollection.in',
    hours: 'Mon – Sat, 10am – 8pm',
    mapQuery: 'Johari Bazaar, Jaipur, Rajasthan',
  });
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.get('/settings').then((r) => {
      const d = r.data.settings?.contact;
      if (d) setC((old) => ({ ...old, ...d }));
    }).catch(() => {});
  }, []);

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(c.mapQuery || 'Jaipur')}&output=embed`;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  /* Message seedha WhatsApp par jaata hai — koi email server ki zaroorat nahi */
  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    const phone = (c.phone || '').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello Super Collection Team! 👋\n\nGreetings from ${form.name}!\n\nEmail: ${form.email}\n\n${form.message}\n\n---\nSent via Super Collection Contact Form`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer');
    setSent(true);
    showToast('Opening WhatsApp — your message is ready to send ✓');
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="section container contact-page" style={{ paddingTop: 46 }}>
      <div className="section-head">
        <div className="eyebrow">Get In Touch</div>
        <h2>We&apos;re Here <em style={{ color: 'var(--accent)' }}>For You</em></h2>
        <div className="line" />
      </div>

      {/* Info cards */}
      <div className="contact-cards">
        <div className="contact-card">
          <span className="cc-icon">📍</span>
          <b>Our Shop</b>
          <p>{c.address}</p>
        </div>
        <div className="contact-card">
          <span className="cc-icon">📞</span>
          <b>Call / WhatsApp</b>
          <p>
            <a href={`tel:${c.phone.replace(/\s+/g, '')}`} className="contact-phone">{c.phone}</a>
            <br />{c.hours}
          </p>
          <a href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="wa-link" aria-label="Chat on WhatsApp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378 9.86 9.86 0 01-3.148-3.8 9.875 9.875 0 01-1.247-5.183 9.88 9.88 0 014.963-7.68c2.497-.913 5.116-.645 7.195.815 2.1.146 3.976.964 5.257 2.565 1.262 1.58 1.895 3.512 2.077 5.334.074.746-.164 1.461-.47 2.057-.306.595-.878 1.08-1.526 1.391-.648.31-1.434.332-2.119.203z"/></svg>
            <span>WhatsApp</span>
          </a>
        </div>
        <div className="contact-card">
          <span className="cc-icon">✉️</span>
          <b>Email</b>
          <p>{c.email}</p>
        </div>
      </div>

      <div className="contact-layout">
        {/* Form */}
        <form className="contact-form form-page contact-form-page" onSubmit={submit}>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', marginBottom: 6 }}>Send A Message</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 18 }}>
            Fill in the details — your message will open directly in WhatsApp, and our team replies within business hours.
          </p>
          <div className="form-group">
            <label>Your Name</label>
            <input value={form.name} onChange={set('name')} placeholder="Aisha Sharma" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea rows="5" value={form.message} onChange={set('message')} placeholder="Tell us what you're looking for…" />
          </div>
          <button className="btn btn-block" disabled={sent}>{sent ? 'Opening WhatsApp…' : 'Send via WhatsApp'}</button>
        </form>

        {/* Map */}
        <div className="contact-map">
          <iframe
            title="Super Collection shop location"
            src={mapSrc}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="map-caption">👑 Super Collection · {c.mapQuery}</div>
        </div>
      </div>
    </div>
  );
}

