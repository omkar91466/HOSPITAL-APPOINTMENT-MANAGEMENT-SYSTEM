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

function ensure_contact_messages_schema(PDO $pdo): void {
    $statement = $pdo->query("SHOW TABLES LIKE 'contact_messages'");
    if ($statement->fetch()) {
        return;
    }

    $pdo->exec("CREATE TABLE contact_messages (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");
}

function ensure_doctor_description(PDO $pdo): void {
    $statement = $pdo->query("SHOW COLUMNS FROM doctors LIKE 'description'");
    if ($statement->fetch()) {
        return;
    }

    $pdo->exec("ALTER TABLE doctors ADD COLUMN description TEXT NULL AFTER experience_years");

    // Add default descriptions for existing doctors
    $pdo->exec("UPDATE doctors SET description = 'Dr. Ananya Sharma is a dedicated General Medicine specialist with over a decade of experience. She is passionate about preventive care and takes time to understand each patient&#039;s unique health concerns, offering personalized treatment plans.' WHERE name = 'Dr. Ananya Sharma' AND description IS NULL");
    $pdo->exec("UPDATE doctors SET description = 'Dr. Rohan Mehta is an experienced Cardiologist known for his precise diagnostic approach and compassionate patient care. He specializes in heart disease prevention, management, and post-treatment recovery.' WHERE name = 'Dr. Rohan Mehta' AND description IS NULL");
    $pdo->exec("UPDATE doctors SET description = 'Dr. Priya Nair is a caring Pediatrician who treats every child with warmth and patience. With a decade of experience, she excels in child development, vaccinations, and creating a comfortable environment for young patients.' WHERE name = 'Dr. Priya Nair' AND description IS NULL");
}

try {
    $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
    ensure_user_schema($pdo);
    ensure_default_admin($pdo);
    ensure_appointment_schema($pdo);
    ensure_contact_messages_schema($pdo);
    ensure_doctor_description($pdo);
}
catch (PDOException $exception) {
    http_response_code(500);

    exit('Database connection failed. Check the credentials in php/config.php.');
}
?>
