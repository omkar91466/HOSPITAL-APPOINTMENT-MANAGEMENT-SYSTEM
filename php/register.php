<?php
require __DIR__ . '/db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') redirect_to('../login.html');

$name = trim($_POST['name'] ?? '');
$email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$password = $_POST['password'] ?? '';

if (mb_strlen($name) < 2 || !$email || strlen($password) < 6) redirect_to('../login.html#register', 'Please enter a name, valid email, and password with at least 6 characters.');

try { $statement = $pdo->prepare('INSERT INTO users (name, email, password) VALUES (:name, :email, :password)');
$statement->execute(['name' => $name, 'email' => $email, 'password' => password_hash($password, PASSWORD_DEFAULT)]);
session_regenerate_id(true);
$_SESSION['user_id'] = (int) $pdo->lastInsertId();
$_SESSION['name'] = $name;
$_SESSION['user_role'] = 'user';
redirect_to('../dashboard.html?name=' . urlencode($name), 'Welcome to CarePoint, ' . $name . '.', 'success');
}
catch (PDOException $exception) { redirect_to('../login.html#register', 'An account with this email address already exists.');
}
?>
