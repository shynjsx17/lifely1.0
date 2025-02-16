<?php
require_once __DIR__ . '/../config/db_connect.php';

// Set headers
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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
    
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['email']) || !isset($data['password'])) {
        throw new Exception('Email and password are required');
    }

    // Get user by email
    $stmt = $conn->prepare("SELECT id, email, password_hash, username FROM users WHERE email = :email");
    $stmt->execute(['email' => $data['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($data['password'], $user['password_hash'])) {
        throw new Exception('Invalid email or password');
    }

    // Generate session token
    $token = bin2hex(random_bytes(32));
    $expires_at = date('Y-m-d H:i:s', strtotime('+24 hours'));

    // Store session
    $stmt = $conn->prepare("
        INSERT INTO user_sessions (user_id, session_token, expires_at) 
        VALUES (:user_id, :session_token, :expires_at)
    ");
    
    $stmt->execute([
        'user_id' => $user['id'],
        'session_token' => $token,
        'expires_at' => $expires_at
    ]);

    // Return success response
    echo json_encode([
        'status' => 'success',
        'data' => [
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'username' => $user['username']
            ]
        ]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>