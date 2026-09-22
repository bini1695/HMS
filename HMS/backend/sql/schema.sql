-- Run this once to set up the database:
--   mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS hms_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hms_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'doctor', 'patient', 'receptionist', 'nurse', 'pharmacist', 'lab_technician', 'billing') NOT NULL DEFAULT 'patient',
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

CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  medical_record_no VARCHAR(32) NOT NULL UNIQUE,
  date_of_birth DATE,
  gender VARCHAR(30),
  blood_type VARCHAR(5),
  phone VARCHAR(40),
  address VARCHAR(255),
  allergies TEXT,
  emergency_contact VARCHAR(160),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT,
  receptionist_id INT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason VARCHAR(255),
  status ENUM('scheduled', 'checked_in', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  queue_number INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (receptionist_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS medical_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT,
  diagnosis VARCHAR(255),
  symptoms TEXT,
  treatment TEXT,
  notes TEXT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT,
  medicine VARCHAR(160) NOT NULL,
  dosage VARCHAR(120),
  instructions VARCHAR(255),
  status ENUM('pending', 'dispensed', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lab_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT,
  test_name VARCHAR(160) NOT NULL,
  priority ENUM('routine', 'urgent') NOT NULL DEFAULT 'routine',
  status ENUM('ordered', 'sample_collected', 'processing', 'completed') NOT NULL DEFAULT 'ordered',
  result TEXT,
  report_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS vitals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  nurse_id INT,
  temperature DECIMAL(4,1),
  blood_pressure VARCHAR(20),
  pulse INT,
  oxygen_level INT,
  notes TEXT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (nurse_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS beds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bed_number VARCHAR(20) NOT NULL UNIQUE,
  ward VARCHAR(80) NOT NULL,
  patient_id INT,
  status ENUM('available', 'occupied', 'maintenance') NOT NULL DEFAULT 'available',
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(160) NOT NULL,
  category VARCHAR(80),
  quantity INT NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 10,
  unit_price DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  invoice_no VARCHAR(40) NOT NULL UNIQUE,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  insurance_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('draft', 'unpaid', 'paid', 'insurance_pending') NOT NULL DEFAULT 'unpaid',
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctor_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NOT NULL,
  day_of_week TINYINT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(30),
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
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
