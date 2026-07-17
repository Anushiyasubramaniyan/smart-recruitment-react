import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import Modal from '../../components/Modal.jsx';
import ScoreRing from '../../components/ScoreRing.jsx';
import { jobsApi } from '../../api/jobsApi.js';
import { candidatesApi } from '../../api/candidatesApi.js';
import { interviewsApi } from '../../api/interviewsApi.js';
import { resumeApi } from '../../api/resumeApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { StatCard, LoadingBlock } from './CandidateDashboard.jsx';

const NAV_ITEMS = [
  { label: 'Main', links: [
    { to: '/recruiter/dashboard', label: 'Overview', icon: 'fa-solid fa-gauge-high', end: true },
    { to: '/recruiter/dashboard/jobs', label: 'Jobs', icon: 'fa-solid fa-briefcase' },
    { to: '/recruiter/dashboard/candidates', label: 'Candidates', icon: 'fa-solid fa-users' },
    { to: '/recruiter/dashboard/pipeline', label: 'Pipeline', icon: 'fa-solid fa-diagram-project' },
    { to: '/recruiter/dashboard/resume', label: 'Resume Analysis', icon: 'fa-solid fa-file-waveform' },
    { to: '/recruiter/dashboard/interviews', label: 'Interviews', icon: 'fa-solid fa-calendar-days' },
  ]},
  { label: 'Account', links: [
    { to: '/recruiter/dashboard/settings', label: 'Settings', icon: 'fa-solid fa-gear' },
  ]},
];

