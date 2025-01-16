<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../models/user.php';

function authenticate($db) {
    // Start session if not already started
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // First check session authentication
    if (isset($_SESSION['user_id'])) {
        return $_SESSION['user_id'];
    }

    // Then check token authentication
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
        $arr = explode(" ", $auth_header);
        
        if (count($arr) === 2 && strtolower($arr[0]) === 'bearer') {
            $token = $arr[1];
            try {
                $decoded = JWT::decode($token, new Key(JWT_SECRET_KEY, 'HS256'));
                return $decoded->user_id;
            } catch (Exception $e) {
                error_log('Token verification failed: ' . $e->getMessage());
                return false;
            }
        }
    }

    return false;
} 