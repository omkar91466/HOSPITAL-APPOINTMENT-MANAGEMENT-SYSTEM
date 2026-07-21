<?php
require __DIR__ . '/db.php';
session_start();

header('Content-Type: application/json; charset=utf-8');

if (empty($_SESSION['user_id']) || ($_SESSION['user_role'] ?? 'user') !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Admin access is required.']);
    exit;
}

$appointmentsStatement = $pdo->query(
    'SELECT a.id, a.appointment_date, a.notes, a.status, u.name AS patient_name, u.email AS patient_email, d.name AS doctor_name, d.specialty AS doctor_specialty FROM appointments a INNER JOIN users u ON u.id = a.user_id INNER JOIN doctors d ON d.id = a.doctor_id ORDER BY a.appointment_date DESC'
);
$appointments = $appointmentsStatement->fetchAll();

$todayCountStatement = $pdo->query("SELECT COUNT(*) AS today_count FROM appointments WHERE DATE(appointment_date) = CURDATE()");
$todayCount = $todayCountStatement->fetch();

echo json_encode([
    'message' => 'Showing all appointments for the administrator.',
    'stats' => ['todayAppointments' => (int) ($todayCount['today_count'] ?? 0)],
    'appointments' => $appointments,
], JSON_UNESCAPED_UNICODE);
?>
