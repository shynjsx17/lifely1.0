<?php
// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../php-errors.log');
error_reporting(E_ALL);

// Start output buffering to catch any unwanted output
ob_start();

// Prevent PHP from outputting HTML errors
ini_set('display_errors', 0);

// Set up error handler
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    Logger::error('PHP Error', [
        'error' => $errstr,
        'file' => $errfile,
        'line' => $errline
    ]);
    return true;
});

// Set up exception handler
set_exception_handler(function($e) {
    Logger::error('Unhandled Exception', [
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Internal server error: ' . $e->getMessage()
    ]);
});

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/cors_middleware.php';
require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/../../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Handle CORS
handleCors();

class ResetPasswordController {
    private $conn;
    private $mail;

    public function __construct() {
        try {
            $db = new Database();
            $this->conn = $db->getConnection();
            
            // Initialize PHPMailer with debug settings
            $this->mail = new PHPMailer(true);
            $this->mail->SMTPDebug = SMTP::DEBUG_SERVER;
            $this->mail->Debugoutput = function($str, $level) {
                Logger::info("PHPMailer Debug: $str");
            };
            
            $this->mail->isSMTP();
            $this->mail->Host = 'smtp.gmail.com';
            $this->mail->SMTPAuth = true;
            $this->mail->Username = 'lifelywebdev@gmail.com';
            $this->mail->Password = 'iayp clqr hztl hdfq';
            $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $this->mail->Port = 587;
            $this->mail->setFrom('lifelywebdev@gmail.com', 'Lifely Support');
            
            // Additional settings for Gmail
            $this->mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );
            
        } catch (Exception $e) {
            Logger::error('Failed to initialize mailer', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function sendResetEmail() {
        try {
            // Clean output buffer
            ob_clean();
            
            // Get JSON data from request body
            $jsonData = file_get_contents('php://input');
            Logger::info('Received request data', ['data' => $jsonData]);
            
            $data = json_decode($jsonData, true);
            $email = $data['email'] ?? null;

            if (!$email) {
                Logger::error('Reset password attempt without email');
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Email is required']);
                return;
            }

            Logger::info('Processing reset password request', ['email' => $email]);

            // Check if email exists in database
            $query = "SELECT id, username FROM users WHERE email = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                Logger::error('Reset password attempt for non-existent email', ['email' => $email]);
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'No account found with this email']);
                return;
            }

            Logger::info('User found', ['user_id' => $user['id'], 'username' => $user['username']]);

            // Generate reset token
            $token = bin2hex(random_bytes(32));
            $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));

            Logger::info('Generated new reset token', [
                'user_id' => $user['id'],
                'token_length' => strlen($token),
                'expires_at' => $expires_at
            ]);

            // Delete any existing tokens for this user
            $delete_query = "DELETE FROM password_reset_tokens WHERE user_id = ?";
            $delete_stmt = $this->conn->prepare($delete_query);
            $delete_stmt->execute([$user['id']]);

            Logger::info('Deleted existing tokens for user');

            // Insert new token
            $insert_query = "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)";
            $insert_stmt = $this->conn->prepare($insert_query);
            
            if (!$insert_stmt->execute([$user['id'], $token, $expires_at])) {
                Logger::error('Failed to insert reset token', [
                    'error' => $insert_stmt->errorInfo()
                ]);
                throw new Exception('Failed to generate reset token');
            }

            Logger::info('Reset token stored in database');

            // Create reset link
            $reset_link = "http://localhost:3000/reset-password?token=" . urlencode($token) . "&email=" . urlencode($email);

            // Clear any previous recipients
            $this->mail->clearAddresses();
            $this->mail->clearAllRecipients();

            // Set email content
            $this->mail->addAddress($email, $user['username']);
            $this->mail->isHTML(true);
            $this->mail->Subject = 'Reset Your Lifely Password';
            
            // Email template
            $emailBody = "
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                    <h2 style='color: #FB923C;'>Reset Your Password</h2>
                    <p>Hello {$user['username']},</p>
                    <p>We received a request to reset your password for your Lifely account. Click the button below to reset it:</p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='{$reset_link}' style='background-color: #FB923C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;'>Reset Password</a>
                    </div>
                    <p>This link will expire in 1 hour for security reasons.</p>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                    <p>Best regards,<br>The Lifely Team</p>
                </div>
            ";

            $this->mail->Body = $emailBody;
            $this->mail->AltBody = "Reset your password by clicking this link: {$reset_link}";

            Logger::info('Attempting to send email', ['to' => $email]);

            if (!$this->mail->send()) {
                throw new Exception('Mailer Error: ' . $this->mail->ErrorInfo);
            }
            
            Logger::info('Reset password email sent successfully', ['email' => $email]);
            echo json_encode([
                'status' => 'success',
                'message' => 'Password reset instructions have been sent to your email'
            ]);

        } catch (Exception $e) {
            // Clean output buffer before sending error response
            ob_clean();
            
            Logger::error('Failed to send reset password email', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to send reset email: ' . $e->getMessage()
            ]);
        }
    }
}

// Handle incoming requests
try {
    $controller = new ResetPasswordController();
    $request_method = $_SERVER['REQUEST_METHOD'];

    switch ($request_method) {
        case 'POST':
            $controller->sendResetEmail();
            break;
        default:
            http_response_code(405);
            echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    Logger::error('Controller error', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Internal server error: ' . $e->getMessage()
    ]);
}

// Flush output buffer
ob_end_flush(); 