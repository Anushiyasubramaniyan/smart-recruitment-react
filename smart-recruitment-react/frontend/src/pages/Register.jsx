import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const ROLES = [
  { key: 'candidate', label: 'Candidate', icon: 'fa-user-tie' },
  { key: 'recruiter', label: 'Recruiter', icon: 'fa-briefcase' },
  { key: 'admin', label: 'Admin', icon: 'fa-user-shield' },
];

export default function Register() {
  const [role, setRole] = useState('candidate');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (!terms) {
      showToast('Please accept the terms and conditions', 'error');
      return;
    }
   if ((role === 'recruiter' || role === 'admin') && adminCode !== 'MyCollege2026Secure') {
  showToast('Invalid admin code for this role', 'error');
  return;
}

    setLoading(true);
    try {
      const user = await register({ name, email, password, role, adminCode});
      showToast(`Account created! Welcome, ${user.name}.`, 'success');
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="container nav-inner">
          <Link to="/" className="nav-logo">
            <span className="logo-icon"><i className="fa-solid fa-brain"></i></span>
            <span>SmartRecruit AI</span>
          </Link>
          <div className="nav-actions">
            <Link to="/" className="btn btn-outline"><i className="fa-solid fa-house"></i> Home</Link>
          </div>
        </div>
      </nav>

      <div className="auth-wrapper">
        <div className="glass auth-box">
          <div className="auth-logo">
            <span className="logo-icon"><i className="fa-solid fa-brain"></i></span>
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-sub">Join SmartRecruit AI and start hiring smarter</p>

          <div className="role-select">
            {ROLES.map((r) => (
              <div
                key={r.key}
                className={`role-option ${role === r.key ? 'active' : ''}`}
                onClick={() => setRole(r.key)}
              >
                <i className={`fa-solid ${r.icon}`}></i>{r.label}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-icon-wrap">
                <i className="fa-solid fa-user"></i>
                <input type="text" id="name" className="form-control" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-icon-wrap">
                <i className="fa-solid fa-envelope"></i>
                <input type="email" id="email" className="form-control" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-icon-wrap">
                <i className="fa-solid fa-lock"></i>
                <input type="password" id="password" className="form-control" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-icon-wrap">
                <i className="fa-solid fa-lock"></i>
                <input type="password" id="confirmPassword" className="form-control" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              {(role === 'recruiter' || role === 'admin') && (
  <div className="form-group">
    <label htmlFor="adminCode">Admin Code</label>
    <div className="input-icon-wrap">
      <i className="fa-solid fa-key"></i>
      <input type="password" id="adminCode" className="form-control" placeholder="Enter admin code" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} required />
    </div>
  </div>
)}
            </div>
            <div className="form-check">
              <label><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} /> I agree to the <a href="#">Terms</a> & <a href="#">Privacy Policy</a></label>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <span className="spinner"></span> : <i className="fa-solid fa-user-plus"></i>}
              {loading ? ' Creating account...' : ' Create Account'}
            </button>
          </form>

          <div className="auth-divider">OR</div>
          <p className="auth-footer-link">Already have an account? <Link to="/login">Log in</Link></p>
        </div>
      </div>
    </>
  );
}
