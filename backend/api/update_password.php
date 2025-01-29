<?php
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

try {
    // Get JSON data from request body
    $jsonData = file_get_contents('php://input');
    Logger::info('Received password reset request', ['data' => $jsonData]);
    
    $data = json_decode($jsonData, true);

    // Validate required fields
    if (!isset($data['token']) || !isset($data['email']) || !isset($data['password'])) {
        Logger::error('Missing required fields', ['data' => $data]);
        throw new Exception('Missing required fields');
    }

    $token = $data['token'];
    $email = $data['email'];
    $newPassword = $data['password'];

    Logger::info('Attempting password reset', [
        'email' => $email,
        'token_length' => strlen($token)
    ]);

    // Initialize database connection
    $db = new Database();
    $conn = $db->getConnection();

    // First, check if the token exists in the database
    $checkTokenQuery = "SELECT prt.*, u.email 
                       FROM password_reset_tokens prt 
                       JOIN users u ON prt.user_id = u.id 
                       WHERE prt.token = ?";
    $checkTokenStmt = $conn->prepare($checkTokenQuery);
    $checkTokenStmt->execute([$token]);
    $tokenData = $checkTokenStmt->fetch(PDO::FETCH_ASSOC);

    if (!$tokenData) {
        Logger::error('Token not found in database', ['token_length' => strlen($token)]);
        throw new Exception('Invalid reset token');
    }

    Logger::info('Token found in database', [
        'token_id' => $tokenData['id'],
        'expires_at' => $tokenData['expires_at']
    ]);

    // Check if token is expired
    if (strtotime($tokenData['expires_at']) < time()) {
        Logger::error('Token has expired', [
            'expires_at' => $tokenData['expires_at'],
            'current_time' => date('Y-m-d H:i:s')
        ]);
        throw new Exception('Reset token has expired');
    }

    // Verify email matches
    if ($tokenData['email'] !== $email) {
        Logger::error('Email mismatch', [
            'token_email' => $tokenData['email'],
            'provided_email' => $email
        ]);
        throw new Exception('Invalid reset token for this email');
    }

    // Hash the new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update the user's password using password_hash column
    $updateQuery = "UPDATE users SET password_hash = ? WHERE id = ?";
    $updateStmt = $conn->prepare($updateQuery);
    $updateStmt->execute([$hashedPassword, $tokenData['user_id']]);

    Logger::info('Password updated successfully', ['user_id' => $tokenData['user_id']]);

    // Delete the used token
    $deleteQuery = "DELETE FROM password_reset_tokens WHERE token = ?";
    $deleteStmt = $conn->prepare($deleteQuery);
    $deleteStmt->execute([$token]);

    Logger::info('Reset token deleted');

    // Return success response
    echo json_encode([
        'status' => 'success',
        'message' => 'Password has been successfully updated'
    ]);

} catch (Exception $e) {
    Logger::error('Password reset error', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} 