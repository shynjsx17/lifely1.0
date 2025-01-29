<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

require_once '../config/Database.php';
require_once '../models/User.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check for authorization token
$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No authorization token provided']);
    exit();
}

$token = str_replace('Bearer ', '', $headers['Authorization']);

// Initialize database connection
$database = new Database();
$db = $database->connect();
$user = new User($db);

// Verify token
if (!$user->verifySessionToken($token)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid token']);
    exit();
}

// Handle profile image upload
if (isset($_FILES['profile_image'])) {
    $file = $_FILES['profile_image'];
    $userId = $_POST['user_id'];
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($file['type'], $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid file type']);
        exit();
    }
    
    // Validate file size (5MB max)
    if ($file['size'] > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'File too large']);
        exit();
    }
    
    // Create uploads directory if it doesn't exist
    $uploadDir = '../uploads/profile_images/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '.' . $extension;
    $filepath = $uploadDir . $filename;
    
    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        // Update database with new image path
        $imageUrl = 'uploads/profile_images/' . $filename;
        if ($user->updateProfileImage($userId, $imageUrl)) {
            echo json_encode([
                'success' => true,
                'message' => 'Profile image updated successfully',
                'profile_image_url' => $imageUrl
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update profile image in database']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to upload image']);
    }
}
// Handle name update
else {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['name']) && isset($data['user_id'])) {
        if ($user->updateName($data['user_id'], $data['name'])) {
            echo json_encode([
                'success' => true,
                'message' => 'Name updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update name']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    }
} 