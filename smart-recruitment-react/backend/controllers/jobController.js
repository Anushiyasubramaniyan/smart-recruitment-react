/* =====================================================
   JOBS CONTROLLER
===================================================== */
const { pool } = require('../config/db');

async function getAllJobs(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching jobs.' });
  }
}

async function getJobById(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Job not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching job.' });
  }
}

async function createJob(req, res) {
  try {
    const { title, department, location, type, description, requiredSkills, recruiterId } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Job title is required.' });

    const [result] = await pool.query(
      `INSERT INTO jobs (title, department, location, type, description, required_skills, recruiter_id, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', NOW())`,
      [title, department || 'General', location || 'Remote', type || 'Full-time', description || '',
        JSON.stringify(requiredSkills || []), recruiterId || req.user.id]
    );

    res.status(201).json({ success: true, message: 'Job posted successfully.', jobId: result.insertId });
  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({ success: false, message: 'Error creating job.' });
  }
}

async function updateJob(req, res) {
  try {
    const { title, department, location, type, description, status, requiredSkills } = req.body;
    await pool.query(
      `UPDATE jobs SET title=?, department=?, location=?, type=?, description=?, status=?, required_skills=? WHERE id=?`,
      [title, department, location, type, description, status, JSON.stringify(requiredSkills || []), req.params.id]
    );
    res.json({ success: true, message: 'Job updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating job.' });
  }
}

async function deleteJob(req, res) {
  try {
    await pool.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Job deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting job.' });
  }
}

module.exports = { getAllJobs, getJobById, createJob, updateJob, deleteJob };
