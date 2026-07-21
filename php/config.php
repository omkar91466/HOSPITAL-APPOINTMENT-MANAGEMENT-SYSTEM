<?php
/** Database credentials. Update these values for your local MySQL setup. */
define('DB_HOST', 'localhost');

define('DB_NAME', 'hospital_appointments');

define('DB_USER', 'root');

define('DB_PASS', '');


function redirect_to(string $path, string $message = ''): void {
    $separator = str_contains($path, '?') ? '&' : '?';

    header('Location: ' . $path . ($message ? $separator . 'message=' . urlencode($message) : ''));

    exit;

}
?>
