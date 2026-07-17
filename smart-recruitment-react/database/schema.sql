-- =====================================================
-- SMART RECRUIT AI — DATABASE SCHEMA (MySQL)
-- =====================================================
-- Run this file to create the database and all tables:
--   mysql -u root -p < schema.sql
-- =====================================================



-- ---------------------------------------------------
-- USERS (admin, recruiter, candidate)
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'recruiter', 'candidate') NOT NULL DEFAULT 'candidate',
  status ENUM('Active', 'Suspended') NOT NULL DEFAULT 'Active',
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- JOBS
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  department VARCHAR(100) DEFAULT 'General',
  location VARCHAR(150) DEFAULT 'Remote',
  type ENUM('Full-time', 'Part-time', 'Contract', 'Internship') DEFAULT 'Full-time',
  description TEXT,
  required_skills JSON,
  recruiter_id INT,
  status ENUM('Active', 'Paused', 'Closed') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- APPLICATIONS (candidate applies to job)
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id INT NOT NULL,
  job_id INT NOT NULL,
  stage ENUM('Applied', 'Screening', 'Interview', 'Offer', 'Rejected') DEFAULT 'Applied',
  match_score INT DEFAULT NULL,
  resume_file_path VARCHAR(500),
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (candidate_id, job_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- RESUME ANALYSES (AI scoring history)
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS resume_analyses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id INT,
  job_id INT,
  overall_score INT NOT NULL,
  verdict VARCHAR(50),
  matched_skills JSON,
  missing_skills JSON,
  breakdown_json JSON,
  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- INTERVIEWS
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS interviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id INT NOT NULL,
  job_id INT NOT NULL,
  recruiter_id INT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  mode ENUM('Video Call', 'On-site', 'Phone') DEFAULT 'Video Call',
  status ENUM('Scheduled', 'Completed', 'Cancelled', 'No-show') DEFAULT 'Scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- NOTIFICATIONS (optional — powers the bell icon)
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- SETTINGS (platform-wide key/value config, used by admin settings page)
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------
-- Helpful indexes
-- ---------------------------------------------------
CREATE INDEX idx_applications_stage ON applications(stage);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_interviews_date ON interviews(scheduled_date);
CREATE INDEX idx_users_role ON users(role);
