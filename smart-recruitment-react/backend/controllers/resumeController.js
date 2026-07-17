/* =====================================================
   RESUME ANALYSIS CONTROLLER
===================================================== */
const { analyzeResume } = require('../utils/aiEngine');
const { extractTextFromFile } = require('../utils/parseResume');
const { pool } = require('../config/db');
const fs = require('fs');

// Analyze raw pasted text (used by both candidate self-check and recruiter screening)
async function analyzeText(req, res) {
  try {
    const { resumeText, jobDescription, requiredSkills, jobId, candidateId } = req.body;
    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Resume text is too short to analyze.' });
    }

    const result = analyzeResume({ resumeText, jobDescription, requiredSkills });

    // Optionally persist the analysis if linked to a job/candidate
    if (jobId && candidateId) {
      await pool.query(
        `INSERT INTO resume_analyses (candidate_id, job_id, overall_score, verdict, matched_skills, missing_skills, breakdown_json, analyzed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [candidateId, jobId, result.overallScore, result.verdict,
          JSON.stringify(result.matchedSkills), JSON.stringify(result.missingSkills), JSON.stringify(result.breakdown)]
      ).catch(err => console.warn('Could not persist analysis (table may not exist yet):', err.message));
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({ success: false, message: 'Server error during resume analysis.' });
  }
}

// Analyze an uploaded resume file (PDF/DOCX/TXT)
async function analyzeFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No resume file uploaded.' });
    }
    const { jobDescription, requiredSkills } = req.body;

    const resumeText = await extractTextFromFile(req.file.path);
    const skillsArray = requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : [];

    const result = analyzeResume({ resumeText, jobDescription, requiredSkills: skillsArray });

    // Clean up uploaded file after processing (optional — keep if you want to store resumes)
    fs.unlink(req.file.path, () => {});

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('File analyze error:', err);
    res.status(500).json({ success: false, message: err.message || 'Could not process the uploaded resume.' });
  }
}

module.exports = { analyzeText, analyzeFile };
