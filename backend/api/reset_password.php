<?php
// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../php-errors.log');
error_reporting(E_ALL);

// Prevent PHP from outputting HTML errors
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db_connect.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/ResetToken.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    $user = new User($db);
    $resetToken = new ResetToken($db);

    // Get posted data
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->token) || !isset($data->email) || !isset($data->password)) {
        throw new Exception("Token, email and new password are required");
    }

    $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
    $token = htmlspecialchars($data->token, ENT_QUOTES, 'UTF-8');
    $password = $data->password;

    // Verify token
    if (!$resetToken->verifyToken($token, $email)) {
        throw new Exception("Invalid or expired reset token");
    }

    // Update password
    $user->email = $email;
    $user->password_hash = password_hash($password, PASSWORD_DEFAULT);
    
    if (!$user->updatePassword()) {
        throw new Exception("Failed to update password");
    }

    // Mark token as used
    $resetToken->markTokenAsUsed($token, $email);

    http_response_code(200);
    echo json_encode([
        "status" => true,
        "message" => "Password has been reset successfully"
    ]);

} catch (Exception $e) {
    error_log("Password Reset Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => $e->getMessage()
    ]);
} 