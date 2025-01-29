<?php
// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../php-errors.log');
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/../../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

try {
    // Get JSON data from request body
    $jsonData = file_get_contents('php://input');
    Logger::info('Received forgot password request', ['data' => $jsonData]);
    
    $data = json_decode($jsonData, true);
    $email = $data['email'] ?? null;

    if (!$email) {
        throw new Exception('Email is required');
    }

    // Initialize database connection
    $db = new Database();
    $conn = $db->getConnection();

    // Check if user exists
    $query = "SELECT id, username FROM users WHERE email = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('No account found with this email');
    }

    // Generate reset token
    $token = bin2hex(random_bytes(32));
    $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));

    // Delete any existing tokens for this user
    $deleteQuery = "DELETE FROM password_reset_tokens WHERE user_id = ?";
    $deleteStmt = $conn->prepare($deleteQuery);
    $deleteStmt->execute([$user['id']]);

    // Insert new token
    $insertQuery = "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)";
    $insertStmt = $conn->prepare($insertQuery);
    $insertStmt->execute([$user['id'], $token, $expires_at]);

    // Initialize PHPMailer
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'lifelywebdev@gmail.com';
    $mail->Password = 'iayp clqr hztl hdfq';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->setFrom('lifelywebdev@gmail.com', 'Lifely Support');

    // Create reset link
    $reset_link = "http://localhost:3000/reset-password?token=" . urlencode($token) . "&email=" . urlencode($email);

    // Set email content
    $mail->addAddress($email, $user['username']);
    $mail->isHTML(true);
    $mail->Subject = 'Reset Your Lifely Password';
    
    // Email template
    $emailBody = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <h2 style='color: #FB923C;'>Reset Your Password</h2>
            <p>Hello {$user['username']},</p>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <div style='text-align: center; margin: 30px 0;'>
                <a href='{$reset_link}' style='background-color: #FB923C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;'>Reset Password</a>
            </div>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>Best regards,<br>The Lifely Team</p>
        </div>
    ";

    $mail->Body = $emailBody;
    $mail->AltBody = "Reset your password by clicking this link: {$reset_link}";

    $mail->send();

    echo json_encode([
        'status' => 'success',
        'message' => 'Password reset instructions have been sent to your email'
    ]);

} catch (Exception $e) {
    Logger::error('Forgot password error', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} 