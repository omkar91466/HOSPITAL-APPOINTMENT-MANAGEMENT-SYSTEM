<?php
/**
 * Returns the authenticated doctor's appointments as JSON.
 */
require __DIR__ . '/db.php';
session_start();
header('Content-Type: application/json; charset=utf-8');

if (empty($_SESSION['doctor_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Authentication required. Please sign in as a doctor.']);
    exit;
}

$doctorId = (int) $_SESSION['doctor_id'];

// Get today's appointments for this doctor
$todayStmt = $pdo->prepare(
    "SELECT COUNT(*) AS today_count FROM appointments 
     WHERE doctor_id = :doctor_id AND DATE(appointment_date) = CURDATE() AND status = 'scheduled'"
);
$todayStmt->execute(['doctor_id' => $doctorId]);
$todayCount = $todayStmt->fetch();

// Get total patients for this doctor
$patientsStmt = $pdo->prepare(
    "SELECT COUNT(DISTINCT user_id) AS patient_count FROM appointments WHERE doctor_id = :doctor_id"
);
$patientsStmt->execute(['doctor_id' => $doctorId]);
$patientCount = $patientsStmt->fetch();

// Get all upcoming/scheduled appointments
$appointmentsStmt = $pdo->prepare(
    "SELECT a.id, a.appointment_date, a.notes, a.status, 
            u.name AS patient_name, u.email AS patient_email
     FROM appointments a 
     INNER JOIN users u ON u.id = a.user_id 
     WHERE a.doctor_id = :doctor_id 
     ORDER BY a.appointment_date ASC"
);
$appointmentsStmt->execute(['doctor_id' => $doctorId]);
$appointments = $appointmentsStmt->fetchAll();

// Get completed appointments count
$completedStmt = $pdo->prepare(
    "SELECT COUNT(*) AS completed_count FROM appointments WHERE doctor_id = :doctor_id AND status = 'completed'"
);
$completedStmt->execute(['doctor_id' => $doctorId]);
$completedCount = $completedStmt->fetch();

echo json_encode([
    'doctor_name' => $_SESSION['doctor_name'],
    'doctor_specialty' => $_SESSION['doctor_specialty'],
    'stats' => [
        'todayAppointments' => (int) ($todayCount['today_count'] ?? 0),
        'totalPatients' => (int) ($patientCount['patient_count'] ?? 0),
        'completedAppointments' => (int) ($completedCount['completed_count'] ?? 0),
    ],
    'appointments' => $appointments,
], JSON_UNESCAPED_UNICODE);

