<?php
require_once __DIR__ . '/config.php';

function ensure_user_schema(PDO $pdo): void {
    $statement = $pdo->query("SHOW COLUMNS FROM users LIKE 'role'");
    if ($statement->fetch()) {
        return;
    }

    $pdo->exec("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user' AFTER password");
}

function ensure_default_admin(PDO $pdo): void {
    $statement = $pdo->prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    $statement->execute();
    if ($statement->fetch()) {
        return;
    }

    $statement = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)");
    $statement->execute([
        'name' => 'System Administrator',
        'email' => 'admin@carepoint.com',
        'password' => password_hash('admin123', PASSWORD_DEFAULT),
        'role' => 'admin',
    ]);
}

function ensure_appointment_schema(PDO $pdo): void {
    $statement = $pdo->query("SHOW COLUMNS FROM appointments LIKE 'report_path'");
    if ($statement->fetch()) {
        return;
    }

    $pdo->exec("ALTER TABLE appointments ADD COLUMN report_path VARCHAR(500) NULL AFTER status");
}

try {
    $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
    ensure_user_schema($pdo);
    ensure_default_admin($pdo);
    ensure_appointment_schema($pdo);
}
catch (PDOException $exception) {
    http_response_code(500);

    exit('Database connection failed. Check the credentials in php/config.php.');
}
?>
