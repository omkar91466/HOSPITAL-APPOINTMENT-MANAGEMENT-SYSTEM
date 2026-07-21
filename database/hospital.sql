CREATE DATABASE IF NOT EXISTS hospital_appointments CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hospital_appointments;

CREATE TABLE IF NOT EXISTS users (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(150) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS doctors (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, specialty VARCHAR(100) NOT NULL, experience_years TINYINT UNSIGNED NOT NULL DEFAULT 0, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appointments (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id INT UNSIGNED NOT NULL, doctor_id INT UNSIGNED NOT NULL, appointment_date DATETIME NOT NULL, notes VARCHAR(500) NULL, status ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT fk_appointments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT, INDEX idx_appointment_schedule (user_id, appointment_date)) ENGINE=InnoDB;

INSERT INTO doctors (id, name, specialty, experience_years) VALUES (1, 'Dr. Ananya Sharma', 'General Medicine', 12), (2, 'Dr. Rohan Mehta', 'Cardiology', 15), (3, 'Dr. Priya Nair', 'Pediatrics', 10) ON DUPLICATE KEY UPDATE name=VALUES(name), specialty=VALUES(specialty), experience_years=VALUES(experience_years);

