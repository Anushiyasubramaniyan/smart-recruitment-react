import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import Modal from '../../components/Modal.jsx';
import { adminApi } from '../../api/adminApi.js';
import { jobsApi } from '../../api/jobsApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { StatCard, LoadingBlock } from './CandidateDashboard.jsx';

const NAV_ITEMS = [
  { label: 'Main', links: [
    { to: '/admin/dashboard', label: 'Overview', icon: 'fa-solid fa-gauge-high', end: true },
    { to: '/admin/dashboard/users', label: 'User Management', icon: 'fa-solid fa-users-gear' },
    { to: '/admin/dashboard/jobs', label: 'All Jobs', icon: 'fa-solid fa-briefcase' },
    { to: '/admin/dashboard/ai-engine', label: 'AI Engine Status', icon: 'fa-solid fa-microchip' },
  ]},
  { label: 'Account', links: [
    { to: '/admin/dashboard/settings', label: 'Settings', icon: 'fa-solid fa-gear' },
  ]},
];

export default function AdminDashboard() {
  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Admin Control Panel" breadcrumb="System-wide overview">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="users" element={<UsersManager />} />
        <Route path="jobs" element={<AllJobs />} />
        <Route path="ai-engine" element={<AiEngineStatus />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

/* ============================================================
   OVERVIEW
============================================================ */
function Overview() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, usersRes, jobsRes] = await Promise.all([
          adminApi.getStats(), adminApi.getAllUsers(), jobsApi.getAll(),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data || []);
        setJobs(jobsRes.data || []);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [showToast]);

  if (loading) return <LoadingBlock />;

  const roleCounts = {
    candidate: users.filter((u) => u.role === 'candidate').length,
    recruiter: users.filter((u) => u.role === 'recruiter').length,
    admin: users.filter((u) => u.role === 'admin').length,
  };
  const jobStatusCounts = {
    Active: jobs.filter((j) => j.status === 'Active').length,
    Paused: jobs.filter((j) => j.status === 'Paused').length,
    Closed: jobs.filter((j) => j.status === 'Closed').length,
  };

  return (
    <>
      <div className="stats-grid">
        <StatCard icon="fa-users" color="cyan" value={stats?.totalUsers ?? 0} label="Total Platform Users" />
        <StatCard icon="fa-briefcase" color="violet" value={stats?.totalJobs ?? 0} label="Total Job Postings" />
        <StatCard icon="fa-file-lines" color="green" value={stats?.totalApplications ?? 0} label="Total Applications" />
        <StatCard icon="fa-file-waveform" color="gold" value={stats?.resumesAnalyzed ?? 0} label="Resumes Analyzed" />
      </div>

      <div className="dash-grid-2">
        <div className="glass panel">
          <div className="panel-header"><h2>Users by Role</h2></div>
          <Bar
            data={{
              labels: ['Candidates', 'Recruiters', 'Admins'],
              datasets: [{ label: 'Users', data: [roleCounts.candidate, roleCounts.recruiter, roleCounts.admin], backgroundColor: ['#22d3ee', '#8b5cf6', '#fbbf24'], borderRadius: 8 }],
            }}
            options={{ responsive: true, plugins: { legend: { display: false } },
              scales: { x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#b7c3dc' } }, y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#b7c3dc' } } } }}
          />
        </div>
        <div className="glass panel">
          <div className="panel-header"><h2>Jobs by Status</h2></div>
          <Doughnut
            data={{
              labels: ['Active', 'Paused', 'Closed'],
              datasets: [{ data: [jobStatusCounts.Active, jobStatusCounts.Paused, jobStatusCounts.Closed], backgroundColor: ['#34d399', '#fbbf24', '#f87171'], borderWidth: 0 }],
            }}
            options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#b7c3dc' } } } }}
          />
        </div>
      </div>

      <div className="glass panel">
        <div className="panel-header"><h2>System Health</h2></div>
        <div className="toggle-row"><div><h4>API Server</h4><p>Node.js / Express backend</p></div><span className="badge badge-success">Operational</span></div>
        <div className="toggle-row"><div><h4>AI Analysis Engine</h4><p>Resume scoring engine</p></div><span className="badge badge-success">Operational</span></div>
        <div className="toggle-row"><div><h4>Database</h4><p>MySQL</p></div><span className="badge badge-success">Operational</span></div>
      </div>
    </>
  );
}

/* ============================================================
   USER MANAGEMENT (full CRUD)
============================================================ */
function UsersManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'Candidate', password: '' });
  const { showToast } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await adminApi.getAllUsers();
      setUsers(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditingUser(null);
    setForm({ name: '', email: '', role: 'candidate', password: '' });
    setModalOpen(true);
  }

  function openEdit(user) {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, role: user.role, password: '' });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) { showToast('Please fill in all fields', 'error'); return; }
    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, { name: form.name, email: form.email, role: form.role });
        showToast('User updated successfully!', 'success');
      } else {
        await adminApi.createUser({ name: form.name, email: form.email, role: form.role, password: form.password || 'ChangeMe123' });
        showToast('User added successfully!', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function toggleStatus(user) {
    const next = user.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await adminApi.updateUserStatus(user.id, next);
      showToast(`${user.name} is now ${next.toLowerCase()}`, 'success');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await adminApi.removeUser(id);
      showToast('User removed', 'success');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="glass panel">
      <div className="panel-header">
        <h2>All Users</h2>
        <button className="btn btn-primary btn-sm" onClick={openCreate}><i className="fa-solid fa-user-plus"></i> Add User</button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="name-cell">{u.name}</td>
                <td>{u.email}</td>
                <td><span className="badge badge-violet">{u.role}</span></td>
                <td><span className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{u.status}</span></td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="table-actions">
                  <button title="Edit" onClick={() => openEdit(u)}><i className="fa-solid fa-pen"></i></button>
                  <button title={u.status === 'Active' ? 'Suspend' : 'Activate'} onClick={() => toggleStatus(u)}>
                    <i className={`fa-solid ${u.status === 'Active' ? 'fa-ban' : 'fa-circle-check'}`}></i>
                  </button>
                  <button className="del" title="Delete" onClick={() => handleDelete(u.id)}><i className="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            ))}
            {!users.length && <tr><td colSpan={6} className="text-center text-muted">No users found.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? 'Edit User' : 'Add New User'}>
        <div className="form-group"><label>Full Name</label><input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></div>
        <div className="form-group"><label>Email</label><input className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" /></div>
        <div className="form-group"><label>Role</label>
          <select className="form-control" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="candidate">Candidate</option><option value="recruiter">Recruiter</option><option value="admin">Admin</option>
          </select>
        </div>
        {!editingUser && (
          <div className="form-group"><label>Temporary Password</label>
            <input className="form-control" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave blank for default" />
          </div>
        )}
        <button className="btn btn-primary btn-block" onClick={handleSave}>{editingUser ? 'Save Changes' : 'Add User'}</button>
      </Modal>
    </div>
  );
}

/* ============================================================
   ALL JOBS (platform-wide, admin can delete any)
============================================================ */
function AllJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await jobsApi.getAll();
      setJobs(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    if (!window.confirm('Remove this job posting platform-wide?')) return;
    try {
      await jobsApi.remove(id);
      showToast('Job removed', 'success');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="glass panel">
      <div className="panel-header"><h2>All Job Postings (Platform-wide)</h2></div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Title</th><th>Department</th><th>Status</th><th>Posted</th><th>Actions</th></tr></thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="name-cell">{job.title}</td>
                <td>{job.department}</td>
                <td><span className={`badge ${job.status === 'Active' ? 'badge-success' : job.status === 'Paused' ? 'badge-warning' : 'badge-danger'}`}>{job.status}</span></td>
                <td>{new Date(job.created_at).toLocaleDateString()}</td>
                <td className="table-actions">
                  <button className="del" title="Remove" onClick={() => handleDelete(job.id)}><i className="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            ))}
            {!jobs.length && <tr><td colSpan={5} className="text-center text-muted">No jobs found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   AI ENGINE STATUS (informational)
============================================================ */
function AiEngineStatus() {
  return (
    <>
      <div className="glass panel">
        <div className="panel-header"><h2>AI Model Configuration</h2></div>
        <div className="toggle-row"><div><h4>Skill Extraction Model</h4><p>Keyword + heuristic scoring engine</p></div><span className="badge badge-success">Active</span></div>
        <div className="toggle-row"><div><h4>Experience Detection</h4><p>Pattern-based years-of-experience parser</p></div><span className="badge badge-success">Active</span></div>
        <div className="toggle-row"><div><h4>Action-Verb Impact Scoring</h4><p>Detects strong achievement language</p></div><span className="badge badge-success">Active</span></div>
      </div>
      <p className="text-muted" style={{ fontSize: '0.85rem' }}>
        The AI engine runs server-side in <code>backend/utils/aiEngine.js</code> — every resume analysis
        request from candidates and recruiters goes through this same scoring logic.
      </p>
    </>
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
        <div className="panel-header"><h2>Platform Settings</h2></div>
        <div className="form-group"><label>Platform Name</label><input className="form-control" defaultValue="SmartRecruit AI" /></div>
        <div className="form-group"><label>Support Email</label><input className="form-control" defaultValue="support@smartrecruit.ai" /></div>
        <button className="btn btn-primary" onClick={() => showToast('Settings saved (demo — wire to a /settings endpoint)', 'info')}>Save Changes</button>
      </div>
      <div className="glass panel">
        <div className="panel-header"><h2>Security</h2></div>
        <div className="toggle-row"><div><h4>Require Two-Factor Authentication</h4><p>For all admin and recruiter accounts</p></div><label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label></div>
      </div>
    </>
  );
}
