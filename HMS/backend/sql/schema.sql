-- Run this once to set up the database:
--   mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS dashboard_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE dashboard_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'staff') NOT NULL DEFAULT 'staff',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  avatar_color VARCHAR(7) DEFAULT '#4F46E5',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  owner_id INT,
  status ENUM('planning', 'active', 'on_hold', 'completed') NOT NULL DEFAULT 'planning',
  progress TINYINT UNSIGNED NOT NULL DEFAULT 0,
  budget DECIMAL(12,2) DEFAULT 0,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- NOTE: Do not insert a hand-written password hash here.
-- Create your first admin account through POST /api/auth/register instead,
-- then (optionally) update its role to 'admin':
--   UPDATE users SET role = 'admin' WHERE email = 'you@example.com';

-- Sample project data (safe to run any time; owner_id is set after you register)
INSERT INTO projects (name, description, status, progress, budget, due_date) VALUES
('Website Redesign', 'Revamp the public marketing site', 'active', 65, 12000.00, '2026-11-30'),
('Mobile App Launch', 'iOS and Android release', 'planning', 20, 45000.00, '2027-01-15'),
('Data Migration', 'Move legacy DB to new cluster', 'completed', 100, 8000.00, '2026-08-01'),
('Q4 Marketing Campaign', 'Paid ads + content push', 'on_hold', 10, 15000.00, '2026-12-20');
