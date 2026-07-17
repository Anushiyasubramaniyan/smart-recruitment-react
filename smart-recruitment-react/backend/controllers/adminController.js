/* =====================================================
   ADMIN CONTROLLER
===================================================== */
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

async function getAllUsers(req, res) {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching users.' });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password || 'ChangeMe123', 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, "Active")',
      [name, email, hashedPassword, role]
    );
    res.status(201).json({ success: true, message: 'User created successfully.', userId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating user.' });
  }
}

async function updateUserStatus(req, res) {
  try {
    const { status } = req.body;
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'User status updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating user status.' });
  }
}

async function updateUser(req, res) {
  try {
    const { name, email, role } = req.body;
    await pool.query('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?', [name, email, role, req.params.id]);
    res.json({ success: true, message: 'User updated successfully.' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ success: false, message: 'Error updating user.' });
  }
}

async function deleteUser(req, res) {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting user.' });
  }
}

async function getDashboardStats(req, res) {
  try {
    const [[userCount]] = await pool.query('SELECT COUNT(*) AS count FROM users');
    const [[jobCount]] = await pool.query('SELECT COUNT(*) AS count FROM jobs');
    const [[appCount]] = await pool.query('SELECT COUNT(*) AS count FROM applications');
    const [[analysisCount]] = await pool.query('SELECT COUNT(*) AS count FROM resume_analyses');

    res.json({
      success: true,
      data: {
        totalUsers: userCount.count,
        totalJobs: jobCount.count,
        totalApplications: appCount.count,
        resumesAnalyzed: analysisCount.count
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats.' });
  }
}

module.exports = { getAllUsers, createUser, updateUserStatus, updateUser, deleteUser, getDashboardStats };
