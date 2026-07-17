-- =====================================================
-- SMART RECRUIT AI — SEED / DEMO DATA
-- =====================================================
-- Run AFTER schema.sql to populate demo data:
--   mysql -u root -p smart_recruitment_db < seed.sql
--
-- NOTE: All demo passwords are: Password123
-- (bcrypt hash below corresponds to that password)
-- =====================================================

USE smart_recruitment_db;

-- ---------------------------------------------------
-- Demo Users
-- password for all = "Password123"
-- ---------------------------------------------------
INSERT INTO users (name, email, password, role, status) VALUES
('Sanjay Kapoor', 'admin@smartrecruit.ai', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4kZ7lQ8L3H5F2fRZzYgB9x5Q6a1a', 'admin', 'Active'),
('Vikram Singh', 'vikram.singh@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4kZ7lQ8L3H5F2fRZzYgB9x5Q6a1a', 'recruiter', 'Active'),
('Meera Iyer', 'meera.iyer@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4kZ7lQ8L3H5F2fRZzYgB9x5Q6a1a', 'recruiter', 'Active'),
('Ananya Sharma', 'ananya.sharma@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4kZ7lQ8L3H5F2fRZzYgB9x5Q6a1a', 'candidate', 'Active'),
('Rohan Mehta', 'rohan.mehta@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4kZ7lQ8L3H5F2fRZzYgB9x5Q6a1a', 'candidate', 'Active'),
('Priya Nair', 'priya.nair@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4kZ7lQ8L3H5F2fRZzYgB9x5Q6a1a', 'candidate', 'Active'),
('Simran Kaur', 'simran.kaur@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4kZ7lQ8L3H5F2fRZzYgB9x5Q6a1a', 'candidate', 'Active');

-- ---------------------------------------------------
-- Demo Jobs (recruiter_id 2 = Vikram Singh)
-- ---------------------------------------------------
INSERT INTO jobs (title, department, location, type, description, required_skills, recruiter_id, status) VALUES
('Senior Frontend Developer', 'Engineering', 'Remote', 'Full-time', 'Build and maintain modern React-based web applications.', '["react","javascript","css","typescript"]', 2, 'Active'),
('Backend Engineer (Node.js)', 'Engineering', 'Bengaluru, IN', 'Full-time', 'Design and develop scalable REST APIs using Node.js and Express.', '["node.js","express","mongodb","sql"]', 2, 'Active'),
('Product Designer', 'Design', 'Hybrid', 'Full-time', 'Own the end-to-end design process for our core product.', '["figma","ui/ux"]', 3, 'Active'),
('Data Analyst', 'Data', 'Remote', 'Contract', 'Analyze recruitment funnel data and produce actionable insights.', '["sql","excel","tableau","power bi"]', 3, 'Paused'),
('DevOps Engineer', 'Infrastructure', 'Pune, IN', 'Full-time', 'Manage CI/CD pipelines and cloud infrastructure.', '["docker","kubernetes","aws","ci/cd"]', 2, 'Active');

-- ---------------------------------------------------
-- Demo Applications
-- ---------------------------------------------------
INSERT INTO applications (candidate_id, job_id, stage, match_score) VALUES
(4, 1, 'Interview', 92),
(5, 2, 'Screening', 87),
(6, 3, 'Applied', 78),
(7, 5, 'Offer', 95);

-- ---------------------------------------------------
-- Demo Interviews
-- ---------------------------------------------------
INSERT INTO interviews (candidate_id, job_id, recruiter_id, scheduled_date, scheduled_time, mode, status) VALUES
(4, 1, 2, '2026-07-18', '10:30:00', 'Video Call', 'Scheduled'),
(7, 5, 2, '2026-07-16', '14:00:00', 'On-site', 'Scheduled');

-- ---------------------------------------------------
-- Default Platform Settings
-- ---------------------------------------------------
INSERT INTO settings (setting_key, setting_value) VALUES
('platform_name', 'SmartRecruit AI'),
('support_email', 'support@smartrecruit.ai'),
('require_2fa', 'true'),
('auto_score_applicants', 'true');
