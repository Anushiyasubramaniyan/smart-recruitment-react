import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function Home() {
  useEffect(() => {
    const targets = document.querySelectorAll('.stagger, .fade-in-up, .glass');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-badge glass">
              <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--accent-cyan)' }}></i> Powered by AI Resume Intelligence
            </div>
            <h1>Hire smarter with <span className="grad">AI-driven</span> recruitment</h1>
            <p>SmartRecruit AI analyzes resumes in seconds, matches candidates to the right roles, and streamlines your entire hiring pipeline — from application to offer letter.</p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary"><i className="fa-solid fa-rocket"></i> Start Free Trial</Link>
              <a href="#how-it-works" className="btn btn-outline"><i className="fa-solid fa-play"></i> See How It Works</a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><h3>10k+</h3><span>Resumes Analyzed</span></div>
              <div className="hero-stat"><h3>92%</h3><span>Matching Accuracy</span></div>
              <div className="hero-stat"><h3>3.2s</h3><span>Avg. Analysis Time</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="float-card glass card-1">
              <div className="fc-title">Resume Match Score</div>
              <div className="fc-value" style={{ color: 'var(--accent-cyan)' }}>94%</div>
              <div className="fc-bar"><div className="fc-bar-fill" style={{ width: '94%' }}></div></div>
            </div>
            <div className="float-card glass card-2">
              <div className="fc-title">Candidates Screened Today</div>
              <div className="fc-value">128</div>
              <div className="fc-bar"><div className="fc-bar-fill" style={{ width: '70%', background: 'linear-gradient(90deg,var(--accent-violet),var(--accent-pink))' }}></div></div>
            </div>
            <div className="float-card glass card-3">
              <div className="fc-title">Interview Scheduled</div>
              <div className="fc-value" style={{ fontSize: '1.1rem' }}><i className="fa-solid fa-calendar-check" style={{ color: 'var(--accent-green)' }}></i>&nbsp; Today, 2:00 PM</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRUSTED STRIP ================= */}
      <section className="trusted-strip">
        <div className="container">
          <span><i className="fa-solid fa-building"></i>&nbsp; TECHNOVA</span>
          <span><i className="fa-solid fa-cloud"></i>&nbsp; NIMBUS INC</span>
          <span><i className="fa-solid fa-cube"></i>&nbsp; VERTEX LABS</span>
          <span><i className="fa-solid fa-bolt"></i>&nbsp; QUANTUM WORKS</span>
          <span><i className="fa-solid fa-gem"></i>&nbsp; PRISM SYSTEMS</span>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="features" id="features">
        <div className="container">
          <h2 className="section-title fade-in-up">Everything you need to hire, in one place</h2>
          <p className="section-sub fade-in-up">A complete recruitment operating system, built with AI at its core.</p>
          <div className="feature-grid stagger">
            {[
              { icon: 'fa-file-waveform', color: 'var(--accent-cyan)', title: 'AI Resume Analysis', text: 'Instantly extract skills, experience, and achievements from any resume, then score candidates against job requirements in seconds.' },
              { icon: 'fa-users-gear', color: 'var(--accent-violet)', title: 'Smart Candidate Matching', text: 'Automatically rank applicants by fit using skill overlap, experience level, and role-specific weighting.' },
              { icon: 'fa-calendar-days', color: 'var(--accent-teal)', title: 'Interview Scheduling', text: 'Coordinate interviews with a built-in calendar, automated reminders, and conflict-free time slots.' },
              { icon: 'fa-chart-line', color: 'var(--accent-gold)', title: 'Real-Time Analytics', text: 'Track hiring funnels, time-to-hire, and source effectiveness with live, visual dashboards.' },
              { icon: 'fa-shield-halved', color: 'var(--accent-pink)', title: 'Role-Based Access', text: 'Separate, secure dashboards for admins, recruiters, and candidates — each with tailored permissions.' },
              { icon: 'fa-mobile-screen', color: 'var(--accent-green)', title: 'Fully Responsive', text: 'Manage hiring on the go — a seamless experience across desktop, tablet, and mobile devices.' },
            ].map((f) => (
              <div className="glass feature-card" key={f.title}>
                <div className="feature-icon"><i className={`fa-solid ${f.icon}`} style={{ color: f.color }}></i></div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <h2 className="section-title fade-in-up">How SmartRecruit AI works</h2>
          <p className="section-sub fade-in-up">From job posting to offer letter in four simple steps.</p>
          <div className="steps-grid stagger">
            {[
              { num: 1, title: 'Post a Job', text: 'Recruiters create a job listing with required skills and experience.' },
              { num: 2, title: 'Candidates Apply', text: 'Candidates upload resumes directly through their dashboard.' },
              { num: 3, title: 'AI Analyzes & Scores', text: 'Our AI engine parses each resume and generates a match score instantly.' },
              { num: 4, title: 'Schedule & Hire', text: 'Recruiters shortlist top matches, schedule interviews, and extend offers.' },
            ].map((s) => (
              <div className="glass step-card" key={s.num}>
                <div className="step-num">{s.num}</div>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ROLES ================= */}
      <section className="roles-section" id="roles">
        <div className="container">
          <h2 className="section-title fade-in-up">Built for every role in the hiring process</h2>
          <p className="section-sub fade-in-up">Choose your portal and get started in seconds.</p>
          <div className="roles-grid stagger">
            <div className="glass role-card admin">
              <div className="role-icon"><i className="fa-solid fa-user-shield"></i></div>
              <h3>Admin</h3>
              <p>Manage users, oversee system-wide analytics, and configure platform settings.</p>
              <Link to="/login" className="btn btn-outline btn-block">Admin Login</Link>
            </div>
            <div className="glass role-card recruiter">
              <div className="role-icon"><i className="fa-solid fa-briefcase"></i></div>
              <h3>Recruiter</h3>
              <p>Post jobs, review AI-scored candidates, and manage your hiring pipeline.</p>
              <Link to="/login" className="btn btn-outline btn-block">Recruiter Login</Link>
            </div>
            <div className="glass role-card candidate">
              <div className="role-icon"><i className="fa-solid fa-user-tie"></i></div>
              <h3>Candidate</h3>
              <p>Upload your resume, get instant feedback, and track your applications.</p>
              <Link to="/login" className="btn btn-outline btn-block">Candidate Login</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="cta-section">
        <div className="container">
          <div className="glass cta-box fade-in-up">
            <h2>Ready to transform your hiring process?</h2>
            <p>Join hundreds of teams using SmartRecruit AI to hire faster and smarter.</p>
            <Link to="/register" className="btn btn-primary"><i className="fa-solid fa-arrow-right"></i> Create Your Free Account</Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="footer" id="faq">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="nav-logo mb-2">
                <span className="logo-icon"><i className="fa-solid fa-brain"></i></span>
                <span>SmartRecruit AI</span>
              </div>
              <p className="text-secondary" style={{ fontSize: '0.88rem', maxWidth: 280 }}>AI-powered recruitment management for modern hiring teams — faster screening, better matches.</p>
            </div>
            <div>
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#roles">Login Portals</a></li>
              </ul>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; 2026 SmartRecruit AI. All rights reserved. Built with AI-powered innovation.
          </div>
        </div>
      </footer>
    </>
  );
}
