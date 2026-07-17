import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-inner">
        <Link to="/" className="nav-logo">
          <span className="logo-icon"><i className="fa-solid fa-brain"></i></span>
          <span>SmartRecruit AI</span>
        </Link>
        <ul className={`nav-links ${open ? 'open' : ''}`}>
          <li><a href="/#features" onClick={() => setOpen(false)}>Features</a></li>
          <li><a href="/#how-it-works" onClick={() => setOpen(false)}>How It Works</a></li>
          <li><a href="/#roles" onClick={() => setOpen(false)}>Login As</a></li>
          <li><a href="/#faq" onClick={() => setOpen(false)}>FAQ</a></li>
          <div className="nav-actions-mobile">
            <Link to="/login" className="btn btn-outline btn-block" onClick={() => setOpen(false)}>Log In</Link>
            <Link to="/register" className="btn btn-primary btn-block" onClick={() => setOpen(false)}>Get Started</Link>
          </div>
        </ul>
        <div className="nav-actions">
          <Link to="/login" className="btn btn-outline">Log In</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
        <button className={`nav-toggle ${open ? 'active' : ''}`} aria-label="Toggle menu" onClick={() => setOpen(!open)}>
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}
