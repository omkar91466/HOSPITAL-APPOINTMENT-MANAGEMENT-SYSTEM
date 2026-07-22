<?php
require __DIR__ . '/db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') redirect_to('../login.html');

$email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$password = $_POST['password'] ?? '';
$accountType = $_POST['account_type'] ?? 'user';

if (!$email || $password === '') redirect_to('../login.html', 'Enter your email and password to sign in.');

// Handle doctor login
if ($accountType === 'doctor') {
    // Auto-migrate: add email/password columns if missing (older database setups)
    try { $pdo->exec("ALTER TABLE doctors ADD COLUMN email VARCHAR(150) UNIQUE AFTER specialty"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE doctors ADD COLUMN password VARCHAR(255) AFTER email"); } catch (PDOException $e) {}

    // Seed doctor credentials if empty (migration for older databases)
    $seedDoctors = [
        ['id' => 1, 'email' => 'ananya@carepoint.com', 'password' => password_hash('doctor123', PASSWORD_DEFAULT)],
        ['id' => 2, 'email' => 'rohan@carepoint.com', 'password' => password_hash('doctor123', PASSWORD_DEFAULT)],
        ['id' => 3, 'email' => 'priya@carepoint.com', 'password' => password_hash('doctor123', PASSWORD_DEFAULT)],
    ];
    $seedStmt = $pdo->prepare("UPDATE doctors SET email = :email, password = :password WHERE id = :id AND (password IS NULL OR password = '')");
    foreach ($seedDoctors as $sd) {
        $seedStmt->execute($sd);
    }

    $stmt = $pdo->prepare('SELECT id, name, specialty, email, password FROM doctors WHERE email = :email LIMIT 1');
    $stmt->execute(['email' => $email]);
    $doctor = $stmt->fetch();

    if (!$doctor || !password_verify($password, $doctor['password'])) {
        redirect_to('../login.html', 'The email or password is incorrect.');
    }

    session_regenerate_id(true);
    $_SESSION['doctor_id'] = (int) $doctor['id'];
    $_SESSION['doctor_name'] = $doctor['name'];
    $_SESSION['doctor_specialty'] = $doctor['specialty'];
    $_SESSION['doctor_email'] = $doctor['email'];
    $_SESSION['user_role'] = 'doctor';

    redirect_to('../doctor-dashboard.html?name=' . urlencode($doctor['name']), 'Welcome back, Dr. ' . $doctor['name'] . '.');
}

// Handle patient / admin login
$accountType = $accountType === 'admin' ? 'admin' : 'user';

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
