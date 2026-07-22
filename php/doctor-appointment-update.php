<?php
/**
 * Updates the status of an appointment (mark as completed / cancelled).
 * Only accessible by the assigned doctor.
 */
require __DIR__ . '/db.php';
session_start();
header('Content-Type: application/json; charset=utf-8');

if (empty($_SESSION['doctor_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Authentication required.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST requests are allowed.']);
    exit;
}

$appointmentId = filter_input(INPUT_POST, 'appointment_id', FILTER_VALIDATE_INT);
$newStatus = $_POST['status'] ?? '';

if (!$appointmentId || !in_array($newStatus, ['completed', 'cancelled'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Please provide a valid appointment ID and status (completed or cancelled).']);
    exit;
}

// Verify this appointment belongs to the logged-in doctor
$checkStmt = $pdo->prepare(
    "SELECT id FROM appointments WHERE id = :id AND doctor_id = :doctor_id"
);
$checkStmt->execute(['id' => $appointmentId, 'doctor_id' => $_SESSION['doctor_id']]);

if (!$checkStmt->fetch()) {
    http_response_code(403);
    echo json_encode(['error' => 'This appointment does not belong to you.']);
    exit;
}

$updateStmt = $pdo->prepare("UPDATE appointments SET status = :status WHERE id = :id");
$updateStmt->execute(['status' => $newStatus, 'id' => $appointmentId]);

echo json_encode(['message' => "Appointment #{$appointmentId} has been marked as {$newStatus}."]);

