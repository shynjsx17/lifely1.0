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
    // Log the incoming request
    $rawInput = file_get_contents("php://input");
    error_log("Verification request received: " . $rawInput);

    // Adjust the path to autoload.php
    require_once __DIR__ . '/../../vendor/autoload.php';
    require_once __DIR__ . '/../config/db_connect.php';
    require_once __DIR__ . '/../models/Verification.php';
    require_once __DIR__ . '/../services/MailService.php';

    $database = new Database();
    $db = $database->connect();
    $verification = new Verification($db);
    $mailService = new MailService();
    
    $data = json_decode($rawInput);
    
    if (!$data) {
        throw new Exception("Invalid JSON data received: " . $rawInput);
    }

    error_log("Processing verification request for action: " . ($data->action ?? 'not set'));

    // Generate OTP endpoint
    if (isset($data->action) && $data->action === 'generate') {
        if (empty($data->email)) {
            throw new Exception("Email is required");
        }

        $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
        error_log("Generating OTP for email: $email");
        
        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Set expiration time (15 minutes from now)
        $expires_at = date('Y-m-d H:i:s', strtotime('+15 minutes'));
        
        error_log("Generated OTP: $otp, Expires at: $expires_at");
        
        // Save OTP to database
        if ($verification->createOrUpdate($email, $otp, $expires_at)) {
            // Send email with OTP using MailService
            if ($mailService->sendOTP($email, $otp)) {
                http_response_code(200);
                echo json_encode([
                    "status" => true,
                    "message" => "OTP sent successfully"
                ]);
            } else {
                throw new Exception("Failed to send email");
            }
        } else {
            throw new Exception("Failed to save OTP");
        }
    }
    
    // Verify OTP endpoint
    else if (isset($data->action) && $data->action === 'verify') {
        if (empty($data->email) || empty($data->otp)) {
            throw new Exception("Email and OTP are required");
        }

        $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
        $otp = filter_var($data->otp, FILTER_SANITIZE_STRING);
        error_log("Verifying OTP for email: $email, OTP: $otp");

        if ($verification->verifyOTP($email, $otp)) {
            http_response_code(200);
            echo json_encode([
                "status" => true,
                "message" => "OTP verified successfully"
            ]);
        } else {
            throw new Exception("Invalid verification code");
        }
    }
    
    else {
        throw new Exception("Invalid action: " . ($data->action ?? 'not set'));
    }

} catch (Throwable $e) {
    $errorMessage = $e->getMessage();
    $errorTrace = $e->getTraceAsString();
    error_log("Verification Error: $errorMessage");
    error_log("Stack trace: $errorTrace");
    
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => "Server error: $errorMessage",
        "debug" => [
            "file" => $e->getFile(),
            "line" => $e->getLine(),
            "trace" => $errorTrace
        ]
    ]);
} 