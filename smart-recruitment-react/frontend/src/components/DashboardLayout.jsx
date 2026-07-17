import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ navItems, children, title, breadcrumb }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <>
      <button className="icon-btn glass sidebar-toggle-mobile" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <i className="fa-solid fa-bars"></i>
      </button>

      <div className="dash-wrapper">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <a href="/" className="sidebar-logo">
            <span className="logo-icon"><i className="fa-solid fa-brain"></i></span>
            <span>SmartRecruit AI</span>
          </a>

          {navItems.map((section, idx) => (
            <React.Fragment key={idx}>
              {section.label && <div className="sidebar-section-label">{section.label}</div>}
              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <i className={link.icon}></i> {link.label}
                </NavLink>
              ))}
            </React.Fragment>
          ))}

          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="avatar">{initials}</div>
              <div className="sidebar-user-info">
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
              </div>
            </div>
            <a href="#" className="side-link" style={{ marginTop: 8 }} onClick={(e) => { e.preventDefault(); handleLogout(); }}>
              <i className="fa-solid fa-right-from-bracket"></i> Log Out
            </a>
          </div>
        </aside>

        <main className="dash-main">
          <div className="dash-topbar">
            <div>
              <h1>{title}</h1>
              <div className="breadcrumb">{breadcrumb}</div>
            </div>
          </div>
          {children}
        </main>
      </div>
    </>
  );
}
