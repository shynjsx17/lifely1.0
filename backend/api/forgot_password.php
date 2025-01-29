<?php
// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../php-errors.log');
error_reporting(E_ALL);

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
require_once __DIR__ . '/../services/MailService.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    $user = new User($db);
    $resetToken = new ResetToken($db);
    $mailService = new MailService();

    // Get posted data
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->email)) {
        throw new Exception("Email is required");
    }

    $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
    
    // Check if email exists
    $user->email = $email;
    if (!$user->emailExists()) {
        // For security reasons, still return success even if email doesn't exist
        http_response_code(200);
        echo json_encode([
            "status" => true,
            "message" => "If your email is registered, you will receive password reset instructions."
        ]);
        exit();
    }

    // Generate reset token
    $token = $resetToken->createToken($email);
    
    // Create reset link
    $resetLink = "http://localhost:3000/reset-password?token=" . $token . "&email=" . urlencode($email);
    
    // Send email with reset link
    $emailSent = $mailService->sendPasswordResetLink($email, $resetLink);
    
    if (!$emailSent) {
        throw new Exception("Failed to send password reset email");
    }

    http_response_code(200);
    echo json_encode([
        "status" => true,
        "message" => "Password reset instructions have been sent to your email"
    ]);

} catch (Exception $e) {
    error_log("Password Reset Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => "Failed to process password reset request"
    ]);
} 