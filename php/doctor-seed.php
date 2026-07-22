<?php
/**
 * Seeds the doctors table with login credentials.
 * Run this file ONCE after the database is set up.
 * Access via browser: http://localhost/collage-project/php/doctor-seed.php
 * Delete or protect this file after running.
 */
require __DIR__ . '/db.php';

try {
    // Add email and password columns if they don't exist
    $checkEmailCol = $pdo->query("SHOW COLUMNS FROM doctors LIKE 'email'");
    if (!$checkEmailCol->fetch()) {
        $pdo->exec("ALTER TABLE doctors ADD COLUMN email VARCHAR(150) UNIQUE AFTER specialty");
        echo "✅ Added 'email' column to doctors table.<br>";
    } else {
        echo "ℹ️ 'email' column already exists.<br>";
    }

    $checkPassCol = $pdo->query("SHOW COLUMNS FROM doctors LIKE 'password'");
    if (!$checkPassCol->fetch()) {
        $pdo->exec("ALTER TABLE doctors ADD COLUMN password VARCHAR(255) AFTER email");
        echo "✅ Added 'password' column to doctors table.<br>";
    } else {
        echo "ℹ️ 'password' column already exists.<br>";
    }

    // Seed credentials for existing doctors (only if password is empty)
    $doctors = [
        ['id' => 1, 'email' => 'ananya@carepoint.com', 'password' => 'doctor123'],
        ['id' => 2, 'email' => 'rohan@carepoint.com', 'password' => 'doctor123'],
        ['id' => 3, 'email' => 'priya@carepoint.com', 'password' => 'doctor123'],
    ];

    $updateStmt = $pdo->prepare("UPDATE doctors SET email = :email, password = :password WHERE id = :id AND (password IS NULL OR password = '')");
    $updated = 0;
    foreach ($doctors as $doctor) {
        $updateStmt->execute([
            'id' => $doctor['id'],
            'email' => $doctor['email'],
            'password' => password_hash($doctor['password'], PASSWORD_DEFAULT),
        ]);
        if ($updateStmt->rowCount()) $updated++;
    }

    echo "✅ Seeded {$updated} doctor account(s).<br><br>";
    echo "<strong>Doctor Login Credentials:</strong><br>";
    echo "Dr. Ananya Sharma → ananya@carepoint.com / doctor123<br>";
    echo "Dr. Rohan Mehta → rohan@carepoint.com / doctor123<br>";
    echo "Dr. Priya Nair → priya@carepoint.com / doctor123<br><br>";
    echo "⚠️ <strong>Important:</strong> Delete or protect this file after use!";
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage();
}

