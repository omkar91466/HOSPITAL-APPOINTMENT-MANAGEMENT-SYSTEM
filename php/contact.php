<?php
require __DIR__ . '/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$name    = trim($_POST['name'] ?? '');
$email   = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

$errors = [];
if (mb_strlen($name) < 2) {
    $errors[] = 'Please enter your full name.';
}
if (!$email) {
    $errors[] = 'A valid email address is required.';
}
if ($subject === '' || $subject === 'Choose a topic') {
    $errors[] = 'Please select a subject.';
}
if (mb_strlen($message) < 10) {
    $errors[] = 'Please write a message (at least 10 characters).';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

try {
    $statement = $pdo->prepare(
        'INSERT INTO contact_messages (name, email, subject, message) VALUES (:name, :email, :subject, :message)'
    );
    $statement->execute([
        'name'    => $name,
        'email'   => $email,
        'subject' => $subject,
        'message' => $message,
    ]);

    $firstName = explode(' ', $name)[0];

    echo json_encode([
        'success' => true,
        'message' => "Thank you, {$firstName}. Your message has been received. We'll get back to you shortly.",
    ]);
} catch (PDOException $exception) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Something went wrong. Please try again later.']);
}

