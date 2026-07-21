<?php
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

$name = trim($_POST['name'] ?? '');
$email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$password = trim($_POST['password'] ?? '');

if (mb_strlen($name) < 2 || !$email || mb_strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Please provide a valid name, email, and password with at least 6 characters.']);
    exit;
}

try {
    $statement = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $statement->execute(['email' => $email]);
    if ($statement->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'An account with this email already exists.']);
        exit;
    }

    $insertStatement = $pdo->prepare('INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)');
    $insertStatement->execute([
        'name' => $name,
        'email' => $email,
        'password' => password_hash($password, PASSWORD_DEFAULT),
        'role' => 'admin',
    ]);

    echo json_encode(['message' => 'Admin account created successfully.']);
}
catch (PDOException $exception) {
    http_response_code(500);
    echo json_encode(['error' => 'Unable to create the admin account right now.']);
}
?>
