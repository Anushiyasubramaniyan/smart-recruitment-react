/* =====================================================
   RESUME ANALYSIS ROUTES
===================================================== */
const express = require('express');
const router = express.Router();
const { analyzeText, analyzeFile } = require('../controllers/resumeController');
const upload = require('../middleware/uploadMiddleware');

// Analyze pasted resume text (candidate self-check or recruiter screening)
router.post('/analyze', analyzeText);

// Analyze an uploaded resume file (PDF/DOCX/TXT)
router.post('/analyze-file', upload.single('resume'), analyzeFile);

module.exports = router;
