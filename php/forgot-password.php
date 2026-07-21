<?php
/** Accepts reset requests without revealing whether an account exists. */
declare(strict_types=1);

require __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_to('../forgot-password.html');
}

$email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
if (!$email) {
    redirect_to('../forgot-password.html', 'Please enter a valid email address.');
}

// Ready for future email-provider integration without exposing account existence.
$statement = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
$statement->execute(['email' => $email]);

redirect_to('../login.html', 'If an account exists for this email, password-reset instructions will be sent.');
?>
