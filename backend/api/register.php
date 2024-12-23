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

include_once '../config/db_connect.php';
include_once '../models/User.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    $user = new User($db);

    // Get and validate POST data
    $data = json_decode(file_get_contents("php://input"));
    
    if (!$data) {
        throw new Exception("Invalid JSON data");
    }

    if (empty($data->userName) || empty($data->userEmail) || empty($data->userPass)) {
        throw new Exception("Missing required fields");
    }

    // Set user properties
    $user->userName = htmlspecialchars(strip_tags($data->userName));
    $user->userEmail = htmlspecialchars(strip_tags($data->userEmail));
    $user->userPass = password_hash($data->userPass, PASSWORD_BCRYPT);

    // Check email exists
    if ($user->emailExists()) {
        http_response_code(409);
        echo json_encode([
            "status" => false,
            "message" => "Email already exists"
        ]);
        exit();
    }

    // Create user
    if ($user->create()) {
        http_response_code(201);
        echo json_encode([
            "status" => true,
            "message" => "User was created successfully."
        ]);
    } else {
        throw new Exception("Unable to create user");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => $e->getMessage()
    ]);
}
?>