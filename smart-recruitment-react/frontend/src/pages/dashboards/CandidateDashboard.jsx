import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { jobsApi } from '../../api/jobsApi.js';
import { candidatesApi } from '../../api/candidatesApi.js';
import { interviewsApi } from '../../api/interviewsApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import ScoreRing from '../../components/ScoreRing.jsx';
import { resumeApi } from '../../api/resumeApi.js';

const NAV_ITEMS = [
  { label: 'Main', links: [
    { to: '/candidate/dashboard', label: 'Overview', icon: 'fa-solid fa-gauge-high', end: true },
    { to: '/candidate/dashboard/jobs', label: 'Browse Jobs', icon: 'fa-solid fa-briefcase' },
    { to: '/candidate/dashboard/applications', label: 'My Applications', icon: 'fa-solid fa-file-lines' },
    { to: '/candidate/dashboard/resume', label: 'Resume Analysis', icon: 'fa-solid fa-file-waveform' },
    { to: '/candidate/dashboard/interviews', label: 'Interviews', icon: 'fa-solid fa-calendar-days' },
  ]},
  { label: 'Account', links: [
    { to: '/candidate/dashboard/settings', label: 'Settings', icon: 'fa-solid fa-gear' },
  ]},
];

export default function CandidateDashboard() {
  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Welcome back 👋" breadcrumb="Candidate Dashboard">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="jobs" element={<BrowseJobs />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="resume" element={<ResumeAnalysis />} />
        <Route path="interviews" element={<MyInterviews />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/candidate/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

/* ============================================================
   OVERVIEW
============================================================ */
function Overview() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const [appsRes, jobsRes] = await Promise.all([
          candidatesApi.getMyApplications(),
          jobsApi.getAll(),
        ]);
        setApplications(appsRes.data || []);
        setJobs((jobsRes.data || []).filter((j) => j.status === 'Active').slice(0, 3));
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [showToast]);

  const bestScore = applications.reduce((max, a) => Math.max(max, a.match_score || 0), 0);
  const upcoming = applications.filter((a) => a.stage === 'Interview').length;
  const offers = applications.filter((a) => a.stage === 'Offer').length;

  if (loading) return <LoadingBlock />;

  return (
    <>
      <div className="stats-grid">
        <StatCard icon="fa-file-lines" color="cyan" value={applications.length} label="Applications Submitted" />
        <StatCard icon="fa-calendar-check" color="violet" value={upcoming} label="Upcoming Interviews" />
        <StatCard icon="fa-chart-simple" color="green" value={`${bestScore}%`} label="Best Resume Match Score" />
        <StatCard icon="fa-envelope-open-text" color="gold" value={offers} label="Offers Received" />
      </div>

      <div className="dash-grid-2">
        <div className="glass panel">
          <div className="panel-header"><h2>Application Timeline</h2></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Job Title</th><th>Applied</th><th>Stage</th><th>Match</th></tr></thead>
              <tbody>
                {applications.slice(0, 5).map((a) => (
                  <tr key={a.id}>
                    <td className="name-cell">{a.job_title}</td>
                    <td>{new Date(a.applied_at).toLocaleDateString()}</td>
                    <td><StageBadge stage={a.stage} /></td>
                    <td>{a.match_score ?? '—'}%</td>
                  </tr>
                ))}
                {!applications.length && <tr><td colSpan={4} className="text-center text-muted">No applications yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="glass panel">
          <div className="panel-header"><h2>Recommended For You</h2></div>
          {jobs.map((j) => (
            <div className="flex-between mb-2" key={j.id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{j.title}</div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>{j.department} • {j.location}</div>
              </div>
            </div>
          ))}
          {!jobs.length && <p className="text-muted">No open jobs right now.</p>}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   BROWSE JOBS
============================================================ */
function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadJobs = useCallback(async () => {
    try {
      const res = await jobsApi.getAll();
      setJobs((res.data || []).filter((j) => j.status === 'Active'));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  async function handleApply(jobId) {
    try {
      await candidatesApi.apply(jobId);
      showToast('Application submitted successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  const filtered = jobs.filter((j) => j.title.toLowerCase().includes(filter.toLowerCase()));

  if (loading) return <LoadingBlock />;

  return (
    <div className="glass panel">
      <div className="panel-header">
        <h2>Open Positions</h2>
        <div className="search-bar glass" style={{ minWidth: 220 }}>
          <i className="fa-solid fa-filter"></i>
          <input type="text" placeholder="Filter by title..." value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Job Title</th><th>Department</th><th>Location</th><th>Type</th><th>Action</th></tr></thead>
          <tbody>
            {filtered.map((j) => (
              <tr key={j.id}>
                <td className="name-cell">{j.title}</td>
                <td>{j.department}</td>
                <td>{j.location}</td>
                <td>{j.type}</td>
                <td><button className="btn btn-primary btn-sm" onClick={() => handleApply(j.id)}>Apply</button></td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={5} className="text-center text-muted">No jobs found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   MY APPLICATIONS
============================================================ */
function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const res = await candidatesApi.getMyApplications();
        setApplications(res.data || []);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [showToast]);

  if (loading) return <LoadingBlock />;

  return (
    <div className="glass panel">
      <div className="panel-header"><h2>My Applications</h2></div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Job Title</th><th>Applied On</th><th>Stage</th><th>Match Score</th></tr></thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id}>
                <td className="name-cell">{a.job_title}</td>
                <td>{new Date(a.applied_at).toLocaleDateString()}</td>
                <td><StageBadge stage={a.stage} /></td>
                <td>{a.match_score ?? '—'}%</td>
              </tr>
            ))}
            {!applications.length && <tr><td colSpan={4} className="text-center text-muted">No applications yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   RESUME ANALYSIS
============================================================ */
function ResumeAnalysis() {
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { showToast } = useToast();

  async function handleAnalyze() {
    if (resumeText.trim().length < 20) {
      showToast('Please paste more resume detail to analyze (min. 20 characters).', 'error');
      return;
    }
    setAnalyzing(true);
    try {
      const res = await resumeApi.analyzeText({ resumeText, jobDescription: jdText });
      setResult(res.data);
      showToast('Resume analysis complete!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAnalyzing(false);
    }
  }

  function handleFile(file) {
    if (!file) return;
    showToast(`"${file.name}" selected. Paste resume text below if not auto-filled.`, 'info');
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (ev) => setResumeText(ev.target.result);
      reader.readAsText(file);
    }
  }

  const verdictClass = (score) =>
    score >= 85 ? 'badge-success' : score >= 70 ? 'badge-info' : score >= 50 ? 'badge-warning' : 'badge-danger';

  return (
    <div className="dash-grid-2">
      <div className="glass panel">
        <div className="panel-header"><h2>AI Resume Analyzer</h2></div>
        <p className="text-secondary mb-2" style={{ fontSize: '0.88rem' }}>
          Paste your resume text below and optionally the job description to check your match score instantly.
        </p>

        <div
          className={`dropzone mb-2 ${dragOver ? 'dragover' : ''}`}
          onClick={() => document.getElementById('resume-file-input').click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        >
          <i className="fa-solid fa-cloud-arrow-up"></i>
          <h4>Drop your resume file here</h4>
          <p>Supports PDF, DOCX, TXT — or paste text below</p>
          <input type="file" id="resume-file-input" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])} />
        </div>

        <div className="form-group">
          <label>Resume Text</label>
          <textarea className="form-control" rows={6} placeholder="Paste resume content here..."
            value={resumeText} onChange={(e) => setResumeText(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Target Job Description (optional)</label>
          <textarea className="form-control" rows={4} placeholder="Paste the job description to compare against..."
            value={jdText} onChange={(e) => setJdText(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing}>
          {analyzing ? <span className="spinner"></span> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
          {analyzing ? ' Analyzing...' : ' Analyze with AI'}
        </button>
      </div>

      <div className="glass panel">
        <div className="panel-header"><h2>Analysis Result</h2></div>
        {!result ? (
          <div className="text-center" style={{ padding: '40px 10px' }}>
            <i className="fa-solid fa-file-waveform" style={{ fontSize: '2.5rem', color: 'var(--text-muted)', marginBottom: 14 }}></i>
            <p className="text-muted">Run an analysis to see your AI-generated match score and suggestions here.</p>
          </div>
        ) : (
          <div>
            <div className="flex-center mb-2"><ScoreRing score={result.overallScore} /></div>
            <p className="text-center mb-2"><span className={`badge ${verdictClass(result.overallScore)}`}>{result.verdict}</span></p>

            <ProgressRow label="Skill Match" value={result.breakdown.skillMatch} />
            <ProgressRow label="Impact / Action Verbs" value={result.breakdown.impact} />
            <ProgressRow label="Experience" value={result.breakdown.experience} />

            <div className="mt-2">
              <h4 style={{ fontSize: '0.9rem', marginBottom: 10 }}>💡 AI Suggestions</h4>
              <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 18, listStyle: 'disc' }}>
                {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <p className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>
              Analyzed in {result.processingTimeMs}ms — {result.matchedSkills.length} skills matched
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressRow({ label, value }) {
  return (
    <div className="mb-2">
      <div className="flex-between mb-1"><span style={{ fontSize: '0.82rem' }}>{label}</span><span style={{ fontSize: '0.82rem' }}>{value}%</span></div>
      <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${value}%` }}></div></div>
    </div>
  );
}

/* ============================================================
   MY INTERVIEWS
============================================================ */
function MyInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const res = await interviewsApi.getAll();
        setInterviews((res.data || []).filter((iv) => iv.candidate_id === user.id || iv.candidate_name === user.name));
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [showToast, user]);

  if (loading) return <LoadingBlock />;

  return (
    <div className="glass panel">
      <div className="panel-header"><h2>My Interviews</h2></div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Role</th><th>Date</th><th>Time</th><th>Mode</th><th>Status</th></tr></thead>
          <tbody>
            {interviews.map((iv) => (
              <tr key={iv.id}>
                <td className="name-cell">{iv.job_title}</td>
                <td>{iv.scheduled_date?.slice(0, 10)}</td>
                <td>{iv.scheduled_time}</td>
                <td>{iv.mode}</td>
                <td><span className={`badge ${iv.status === 'Scheduled' ? 'badge-info' : 'badge-success'}`}>{iv.status}</span></td>
              </tr>
            ))}
            {!interviews.length && <tr><td colSpan={5} className="text-center text-muted">No interviews scheduled.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   SETTINGS
============================================================ */
function Settings() {
  const { user } = useAuth();
  const { showToast } = useToast();

  return (
    <>
      <div className="glass panel">
        <div className="panel-header"><h2>Profile Settings</h2></div>
        <div className="form-group"><label>Full Name</label><input className="form-control" defaultValue={user?.name} /></div>
        <div className="form-group"><label>Email Address</label><input className="form-control" defaultValue={user?.email} /></div>
        <div className="form-group"><label>Phone Number</label><input className="form-control" placeholder="+91 98765 43210" /></div>
        <button className="btn btn-primary" onClick={() => showToast('Profile updated (demo — wire to PUT /admin/users/:id or a /me endpoint)', 'info')}>Save Changes</button>
      </div>
      <div className="glass panel">
        <div className="panel-header"><h2>Notification Preferences</h2></div>
        <ToggleRow title="Email Notifications" desc="Receive updates about application status" defaultChecked />
        <ToggleRow title="Interview Reminders" desc="Get reminded before scheduled interviews" defaultChecked />
        <ToggleRow title="New Job Alerts" desc="Notify me when matching jobs are posted" />
      </div>
    </>
  );
}

/* ============================================================
   SHARED SMALL COMPONENTS
============================================================ */
export function StatCard({ icon, color, value, label }) {
  const colors = { cyan: 'rgba(34,211,238,0.15)', violet: 'rgba(139,92,246,0.15)', green: 'rgba(52,211,153,0.15)', gold: 'rgba(251,191,36,0.15)' };
  const iconColors = { cyan: 'var(--accent-cyan)', violet: 'var(--accent-violet)', green: 'var(--accent-green)', gold: 'var(--accent-gold)' };
  return (
    <div className="glass stat-card">
      <div className="stat-icon" style={{ background: colors[color] }}><i className={`fa-solid ${icon}`} style={{ color: iconColors[color] }}></i></div>
      <h3>{value}</h3><p>{label}</p>
    </div>
  );
}

export function StageBadge({ stage }) {
  const map = { Applied: 'badge-info', Screening: 'badge-warning', Interview: 'badge-violet', Offer: 'badge-success', Rejected: 'badge-danger' };
  return <span className={`badge ${map[stage] || 'badge-info'}`}>{stage}</span>;
}

export function ToggleRow({ title, desc, defaultChecked }) {
  return (
    <div className="toggle-row">
      <div><h4>{title}</h4><p>{desc}</p></div>
      <label className="switch"><input type="checkbox" defaultChecked={defaultChecked} /><span className="slider"></span></label>
    </div>
  );
}

export function LoadingBlock() {
  return <div className="flex-center" style={{ padding: 60 }}><span className="spinner"></span></div>;
}
