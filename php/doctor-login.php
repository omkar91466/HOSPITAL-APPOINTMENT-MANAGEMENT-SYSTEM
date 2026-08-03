<?php
/**
 * Doctor authentication endpoint.
 * Validates credentials against the doctors table and starts a doctor session.
 */
require __DIR__ . '/config.php';
require __DIR__ . '/db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_to('../doctor-login.html');
}

$email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$password = $_POST['password'] ?? '';

if (!$email || $password === '') {
    redirect_to('../doctor-login.html', 'Enter your email and password to sign in.');
}

$statement = $pdo->prepare('SELECT id, name, specialty, email, password FROM doctors WHERE email = :email LIMIT 1');
$statement->execute(['email' => $email]);
$doctor = $statement->fetch();

if (!$doctor || !password_verify($password, $doctor['password'])) {
    redirect_to('../doctor-login.html', 'The email or password is incorrect.');
}

session_regenerate_id(true);
$_SESSION['doctor_id'] = (int) $doctor['id'];
$_SESSION['doctor_name'] = $doctor['name'];
$_SESSION['doctor_specialty'] = $doctor['specialty'];
$_SESSION['doctor_email'] = $doctor['email'];
$_SESSION['user_role'] = 'doctor';

redirect_to('../doctor-dashboard.html?name=' . urlencode($doctor['name']), 'Welcome back, Dr. ' . $doctor['name'] . '.', 'success');

