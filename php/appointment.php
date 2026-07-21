<?php
require __DIR__ . '/db.php';
session_start();

if (empty($_SESSION['user_id'])) redirect_to('../login.html', 'Please sign in before booking an appointment.');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') redirect_to('../dashboard.html');

$doctorId = filter_input(INPUT_POST, 'doctor_id', FILTER_VALIDATE_INT);
$dateInput = $_POST['appointment_date'] ?? '';
$notes = trim($_POST['notes'] ?? '');
$appointmentDate = DateTime::createFromFormat('Y-m-d\TH:i', $dateInput);

if (!$doctorId || !$appointmentDate || $appointmentDate <= new DateTime()) redirect_to('../dashboard.html', 'Please choose a valid future appointment time.');

if (mb_strlen($notes) > 500) redirect_to('../dashboard.html', 'Your visit note must be 500 characters or fewer.');

$doctorStatement = $pdo->prepare('SELECT id FROM doctors WHERE id = :id');
$doctorStatement->execute(['id' => $doctorId]);
if (!$doctorStatement->fetch()) redirect_to('../dashboard.html', 'Please select a valid specialist.');

$statement = $pdo->prepare('INSERT INTO appointments (user_id, doctor_id, appointment_date, notes) VALUES (:user_id, :doctor_id, :appointment_date, :notes)');
$statement->execute(['user_id' => $_SESSION['user_id'], 'doctor_id' => $doctorId, 'appointment_date' => $appointmentDate->format('Y-m-d H:i:s'), 'notes' => $notes ?: null]);
redirect_to('../dashboard.html?name=' . urlencode($_SESSION['name']), 'Your appointment has been confirmed.');

?>
