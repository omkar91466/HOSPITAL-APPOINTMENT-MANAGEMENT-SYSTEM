<?php
require __DIR__ . '/db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') redirect_to('../login.html');

$email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$password = $_POST['password'] ?? '';

if (!$email || $password === '') redirect_to('../login.html', 'Enter your email and password to sign in.');

$statement = $pdo->prepare('SELECT id, name, password FROM users WHERE email = :email LIMIT 1');
$statement->execute(['email' => $email]);
$user = $statement->fetch();

if (!$user || !password_verify($password, $user['password'])) redirect_to('../login.html', 'The email or password is incorrect.');

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['name'] = $user['name'];
redirect_to('../dashboard.html?name=' . urlencode($user['name']));

?>
