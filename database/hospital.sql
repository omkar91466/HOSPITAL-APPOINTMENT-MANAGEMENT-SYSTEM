CREATE DATABASE IF NOT EXISTS hospital_appointments CHARACTER SET utf8mb4; USE hospital_appointments;
CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(100) NOT NULL,email VARCHAR(150) NOT NULL UNIQUE,password VARCHAR(255) NOT NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE doctors (id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(100) NOT NULL,specialty VARCHAR(100) NOT NULL);
CREATE TABLE appointments (id INT AUTO_INCREMENT PRIMARY KEY,user_id INT NOT NULL,doctor_id INT NOT NULL,appointment_date DATETIME NOT NULL,status ENUM('scheduled','completed','cancelled') DEFAULT 'scheduled',created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id),FOREIGN KEY(doctor_id) REFERENCES doctors(id));
INSERT INTO doctors (name,specialty) VALUES ('Dr. Ananya Sharma','General Medicine'),('Dr. Rohan Mehta','Cardiology'),('Dr. Priya Nair','Pediatrics');
