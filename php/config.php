<?php
/** Database credentials. Update these values for your local MySQL setup. */
define('DB_HOST', 'localhost');

define('DB_NAME', 'hospital_appointments');

define('DB_USER', 'root');

define('DB_PASS', '');


function redirect_to(string $path, string $message = '', string $type = 'error'): void {
    $separator = str_contains($path, '?') ? '&' : '?';

    $query = $message ? $separator . 'message=' . urlencode($message) . '&type=' . urlencode($type) : '';

    header('Location: ' . $path . $query);

    exit;

}
?>