export default function RecruiterDashboard() {
  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Recruiter Dashboard" breadcrumb="Manage jobs and candidates">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="jobs" element={<JobsManager />} />
        <Route path="candidates" element={<CandidatesManager />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="resume" element={<BulkResumeAnalysis />} />
        <Route path="interviews" element={<InterviewsManager />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/recruiter/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

/* ============================================================
   OVERVIEW
============================================================ */
function Overview() {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const [jobsRes, candsRes, ivRes] = await Promise.all([
          jobsApi.getAll(), candidatesApi.getAll(), interviewsApi.getAll(),
        ]);
        setJobs(jobsRes.data || []);
        setCandidates(candsRes.data || []);
        setInterviews(ivRes.data || []);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [showToast]);

  if (loading) return <LoadingBlock />;

  const activeJobs = jobs.filter((j) => j.status === 'Active').length;
  const shortlisted = candidates.filter((c) => ['Interview', 'Offer'].includes(c.stage)).length;
  const topCandidates = [...candidates].sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).slice(0, 4);

  const stageCounts = ['Applied', 'Screening', 'Interview', 'Offer'].map(
    (s) => candidates.filter((c) => c.stage === s).length
  );

  return (
    <>
      <div className="stats-grid">
        <StatCard icon="fa-briefcase" color="cyan" value={activeJobs} label="Active Job Postings" />
        <StatCard icon="fa-users" color="violet" value={candidates.length} label="Total Candidates" />
        <StatCard icon="fa-user-check" color="green" value={shortlisted} label="Shortlisted" />
        <StatCard icon="fa-calendar-check" color="gold" value={interviews.length} label="Interviews Scheduled" />
      </div>

      <div className="dash-grid-2">
        <div className="glass panel">
          <div className="panel-header"><h2>Hiring Funnel</h2></div>
          <Bar
            data={{
              labels: ['Applied', 'Screening', 'Interview', 'Offer'],
              datasets: [{ label: 'Candidates', data: stageCounts, backgroundColor: ['#22d3ee', '#2dd4bf', '#8b5cf6', '#34d399'], borderRadius: 8 }],
            }}
            options={{ responsive: true, plugins: { legend: { display: false } },
              scales: { x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#b7c3dc' } }, y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#b7c3dc' } } } }}
          />
        </div>
        <div className="glass panel">
          <div className="panel-header"><h2>Top Matched Candidates</h2></div>
          {topCandidates.map((c) => (
            <div className="flex-between mb-2" key={c.application_id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="cell-person">
                <div className="avatar">{c.name.split(' ').map((n) => n[0]).join('')}</div>
                <div><div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.name}</div><div className="text-muted" style={{ fontSize: '0.76rem' }}>{c.job_title}</div></div>
              </div>
              <span className={`badge ${(c.match_score || 0) >= 85 ? 'badge-success' : 'badge-info'}`}>{c.match_score ?? '—'}%</span>
            </div>
          ))}
          {!topCandidates.length && <p className="text-muted">No candidates yet.</p>}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   JOBS MANAGER (full CRUD)
============================================================ */
function JobsManager() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState({ title: '', department: '', location: '', type: 'Full-time', description: '', requiredSkills: '' });
  const { showToast } = useToast();

  const loadJobs = useCallback(async () => {
    try {
      const res = await jobsApi.getAll();
      setJobs(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  function openCreate() {
    setEditingJob(null);
    setForm({ title: '', department: '', location: '', type: 'Full-time', description: '', requiredSkills: '' });
    setModalOpen(true);
  }

  function openEdit(job) {
    setEditingJob(job);
    const skills = Array.isArray(job.required_skills) ? job.required_skills : (job.required_skills ? JSON.parse(job.required_skills) : []);
    setForm({
      title: job.title, department: job.department, location: job.location, type: job.type,
      description: job.description || '', requiredSkills: (skills || []).join(', '),
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { showToast('Please enter a job title', 'error'); return; }
    const payload = {
      title: form.title, department: form.department || 'General', location: form.location || 'Remote',
      type: form.type, description: form.description,
      requiredSkills: form.requiredSkills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
    };
    try {
      if (editingJob) {
        await jobsApi.update(editingJob.id, { ...payload, status: editingJob.status });
        showToast('Job updated successfully!', 'success');
      } else {
        await jobsApi.create(payload);
        showToast('Job posted successfully!', 'success');
      }
      setModalOpen(false);
      loadJobs();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this job posting? This cannot be undone.')) return;
    try {
      await jobsApi.remove(id);
      showToast('Job posting removed', 'success');
      loadJobs();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function toggleStatus(job) {
    const next = job.status === 'Active' ? 'Paused' : 'Active';
    try {
      await jobsApi.update(job.id, { ...job, status: next, requiredSkills: job.required_skills });
      showToast(`Job marked ${next}`, 'success');
      loadJobs();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="glass panel">
      <div className="panel-header">
        <h2>Job Postings</h2>
        <button className="btn btn-primary btn-sm" onClick={openCreate}><i className="fa-solid fa-plus"></i> New Job</button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Title</th><th>Department</th><th>Status</th><th>Posted</th><th>Actions</th></tr></thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="name-cell">{job.title}</td>
                <td>{job.department}</td>
                <td>
                  <span className={`badge ${job.status === 'Active' ? 'badge-success' : job.status === 'Paused' ? 'badge-warning' : 'badge-danger'}`}>{job.status}</span>
                </td>
                <td>{new Date(job.created_at).toLocaleDateString()}</td>
                <td className="table-actions">
                  <button title="Toggle Active/Paused" onClick={() => toggleStatus(job)}><i className="fa-solid fa-toggle-on"></i></button>
                  <button title="Edit" onClick={() => openEdit(job)}><i className="fa-solid fa-pen"></i></button>
                  <button className="del" title="Delete" onClick={() => handleDelete(job.id)}><i className="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            ))}
            {!jobs.length && <tr><td colSpan={5} className="text-center text-muted">No jobs posted yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingJob ? 'Edit Job' : 'Create New Job'}>
        <div className="form-group"><label>Job Title</label>
          <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior React Developer" />
        </div>
        <div className="form-group"><label>Department</label>
          <input className="form-control" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Engineering" />
        </div>
        <div className="form-group"><label>Location</label>
          <input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Remote" />
        </div>
        <div className="form-group"><label>Type</label>
          <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
          </select>
        </div>
        <div className="form-group"><label>Description</label>
          <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-group"><label>Required Skills (comma separated)</label>
          <input className="form-control" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} placeholder="react, javascript, css" />
        </div>
        <button className="btn btn-primary btn-block" onClick={handleSave}>{editingJob ? 'Save Changes' : 'Publish Job'}</button>
      </Modal>
    </div>
  );
}

/* ============================================================
   CANDIDATES MANAGER (stage update + delete)
============================================================ */
function CandidatesManager() {
  const [candidates, setCandidates] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await candidatesApi.getAll();
      setCandidates(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  async function handleStageChange(applicationId, stage) {
    try {
      await candidatesApi.updateStage(applicationId, stage);
      showToast(`Stage updated to ${stage}`, 'success');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleReject(applicationId) {
    if (!window.confirm('Remove this application?')) return;
    try {
      await candidatesApi.remove(applicationId);
      showToast('Application removed', 'success');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  const filtered = candidates.filter((c) =>
    c.name.toLowerCase().includes(filter.toLowerCase()) || c.job_title.toLowerCase().includes(filter.toLowerCase()));

  if (loading) return <LoadingBlock />;

  return (
    <div className="glass panel">
      <div className="panel-header">
        <h2>All Candidates</h2>
        <div className="search-bar glass" style={{ minWidth: 220 }}>
          <i className="fa-solid fa-filter"></i>
          <input type="text" placeholder="Filter by name/role..." value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Candidate</th><th>Applied Role</th><th>AI Score</th><th>Stage</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.application_id}>
                <td>
                  <div className="cell-person">
                    <div className="avatar">{c.name.split(' ').map((n) => n[0]).join('')}</div>
                    <div><div className="name-cell">{c.name}</div><div className="text-muted" style={{ fontSize: '0.75rem' }}>{c.email}</div></div>
                  </div>
                </td>
                <td>{c.job_title}</td>
                <td><span className={`badge ${(c.match_score || 0) >= 85 ? 'badge-success' : (c.match_score || 0) >= 60 ? 'badge-info' : 'badge-danger'}`}>{c.match_score ?? '—'}%</span></td>
                <td>
                  <select className="form-control" style={{ padding: '6px 10px', fontSize: '0.8rem' }} value={c.stage}
                    onChange={(e) => handleStageChange(c.application_id, e.target.value)}>
                    <option>Applied</option><option>Screening</option><option>Interview</option><option>Offer</option><option>Rejected</option>
                  </select>
                </td>
                <td className="table-actions">
                  <button className="del" title="Remove" onClick={() => handleReject(c.application_id)}><i className="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={5} className="text-center text-muted">No candidates found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   PIPELINE (Kanban view, read + stage update)
============================================================ */
function Pipeline() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const stages = ['Applied', 'Screening', 'Interview', 'Offer'];

  const load = useCallback(async () => {
    try {
      const res = await candidatesApi.getAll();
      setCandidates(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  async function moveTo(applicationId, stage) {
    try {
      await candidatesApi.updateStage(applicationId, stage);
      showToast(`Moved to ${stage}`, 'success');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="glass panel">
      <div className="panel-header"><h2>Candidate Pipeline</h2></div>
      <div className="kanban">
        {stages.map((stage) => {
          const cards = candidates.filter((c) => c.stage === stage);
          const nextStage = stages[stages.indexOf(stage) + 1];
          return (
            <div className="glass kanban-col" key={stage}>
              <div className="kanban-col-header"><h4>{stage}</h4><span className="badge badge-info">{cards.length}</span></div>
              {cards.map((c) => (
                <div className="kanban-card" key={c.application_id}>
                  <h5>{c.name}</h5>
                  <p>{c.job_title}</p>
                  <div className="flex-between mt-1">
                    <span className={`badge ${(c.match_score || 0) >= 85 ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.68rem' }}>{c.match_score ?? '—'}%</span>
                    {nextStage && (
                      <button className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: '0.68rem' }} onClick={() => moveTo(c.application_id, nextStage)}>
                        Move → {nextStage}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!cards.length && <p className="text-muted" style={{ fontSize: '0.8rem' }}>No candidates</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   BULK RESUME ANALYSIS (recruiter screening tool)
============================================================ */
function BulkResumeAnalysis() {
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { showToast } = useToast();

  async function handleAnalyze() {
    if (resumeText.trim().length < 20) { showToast('Please paste more resume detail (min. 20 characters).', 'error'); return; }
    setAnalyzing(true);
    try {
      const res = await resumeApi.analyzeText({ resumeText, jobDescription: jdText });
      setResult(res.data);
      showToast('Candidate resume analyzed!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAnalyzing(false);
    }
  }

  const verdictClass = (score) =>
    score >= 85 ? 'badge-success' : score >= 70 ? 'badge-info' : score >= 50 ? 'badge-warning' : 'badge-danger';

  return (
    <div className="glass panel">
      <div className="panel-header"><h2>AI Resume Screening</h2></div>
      <p className="text-secondary mb-2" style={{ fontSize: '0.88rem' }}>
        Paste a candidate's resume and job description to get an instant AI match score.
      </p>
      <div className="dash-grid-2">
        <div className="form-group"><label>Candidate Resume Text</label>
          <textarea className="form-control" rows={8} value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste candidate resume text..." />
        </div>
        <div className="form-group"><label>Job Description</label>
          <textarea className="form-control" rows={8} value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste job description..." />
        </div>
      </div>
      <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing}>
        {analyzing ? <span className="spinner"></span> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
        {analyzing ? ' Analyzing...' : ' Run AI Analysis'}
      </button>

      {result && (
        <div className="mt-3">
          <div className="flex-between mb-2">
            <ScoreRing score={result.overallScore} />
            <div style={{ flex: 1, marginLeft: 24 }}>
              <span className={`badge ${verdictClass(result.overallScore)}`}>{result.verdict} — {result.overallScore}%</span>
              <p className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>AI processed in {result.processingTimeMs}ms</p>
            </div>
          </div>
          <div className="mb-1"><strong style={{ fontSize: '0.85rem' }}>Matched Skills:</strong> <span className="text-secondary" style={{ fontSize: '0.85rem' }}>{result.matchedSkills.join(', ') || 'None detected'}</span></div>
          <div><strong style={{ fontSize: '0.85rem' }}>Missing Skills:</strong> <span className="text-secondary" style={{ fontSize: '0.85rem' }}>{result.missingSkills.join(', ') || 'None — full coverage!'}</span></div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   INTERVIEWS MANAGER (schedule / cancel)
============================================================ */
function InterviewsManager() {
  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ candidateId: '', jobId: '', scheduledDate: '', scheduledTime: '', mode: 'Video Call' });
  const { showToast } = useToast();

  const load = useCallback(async () => {
    try {
      const [ivRes, candRes] = await Promise.all([interviewsApi.getAll(), candidatesApi.getAll()]);
      setInterviews(ivRes.data || []);
      setCandidates(candRes.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  function openSchedule() {
    setForm({ candidateId: candidates[0]?.candidate_id || '', jobId: candidates[0]?.job_id || '', scheduledDate: '', scheduledTime: '', mode: 'Video Call' });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.candidateId || !form.scheduledDate || !form.scheduledTime) {
      showToast('Please select a candidate, date, and time', 'error');
      return;
    }
    try {
      await interviewsApi.schedule(form);
      showToast('Interview scheduled successfully!', 'success');
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleCancel(id) {
    if (!window.confirm('Cancel this interview?')) return;
    try {
      await interviewsApi.remove(id);
      showToast('Interview cancelled', 'success');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleComplete(id) {
    try {
      await interviewsApi.updateStatus(id, 'Completed');
      showToast('Marked as completed', 'success');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="glass panel">
      <div className="panel-header">
        <h2>Scheduled Interviews</h2>
        <button className="btn btn-primary btn-sm" onClick={openSchedule}><i className="fa-solid fa-plus"></i> Schedule</button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Candidate</th><th>Role</th><th>Date</th><th>Time</th><th>Mode</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {interviews.map((iv) => (
              <tr key={iv.id}>
                <td className="name-cell">{iv.candidate_name}</td>
                <td>{iv.job_title}</td>
                <td>{iv.scheduled_date?.slice(0, 10)}</td>
                <td>{iv.scheduled_time}</td>
                <td>{iv.mode}</td>
                <td><span className={`badge ${iv.status === 'Scheduled' ? 'badge-info' : iv.status === 'Completed' ? 'badge-success' : 'badge-danger'}`}>{iv.status}</span></td>
                <td className="table-actions">
                  {iv.status === 'Scheduled' && <button title="Mark Completed" onClick={() => handleComplete(iv.id)}><i className="fa-solid fa-check"></i></button>}
                  <button className="del" title="Cancel" onClick={() => handleCancel(iv.id)}><i className="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            ))}
            {!interviews.length && <tr><td colSpan={7} className="text-center text-muted">No interviews scheduled.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Interview">
        <div className="form-group"><label>Candidate</label>
          <select className="form-control" value={form.candidateId} onChange={(e) => {
            const cand = candidates.find((c) => String(c.candidate_id) === e.target.value);
            setForm({ ...form, candidateId: e.target.value, jobId: cand?.job_id || '' });
          }}>
            {candidates.map((c) => <option key={c.application_id} value={c.candidate_id}>{c.name} — {c.job_title}</option>)}
          </select>
        </div>
        <div className="form-group"><label>Date</label><input type="date" className="form-control" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} /></div>
        <div className="form-group"><label>Time</label><input type="time" className="form-control" value={form.scheduledTime} onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })} /></div>
        <div className="form-group"><label>Mode</label>
          <select className="form-control" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
            <option>Video Call</option><option>On-site</option><option>Phone</option>
          </select>
        </div>
        <button className="btn btn-primary btn-block" onClick={handleSave}>Confirm Schedule</button>
      </Modal>
    </div>
  );
}

/* ============================================================
   SETTINGS
============================================================ */
function Settings() {
  const { showToast } = useToast();
  return (
    <>
      <div className="glass panel">
        <div className="panel-header"><h2>Recruiter Profile</h2></div>
        <div className="form-group"><label>Full Name</label><input className="form-control" /></div>
        <div className="form-group"><label>Email</label><input className="form-control" /></div>
        <div className="form-group"><label>Department</label><input className="form-control" placeholder="Talent Acquisition" /></div>
        <button className="btn btn-primary" onClick={() => showToast('Profile saved (demo)', 'info')}>Save Changes</button>
      </div>
      <div className="glass panel">
        <div className="panel-header"><h2>AI Matching Preferences</h2></div>
        <div className="toggle-row"><div><h4>Auto-score new applicants</h4><p>Run AI analysis automatically when a candidate applies</p></div><label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label></div>
        <div className="toggle-row"><div><h4>Skill-weighted scoring</h4><p>Prioritize exact skill matches over general experience</p></div><label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label></div>
      </div>
    </>
  );
}
