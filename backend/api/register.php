<?php
// Prevent PHP from outputting HTML errors
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once '../config/db_connect.php';
    require_once '../models/User.php';
    require_once '../models/Verification.php';

    $database = new Database();
    $db = $database->connect();
    
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    $user = new User($db);
    $verification = new Verification($db);

    // Get and validate POST data
    $data = json_decode(file_get_contents("php://input"));
    
    if (!$data) {
        throw new Exception("Invalid JSON data");
    }

    if (empty($data->username) || empty($data->email) || empty($data->password)) {
        throw new Exception("Missing required fields");
    }

    // Set user properties for email check
    $user->email = htmlspecialchars(strip_tags($data->email));

    // Check if email exists
    if ($user->emailExists()) {
        http_response_code(409);
        echo json_encode([
            "status" => false,
            "message" => "Email already exists"
        ]);
        exit();
    }

    // If checkOnly is true, return success without creating user
    if (isset($data->checkOnly) && $data->checkOnly === true) {
        http_response_code(200);
        echo json_encode([
            "status" => true,
            "message" => "Email is available"
        ]);
        exit();
    }

    // Check if email is verified
    if (!$verification->isEmailVerified($data->email)) {
        http_response_code(403);
        echo json_encode([
            "status" => false,
            "message" => "Email not verified",
            "requiresVerification" => true
        ]);
        exit();
    }

    // Set remaining user properties
    $user->username = htmlspecialchars(strip_tags($data->username));
    $user->password_hash = password_hash($data->password, PASSWORD_BCRYPT);

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

} catch (Throwable $e) {
    error_log("Registration Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?>