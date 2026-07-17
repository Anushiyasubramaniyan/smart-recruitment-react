import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const ROLES = [
  { key: 'candidate', label: 'Candidate', icon: 'fa-user-tie' },
  { key: 'recruiter', label: 'Recruiter', icon: 'fa-briefcase' },
  { key: 'admin', label: 'Admin', icon: 'fa-user-shield' },
];

export default function Login() {
  const [role, setRole] = useState('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const user = await login({ email, password, role });
      showToast(`Welcome back, ${user.name}!`, 'success');
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
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
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Log in to continue to your dashboard</p>

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
              <label htmlFor="email">Email Address</label>
              <div className="input-icon-wrap">
                <i className="fa-solid fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-icon-wrap">
                <i className="fa-solid fa-lock"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <i
                className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
            <div className="form-check">
              <label><input type="checkbox" /> Remember me</label>
              <a href="#">Forgot password?</a>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <span className="spinner"></span> : <i className="fa-solid fa-right-to-bracket"></i>}
              {loading ? ' Logging in...' : ' Log In'}
            </button>
          </form>

          <div className="auth-divider">OR</div>
          <p className="auth-footer-link">Don't have an account? <Link to="/register">Create one now</Link></p>
        </div>
      </div>
    </>
  );
}
