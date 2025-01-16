<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once '../config/database.php';
require_once '../models/user.php';

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $data = json_decode(file_get_contents("php://input"));
    if (!$data) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }

    if (!isset($data->email) || !isset($data->name) || !isset($data->credential)) {
        throw new Exception('Missing required fields');
    }

    $database = new Database();
    $db = $database->connect();
    
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    $user = new User($db);

    // Check if user exists
    $existingUser = $user->findByEmail($data->email);

    if ($existingUser) {
        // Update existing user's Google credentials
        $user->id = $existingUser['id'];
        $user->google_id = $data->credential;
        $user->updateGoogleCredentials();
        
        // Log the user in
        $login_result = $user->googleAuth($data->email, $data->credential);
        
        if ($login_result) {
            unset($login_result['userPass']);
            http_response_code(200);
            echo json_encode([
                'status' => true,
                'message' => 'Login successful',
                'data' => $login_result
            ]);
        } else {
            throw new Exception("Failed to authenticate");
        }
    } else {
        // Create new user
        $user->userName = $data->name;
        $user->userEmail = $data->email;
        $user->google_id = $data->credential;
        // Generate a random password for Google users
        $user->userPass = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT);
        
        $userId = $user->create();
        
        if (!$userId) {
            throw new Exception("Failed to create user");
        }
        
        // Log the user in
        $login_result = $user->googleAuth($data->email, $data->credential);
        
        if ($login_result) {
            unset($login_result['userPass']);
            http_response_code(201);
            echo json_encode([
                'status' => true,
                'message' => 'User registered and logged in successfully',
                'data' => $login_result
            ]);
        } else {
            throw new Exception("Failed to authenticate after registration");
        }
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => false,
        'message' => $e->getMessage()
    ]);
} 