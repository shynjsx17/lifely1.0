<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'lifely');
define('DB_USER', 'root');
define('DB_PASS', '');

// JWT configuration
define('JWT_SECRET_KEY', 'your-256-bit-secret');  // Change this to a secure secret key in production
define('JWT_EXPIRATION', 86400); // 24 hours

// Session configuration
ini_set('session.cookie_samesite', 'Lax');
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);

error_reporting(E_ALL);
ini_set('display_errors', 1);


define('BASE_URL', 'http://localhost/lifely1.0/');
date_default_timezone_set('Asia/Jakarta');


session_start();
?>