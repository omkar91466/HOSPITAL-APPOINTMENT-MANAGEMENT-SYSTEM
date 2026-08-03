<?php
/**
 * Returns a single doctor's details as JSON by ID.
 */
require __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$doctorId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

if (!$doctorId) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or missing doctor ID.']);
    exit;
}

$stmt = $pdo->prepare(
    "SELECT id, name, specialty, experience_years, email, description FROM doctors WHERE id = :id LIMIT 1"
);
$stmt->execute(['id' => $doctorId]);
$doctor = $stmt->fetch();

if (!$doctor) {
    http_response_code(404);
    echo json_encode(['error' => 'Doctor not found.']);
    exit;
}

echo json_encode($doctor, JSON_UNESCAPED_UNICODE);

