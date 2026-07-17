/* =====================================================
   CANDIDATE / APPLICATION ROUTES
===================================================== */
const express = require('express');
const router = express.Router();
const { getAllCandidates, applyToJob, updateApplicationStage, getMyApplications, deleteApplication } = require('../controllers/candidateController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, requireRole('recruiter', 'admin'), getAllCandidates);
router.get('/my-applications', verifyToken, requireRole('candidate'), getMyApplications);
router.post('/apply', verifyToken, requireRole('candidate'), applyToJob);
router.put('/applications/:id/stage', verifyToken, requireRole('recruiter', 'admin'), updateApplicationStage);
router.delete('/applications/:id', verifyToken, requireRole('recruiter', 'admin'), deleteApplication);

module.exports = router;
