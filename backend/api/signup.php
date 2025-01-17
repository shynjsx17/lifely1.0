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
    
    if (!isset($data['email']) || !isset($data['password']) || !isset($data['name'])) {
        throw new Exception('Name, email and password are required');
    }

    // Validate email
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute(['email' => $data['email']]);
    if ($stmt->fetch()) {
        throw new Exception('Email already exists');
    }

    // Hash password
    $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);

    // Insert new user
    $stmt = $conn->prepare("
        INSERT INTO users (username, email, password_hash) 
        VALUES (:username, :email, :password_hash)
    ");
    
    $stmt->execute([
        'username' => $data['name'],
        'email' => $data['email'],
        'password_hash' => $password_hash
    ]);

    $user_id = $conn->lastInsertId();

    // Generate session token
    $token = bin2hex(random_bytes(32));
    $expires_at = date('Y-m-d H:i:s', strtotime('+24 hours'));

    // Store session
    $stmt = $conn->prepare("
        INSERT INTO user_sessions (user_id, session_token, expires_at) 
        VALUES (:user_id, :session_token, :expires_at)
    ");
    
    $stmt->execute([
        'user_id' => $user_id,
        'session_token' => $token,
        'expires_at' => $expires_at
    ]);

    // Return success response
    echo json_encode([
        'status' => 'success',
        'data' => [
            'token' => $token,
            'user' => [
                'id' => $user_id,
                'email' => $data['email'],
                'username' => $data['name']
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