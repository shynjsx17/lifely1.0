<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'lifely');
define('DB_USER', 'root');
define('DB_PASS', '');

// Error Reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Application configuration
define('BASE_URL', 'http://localhost/lifely1.0/');
date_default_timezone_set('Asia/Jakarta');

// Session configuration
session_start();
?>