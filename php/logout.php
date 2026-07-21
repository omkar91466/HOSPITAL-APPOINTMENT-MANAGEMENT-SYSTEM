<?php
/** Safely closes the active patient session and returns to the home page. */
declare(strict_types=1);


session_start();


// Clear all server-side session values first.
$_SESSION = [];


// Expire the session cookie in the browser if PHP is using cookie sessions.
if (ini_get('session.use_cookies')) {
    $cookieParameters = session_get_cookie_params();

    setcookie(
        session_name(),
        '',
        time() - 42000,
        $cookieParameters['path'],
        $cookieParameters['domain'],
        $cookieParameters['secure'],
        $cookieParameters['httponly']
    );

}
session_destroy();

header('Location: ../index.html');

exit;

?>
