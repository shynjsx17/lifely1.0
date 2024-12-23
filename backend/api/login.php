<?php
// Headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
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

    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if (!$data) {
        throw new Exception("Invalid JSON data");
    }

    if (empty($data->userEmail) || empty($data->userPass)) {
        throw new Exception("Missing required fields");
    }

    $user = new User($db);
    $user->userEmail = $data->userEmail;
    
    // Attempt login
    $result = $user->login();
    $row = $result->fetch(PDO::FETCH_ASSOC);
    
    if ($row) {
        if (password_verify($data->userPass, $row['userPass'])) {
            echo json_encode([
                "status" => true,
                "message" => "Login successful",
                "data" => [
                    "id" => $row['id'],
                    "userName" => $row['userName'],
                    "userEmail" => $row['userEmail']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                "status" => false,
                "message" => "Invalid password"
            ]);
        }
    } else {
        http_response_code(404);
        echo json_encode([
            "status" => false,
            "message" => "User not found"
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => $e->getMessage()
    ]);
}
?>