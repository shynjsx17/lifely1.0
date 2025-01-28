<?php
// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../php-errors.log');
error_reporting(E_ALL);

// Prevent PHP from outputting HTML errors
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once __DIR__ . '/../config/db_connect.php';
    require_once __DIR__ . '/../models/User.php';
    require_once __DIR__ . '/../services/MailService.php';

    $database = new Database();
    $db = $database->connect();
    $user = new User($db);
    $mailService = new MailService();

    $data = json_decode(file_get_contents("php://input"));
    
    if (!$data) {
        throw new Exception("Invalid JSON data received");
    }

    error_log("Processing reset password request for action: " . ($data->action ?? 'not set'));

    // Request password reset
    if (isset($data->action) && $data->action === 'request') {
        if (empty($data->email)) {
            throw new Exception("Email is required");
        }

        $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
        
        // Check if user exists
        if (!$user->emailExists($email)) {
            // For security, don't reveal if email exists or not
            http_response_code(200);
            echo json_encode([
                "status" => true,
                "message" => "If your email is registered, you will receive reset instructions shortly."
            ]);
            exit();
        }

        // Generate reset token
        $token = bin2hex(random_bytes(32));
        $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));

        // Save reset token
        if ($user->saveResetToken($email, $token, $expires_at)) {
            // Send reset email
            $resetLink = "http://localhost:3000/reset-password?token=" . $token;
            if ($mailService->sendPasswordReset($email, $resetLink)) {
                http_response_code(200);
                echo json_encode([
                    "status" => true,
                    "message" => "If your email is registered, you will receive reset instructions shortly."
                ]);
            } else {
                throw new Exception("Failed to send reset email");
            }
        } else {
            throw new Exception("Failed to save reset token");
        }
    }
    
    // Reset password with token
    else if (isset($data->action) && $data->action === 'reset') {
        if (empty($data->token) || empty($data->password)) {
            throw new Exception("Token and new password are required");
        }

        $token = filter_var($data->token, FILTER_SANITIZE_STRING);
        $password = $data->password;

        // Validate password
        if (strlen($password) < 8) {
            throw new Exception("Password must be at least 8 characters long");
        }

        // Verify token and update password
        if ($user->resetPassword($token, $password)) {
            http_response_code(200);
            echo json_encode([
                "status" => true,
                "message" => "Password has been reset successfully"
            ]);
        } else {
            throw new Exception("Invalid or expired reset token");
        }
    }
    
    else {
        throw new Exception("Invalid action");
    }

} catch (Throwable $e) {
    error_log("Reset Password Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
} 