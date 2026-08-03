<?php
require __DIR__ . '/db.php';
session_start();

if (empty($_SESSION['user_id'])) {
    redirect_to('../login.html', 'Please sign in before booking an appointment.');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_to('../dashboard.html');
}

// Ensure uploads directory exists
$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Get form data
$doctorId = filter_input(INPUT_POST, 'doctor_id', FILTER_VALIDATE_INT);
$dateInput = $_POST['appointment_date'] ?? '';
$timeSlot = $_POST['time_slot'] ?? '';
$notes = trim($_POST['notes'] ?? '');

// Validate date
$appointmentDateTime = DateTime::createFromFormat('Y-m-d H:i', $dateInput . ' ' . $timeSlot);
if (!$doctorId || !$appointmentDateTime || !$timeSlot) {
    redirect_to('../dashboard.html', 'Please fill in all required fields.');
}

// Ensure appointment is in the future
$now = new DateTime();
if ($appointmentDateTime <= $now) {
    redirect_to('../dashboard.html', 'Please choose a valid future appointment time.');
}

// Validate time slot format (HH:MM)
if (!preg_match('/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/', $timeSlot)) {
    redirect_to('../dashboard.html', 'Please select a valid time slot.');
}

// Validate notes length
if (mb_strlen($notes) > 500) {
    redirect_to('../dashboard.html', 'Your visit note must be 500 characters or fewer.');
}

// Verify doctor exists
$doctorStatement = $pdo->prepare('SELECT id, name FROM doctors WHERE id = :id');
$doctorStatement->execute(['id' => $doctorId]);
$doctor = $doctorStatement->fetch();
if (!$doctor) {
    redirect_to('../dashboard.html', 'Please select a valid specialist.');
}

// Check doctor already has an appointment at this time slot
$checkStmt = $pdo->prepare(
    "SELECT id FROM appointments WHERE doctor_id = :doctor_id AND appointment_date = :appointment_date AND status != 'cancelled' LIMIT 1"
);
$checkStmt->execute([
    'doctor_id' => $doctorId,
    'appointment_date' => $appointmentDateTime->format('Y-m-d H:i:s'),
]);
if ($checkStmt->fetch()) {
    redirect_to('../dashboard.html', 'This time slot is already booked. Please choose another time.');
}

// Handle file upload
$reportPath = null;
if (!empty($_FILES['report']['name']) && $_FILES['report']['error'] === UPLOAD_ERR_OK) {
    $allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($fileInfo, $_FILES['report']['tmp_name']);
    finfo_close($fileInfo);

    if (!in_array($mimeType, $allowedTypes)) {
        redirect_to('../dashboard.html', 'Invalid file type. Allowed: PDF, JPG, PNG, DOC.');
    }

    $maxSize = 5 * 1024 * 1024; // 5 MB
    if ($_FILES['report']['size'] > $maxSize) {
        redirect_to('../dashboard.html', 'File is too large. Maximum size is 5 MB.');
    }

    $extension = pathinfo($_FILES['report']['name'], PATHINFO_EXTENSION);
    $safeName = 'report_' . uniqid() . '_' . time() . '.' . $extension;

    if (!move_uploaded_file($_FILES['report']['tmp_name'], $uploadDir . $safeName)) {
        redirect_to('../dashboard.html', 'Failed to upload the report. Please try again.');
    }

    $reportPath = 'uploads/' . $safeName;
}

// Insert appointment with report path
try {
    $statement = $pdo->prepare(
        'INSERT INTO appointments (user_id, doctor_id, appointment_date, notes, report_path) VALUES (:user_id, :doctor_id, :appointment_date, :notes, :report_path)'
    );
    $statement->execute([
        'user_id' => $_SESSION['user_id'],
        'doctor_id' => $doctorId,
        'appointment_date' => $appointmentDateTime->format('Y-m-d H:i:s'),
        'notes' => $notes ?: null,
        'report_path' => $reportPath,
    ]);

    $message = 'Your appointment with ' . $doctor['name'] . ' on ' . $appointmentDateTime->format('M j, Y \a\t g:i A') . ' has been confirmed.';
    redirect_to('../dashboard.html', $message, 'success');
} catch (PDOException $e) {
    redirect_to('../dashboard.html', 'Unable to book the appointment right now. Please try again.');
}


