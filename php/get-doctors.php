<?php
/**
 * Returns doctors/departments data as JSON.
 * Can filter by department (specialty).
 */
require __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

// Get distinct departments (specialties)
$deptStmt = $pdo->query("SELECT DISTINCT specialty AS department FROM doctors ORDER BY specialty ASC");
$departments = $deptStmt->fetchAll();

// Get all doctors
$deptFilter = $_GET['department'] ?? '';
if ($deptFilter) {
    $docStmt = $pdo->prepare("SELECT id, name, specialty, experience_years FROM doctors WHERE specialty = :specialty ORDER BY name ASC");
    $docStmt->execute(['specialty' => $deptFilter]);
} else {
    $docStmt = $pdo->query("SELECT id, name, specialty, experience_years FROM doctors ORDER BY name ASC");
}
$doctors = $docStmt->fetchAll();

echo json_encode([
    'departments' => $departments,
    'doctors' => $doctors,
]);

