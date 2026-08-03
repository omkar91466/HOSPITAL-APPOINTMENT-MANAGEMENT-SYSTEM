<?php
/** Resets a user password directly when the account exists. */
declare(strict_types=1);

require __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_to('../forgot-password.html');
}

$email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$newPassword = trim($_POST['password'] ?? '');
$confirmPassword = trim($_POST['confirm_password'] ?? '');

if (!$email || mb_strlen($newPassword) < 6 || $newPassword !== $confirmPassword) {
    redirect_to('../forgot-password.html', 'Please enter a valid email and matching password with at least 6 characters.');
}

$statement = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
$statement->execute(['email' => $email]);

if ($statement->fetch()) {
    $updateStatement = $pdo->prepare('UPDATE users SET password = :password WHERE email = :email');
    $updateStatement->execute(['password' => password_hash($newPassword, PASSWORD_DEFAULT), 'email' => $email]);
}

redirect_to('../login.html', 'If that email is registered, the password has been updated. Please sign in.', 'success');
?>
