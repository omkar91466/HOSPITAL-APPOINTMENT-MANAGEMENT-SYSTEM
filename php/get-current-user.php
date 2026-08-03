<?php
/**
 * Returns the current logged-in user's name from the session.
 * Used by dashboard.js to populate the patient name field on page refresh.
 */
require __DIR__ . '/db.php';
session_start();
header('Content-Type: application/json; charset=utf-8');

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Authentication required.']);
    exit;
}

echo json_encode(['name' => $_SESSION['name'] ?? '']);

