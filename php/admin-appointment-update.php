<?php
/**
 * Updates appointment status from admin panel.
 * Only accessible by admin users.
 */
require __DIR__ . '/db.php';
session_start();
header('Content-Type: application/json; charset=utf-8');

if (empty($_SESSION['user_id']) || ($_SESSION['user_role'] ?? 'user') !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Admin access is required.']);
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

$updateStmt = $pdo->prepare("UPDATE appointments SET status = :status WHERE id = :id");
$updateStmt->execute(['status' => $newStatus, 'id' => $appointmentId]);

echo json_encode(['message' => "Appointment #{$appointmentId} has been marked as {$newStatus} by admin."]);

