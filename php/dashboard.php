<?php
require 'db.php';session_start();header('Content-Type: application/json');if(empty($_SESSION['user_id'])){http_response_code(401);exit;}
$s=$pdo->prepare('SELECT a.appointment_date,a.status,d.name AS doctor,d.specialty FROM appointments a JOIN doctors d ON d.id=a.doctor_id WHERE a.user_id=? ORDER BY a.appointment_date');$s->execute([$_SESSION['user_id']]);echo json_encode($s->fetchAll(PDO::FETCH_ASSOC));
?>
