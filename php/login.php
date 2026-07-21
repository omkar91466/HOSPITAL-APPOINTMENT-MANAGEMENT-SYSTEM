<?php
require __DIR__ . '/db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') redirect_to('../login.html');

$email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$password = $_POST['password'] ?? '';
$accountType = ($_POST['account_type'] ?? 'user') === 'admin' ? 'admin' : 'user';

if (!$email || $password === '') redirect_to('../login.html', 'Enter your email and password to sign in.');

$statement = $pdo->prepare('SELECT id, name, password, role FROM users WHERE email = :email LIMIT 1');
$statement->execute(['email' => $email]);
$user = $statement->fetch();

if (!$user || !password_verify($password, $user['password'])) redirect_to('../login.html', 'The email or password is incorrect.');

$userRole = $user['role'] ?? 'user';
if ($accountType === 'admin' && $userRole !== 'admin') redirect_to('../login.html', 'Admin access is only available for administrator accounts.');
if ($accountType === 'user' && $userRole === 'admin') redirect_to('../login.html', 'Use the administrator sign-in option to access the admin portal.');

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['name'] = $user['name'];
$_SESSION['user_role'] = $userRole;

if ($accountType === 'admin') redirect_to('../admin.html?name=' . urlencode($user['name']), 'Welcome back, admin.');
redirect_to('../dashboard.html?name=' . urlencode($user['name']));

?>
