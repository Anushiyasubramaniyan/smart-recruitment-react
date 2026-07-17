/* =====================================================
   INTERVIEW ROUTES
===================================================== */
const express = require('express');
const router = express.Router();
const { getAllInterviews, scheduleInterview, updateInterviewStatus, deleteInterview } = require('../controllers/interviewController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getAllInterviews);
router.post('/', verifyToken, requireRole('recruiter', 'admin'), scheduleInterview);
router.put('/:id/status', verifyToken, requireRole('recruiter', 'admin'), updateInterviewStatus);
router.delete('/:id', verifyToken, requireRole('recruiter', 'admin'), deleteInterview);

module.exports = router;
