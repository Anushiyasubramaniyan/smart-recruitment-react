/* =====================================================
   ADMIN ROUTES
===================================================== */
const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, updateUserStatus, updateUser, deleteUser, getDashboardStats } = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/users', verifyToken, requireRole('admin'), getAllUsers);
router.post('/users', verifyToken, requireRole('admin'), createUser);
router.put('/users/:id', verifyToken, requireRole('admin'), updateUser);
router.put('/users/:id/status', verifyToken, requireRole('admin'), updateUserStatus);
router.delete('/users/:id', verifyToken, requireRole('admin'), deleteUser);
router.get('/stats', verifyToken, requireRole('admin'), getDashboardStats);

module.exports = router;
