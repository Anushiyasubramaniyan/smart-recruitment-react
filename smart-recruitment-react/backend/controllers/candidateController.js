/* =====================================================
   CANDIDATES / APPLICATIONS CONTROLLER
===================================================== */
const { pool } = require('../config/db');

async function getAllCandidates(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT a.id AS application_id, u.id AS candidate_id, u.name, u.email,
            j.id AS job_id, j.title AS job_title, a.stage, a.match_score, a.applied_at
      FROM applications a
      JOIN users u ON a.candidate_id = u.id
      JOIN jobs j ON a.job_id = j.id
      ORDER BY a.applied_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching candidates.' });
  }
}

async function applyToJob(req, res) {
  try {
    const { jobId } = req.body;
    const candidateId = req.user.id;

    const [existing] = await pool.query('SELECT id FROM applications WHERE candidate_id = ? AND job_id = ?', [candidateId, jobId]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'You have already applied to this job.' });
    }

    await pool.query(
      `INSERT INTO applications (candidate_id, job_id, stage, applied_at) VALUES (?, ?, 'Applied', NOW())`,
      [candidateId, jobId]
    );
    res.status(201).json({ success: true, message: 'Application submitted successfully.' });
  } catch (err) {
    console.error('Apply error:', err);
    res.status(500).json({ success: false, message: 'Error submitting application.' });
  }
}

async function updateApplicationStage(req, res) {
  try {
    const { stage, matchScore } = req.body;
    const validStages = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ success: false, message: 'Invalid stage.' });
    }
    await pool.query('UPDATE applications SET stage = ?, match_score = COALESCE(?, match_score) WHERE id = ?',
      [stage, matchScore, req.params.id]);
    res.json({ success: true, message: 'Application stage updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating application.' });
  }
}

async function getMyApplications(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT a.id, j.title AS job_title, a.stage, a.match_score, a.applied_at
      FROM applications a JOIN jobs j ON a.job_id = j.id
      WHERE a.candidate_id = ? ORDER BY a.applied_at DESC
    `, [req.user.id]);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching your applications.' });
  }
}

async function deleteApplication(req, res) {
  try {
    await pool.query('DELETE FROM applications WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Application removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting application.' });
  }
}

module.exports = { getAllCandidates, applyToJob, updateApplicationStage, getMyApplications, deleteApplication };
