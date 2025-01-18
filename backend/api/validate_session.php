<?php
require_once __DIR__ . '/../config/db_connect.php';
require_once __DIR__ . '/../utils/session_helper.php';

// Set headers
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Prevent any output before JSON response
ob_clean();

try {
    // Get database connection
    $conn = get_database_connection();
    
    // Validate session and get user_id
    $user_id = validateSessionToken();
    if (!$user_id) {
        throw new Exception('Invalid or expired session');
    }

    // Get user details
    $stmt = $conn->prepare("SELECT id, email, username FROM users WHERE id = :user_id");
    $stmt->execute(['user_id' => $user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('User not found');
    }

    // Return success response
    echo json_encode([
        'status' => 'success',
        'data' => [
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'username' => $user['username']
            ]
        ]
    ]);

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} 