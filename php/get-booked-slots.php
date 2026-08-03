<?php
/**
 * Returns booked time slots for a given doctor and date as JSON.
 * Used to hide already-booked slots from the appointment form.
 */
require __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$doctorId = filter_input(INPUT_GET, 'doctor_id', FILTER_VALIDATE_INT);
$date = $_GET['date'] ?? '';

if (!$doctorId || !$date) {
    echo json_encode(['booked_slots' => []]);
    exit;
}

// Validate date format (YYYY-MM-DD)
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    echo json_encode(['booked_slots' => []]);
    exit;
}

$stmt = $pdo->prepare(
    "SELECT DATE_FORMAT(appointment_date, '%H:%i') AS time_slot
     FROM appointments
     WHERE doctor_id = :doctor_id
       AND DATE(appointment_date) = :appointment_date
       AND status != 'cancelled'"
);
$stmt->execute([
    'doctor_id' => $doctorId,
    'appointment_date' => $date,
]);
$bookedSlots = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo json_encode(['booked_slots' => $bookedSlots]);

