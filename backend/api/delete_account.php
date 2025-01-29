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
    Logger::info('Received delete account request', ['data' => $jsonData]);
    
    $data = json_decode($jsonData, true);
    
    if (!isset($data['user_id']) || !isset($data['password'])) {
        throw new Exception('User ID and password are required');
    }

    $userId = $data['user_id'];
    $password = $data['password'];

    // Initialize database connection
    $db = new Database();
    $conn = $db->getConnection();

    // First verify the user's password
    $query = "SELECT password_hash FROM users WHERE id = ? AND is_deleted = 0";
    $stmt = $conn->prepare($query);
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('User not found');
    }

    if (!password_verify($password, $user['password_hash'])) {
        throw new Exception('Invalid password');
    }

    // Soft delete the user's account
    $updateQuery = "UPDATE users SET 
                   is_deleted = 1,
                   deleted_at = NOW(),
                   email = CONCAT(email, '_deleted_', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'))
                   WHERE id = ?";
    
    $updateStmt = $conn->prepare($updateQuery);
    
    if (!$updateStmt->execute([$userId])) {
        throw new Exception('Failed to delete account');
    }

    Logger::info('Account deleted successfully', ['user_id' => $userId]);

    // Return success response
    echo json_encode([
        'status' => 'success',
        'message' => 'Your account has been successfully deleted'
    ]);

} catch (Exception $e) {
    Logger::error('Delete account error', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} 