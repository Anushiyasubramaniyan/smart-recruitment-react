/* =====================================================
   AI RESUME ANALYSIS ENGINE (Server-side)
   ---------------------------------------------------
   A fast, deterministic, explainable NLP-style scoring
   engine. It combines:
     1. Skill-keyword extraction & matching against a
        job description (or a provided skills list)
     2. Achievement/impact detection via action verbs
     3. Experience-years detection via regex parsing
     4. Resume completeness/formatting heuristic

   This is intentionally dependency-light (no external
   AI API calls) so resume analysis is instant, private,
   and works fully offline — ideal for a self-hosted
   recruitment system. Swap in a real LLM/embeddings call
   here later if you want deeper semantic matching.
===================================================== */

const SKILL_LIBRARY = [
  'javascript', 'python', 'java', 'react', 'node.js', 'node', 'express', 'sql', 'mongodb',
  'aws', 'docker', 'kubernetes', 'git', 'html', 'css', 'typescript', 'angular', 'vue',
  'machine learning', 'data analysis', 'communication', 'leadership', 'project management',
  'c++', 'c#', 'php', 'django', 'flask', 'spring boot', 'rest api', 'graphql', 'redis',
  'ci/cd', 'agile', 'scrum', 'figma', 'ui/ux', 'tensorflow', 'pytorch', 'excel', 'tableau',
  'power bi', 'linux', 'azure', 'gcp', 'devops', 'testing', 'jest', 'cypress'
];

const ACTION_VERBS = ['led', 'built', 'developed', 'designed', 'managed', 'created', 'launched',
  'improved', 'increased', 'reduced', 'implemented', 'optimized', 'delivered', 'coordinated', 'analyzed'];

function extractSkills(text) {
  const lower = text.toLowerCase();
  return SKILL_LIBRARY.filter(skill => lower.includes(skill));
}

function countActionVerbs(text) {
  const lower = text.toLowerCase();
  return ACTION_VERBS.filter(v => new RegExp(`\\b${v}\\b`).test(lower)).length;
}

function estimateExperienceYears(text) {
  const matches = text.match(/(\d+)\+?\s*(years|yrs)/gi);
  if (!matches) return 0;
  const nums = matches.map(m => parseInt(m.match(/\d+/)[0], 10));
  return Math.max(...nums);
}

/**
 * Core analysis function.
 * @param {Object} params
 * @param {string} params.resumeText - Extracted plain text of the resume
 * @param {string} [params.jobDescription] - Raw job description text
 * @param {string[]} [params.requiredSkills] - Explicit list of required skills (overrides JD parsing)
 */
function analyzeResume({ resumeText, jobDescription = '', requiredSkills = [] }) {
  const start = Date.now();

  const resumeSkills = extractSkills(resumeText);
  const jdSkills = requiredSkills.length
    ? requiredSkills.map(s => s.toLowerCase().trim())
    : extractSkills(jobDescription);

  const matchedSkills = jdSkills.filter(s => resumeSkills.includes(s));
  const missingSkills = jdSkills.filter(s => !resumeSkills.includes(s));

  const skillScore = jdSkills.length
    ? (matchedSkills.length / jdSkills.length) * 100
    : (resumeSkills.length > 0 ? 70 : 40);

  const verbCount = countActionVerbs(resumeText);
  const impactScore = Math.min(verbCount * 8, 100);

  const experienceYears = estimateExperienceYears(resumeText);
  const experienceScore = Math.min(experienceYears * 12, 100);

  const lengthScore = resumeText.length > 400 ? 100 : Math.max((resumeText.length / 400) * 100, 20);

  const overallScore = Math.round(
    skillScore * 0.5 +
    impactScore * 0.2 +
    experienceScore * 0.2 +
    lengthScore * 0.1
  );

  let verdict = 'Weak Match';
  if (overallScore >= 85) verdict = 'Excellent Match';
  else if (overallScore >= 70) verdict = 'Strong Match';
  else if (overallScore >= 50) verdict = 'Moderate Match';

  const suggestions = [];
  if (missingSkills.length) suggestions.push(`Add or highlight these keywords: ${missingSkills.slice(0, 5).join(', ')}`);
  if (verbCount < 4) suggestions.push('Use more strong action verbs (e.g., led, built, optimized) to describe achievements.');
  if (experienceYears === 0) suggestions.push('Clearly state your years of experience for each role.');
  if (resumeText.length < 400) suggestions.push('Resume looks short — add more detail on projects and measurable impact.');
  if (!suggestions.length) suggestions.push('Great resume! Consider quantifying achievements with metrics for even more impact.');

  return {
    overallScore: Math.min(overallScore, 100),
    verdict,
    matchedSkills,
    missingSkills,
    resumeSkills,
    breakdown: {
      skillMatch: Math.round(skillScore),
      impact: Math.round(impactScore),
      experience: Math.round(experienceScore),
      formatting: Math.round(lengthScore)
    },
    experienceYears,
    suggestions,
    analyzedAt: new Date().toISOString(),
    processingTimeMs: Date.now() - start || 1
  };
}

module.exports = { analyzeResume, extractSkills };
