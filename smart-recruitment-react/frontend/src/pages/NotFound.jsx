import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: 20, textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem' }}>404</h1>
      <p className="text-secondary">Page not found.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  );
}
