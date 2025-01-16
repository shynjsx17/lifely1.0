<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../models/user.php';

// Initialize database connection
$database = new Database();
$db = $database->connect();

// Initialize user object
$user = new User($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate input
if(!isset($data->userEmail) || !isset($data->userPass)) {
    http_response_code(400);
    echo json_encode([
        'status' => false,
        'message' => 'Missing required fields'
    ]);
    exit();
}

try {
    // Attempt login
    $result = $user->login($data->userEmail, $data->userPass);

    if($result) {
        // Remove sensitive data before sending response
        unset($result['userPass']);
        
        http_response_code(200);
        echo json_encode([
            'status' => true,
            'message' => 'Login successful',
            'data' => [
                'id' => $result['id'],
                'userName' => $result['userName'],
                'userEmail' => $result['userEmail'],
                'session_token' => $result['session_token'],
                'created_at' => $result['created_at'],
                'updated_at' => $result['updated_at']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            'status' => false,
            'message' => 'Invalid credentials'
        ]);
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => false,
        'message' => 'Error during login',
        'error' => $e->getMessage()
    ]);
}
?>