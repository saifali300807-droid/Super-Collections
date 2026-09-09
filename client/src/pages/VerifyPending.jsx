import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function VerifyPending() {
  const location = useLocation();
  const devUrl = location.state?.devVerifyUrl;

  return (
    <div className="form-page" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: 14 }}>📬</div>
      <h2>Verify Your Email</h2>
      <p className="sub">
        We've sent a verification link to your email address.
        Click it to activate your account and start shopping.
      </p>
      {devUrl && (
        <div className="form-msg ok" style={{ textAlign: 'left' }}>
          <b>DEV MODE:</b> SMTP configured nahi hai, isliye link yahan de rahe hain:
          <br />
          <a href={devUrl} style={{ color: '#1a8a4a', wordBreak: 'break-all' }}>{devUrl}</a>
        </div>
      )}
      <Link to="/" className="btn btn-outline">Back To Home</Link>
    </div>
  );
}
