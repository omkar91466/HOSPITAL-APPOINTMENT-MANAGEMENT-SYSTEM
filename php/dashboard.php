<?php
require __DIR__ . '/db.php';
session_start();
header('Content-Type: application/json; charset=utf-8');

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Authentication required.']);
    exit;
}

$statement = $pdo->prepare(
    "SELECT a.id, a.appointment_date, a.notes, a.status, 
            d.name AS doctor, d.specialty 
     FROM appointments a 
     INNER JOIN doctors d ON d.id = a.doctor_id 
     WHERE a.user_id = :user_id 
     ORDER BY a.appointment_date DESC"
);
$statement->execute(['user_id' => $_SESSION['user_id']]);
echo json_encode($statement->fetchAll(), JSON_UNESCAPED_UNICODE);
