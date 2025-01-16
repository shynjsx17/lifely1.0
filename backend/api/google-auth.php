<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../models/user.php';

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
        if (!$user->updateGoogleCredentials()) {
            throw new Exception("Failed to update Google credentials");
        }
        
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
    error_log("Google Auth Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => false,
        'message' => $e->getMessage()
    ]);
} 