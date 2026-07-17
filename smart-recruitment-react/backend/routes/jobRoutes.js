/* =====================================================
   JOB ROUTES
===================================================== */
const express = require('express');
const router = express.Router();
const { getAllJobs, getJobById, createJob, updateJob, deleteJob } = require('../controllers/jobController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', getAllJobs);
router.get('/:id', getJobById);
router.post('/', verifyToken, requireRole('recruiter', 'admin'), createJob);
router.put('/:id', verifyToken, requireRole('recruiter', 'admin'), updateJob);
router.delete('/:id', verifyToken, requireRole('recruiter', 'admin'), deleteJob);

module.exports = router;
