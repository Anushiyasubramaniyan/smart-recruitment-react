/* =====================================================
   INTERVIEWS CONTROLLER
===================================================== */
const { pool } = require('../config/db');

async function getAllInterviews(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT i.*, u.name AS candidate_name, j.title AS job_title
      FROM interviews i
      JOIN users u ON i.candidate_id = u.id
      JOIN jobs j ON i.job_id = j.id
      ORDER BY i.scheduled_date, i.scheduled_time
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching interviews.' });
  }
}

async function scheduleInterview(req, res) {
  try {
    const { candidateId, jobId, scheduledDate, scheduledTime, mode, notes } = req.body;
    if (!candidateId || !jobId || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ success: false, message: 'Candidate, job, date, and time are required.' });
    }
    const [result] = await pool.query(
      `INSERT INTO interviews (candidate_id, job_id, recruiter_id, scheduled_date, scheduled_time, mode, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Scheduled')`,
      [candidateId, jobId, req.user.id, scheduledDate, scheduledTime, mode || 'Video Call', notes || '']
    );
    res.status(201).json({ success: true, message: 'Interview scheduled successfully.', interviewId: result.insertId });
  } catch (err) {
    console.error('Schedule error:', err);
    res.status(500).json({ success: false, message: 'Error scheduling interview.' });
  }
}

async function updateInterviewStatus(req, res) {
  try {
    const { status } = req.body;
    await pool.query('UPDATE interviews SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Interview status updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating interview.' });
  }
}

async function deleteInterview(req, res) {
  try {
    await pool.query('DELETE FROM interviews WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Interview cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error cancelling interview.' });
  }
}

module.exports = { getAllInterviews, scheduleInterview, updateInterviewStatus, deleteInterview };
