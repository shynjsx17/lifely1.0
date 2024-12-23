<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "your_database_name";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        try {
            $user = json_decode(file_get_contents('php://input'), true);
            $sql = "INSERT INTO users (userName, userEmail, userPass, created_at, updated_at) VALUES (?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $created_at = date('Y-m-d H:i:s');
            $updated_at = date('Y-m-d H:i:s');
            $userPass = password_hash($user['password'], PASSWORD_DEFAULT); // Hash the password for security

            $stmt->bind_param("sssss", $user['name'], $user['email'], $userPass, $created_at, $updated_at);

            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'A new user has been created']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to create a new user']);
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    // ...existing code for other methods (e.g., GET for login)...

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
        break;
}

$conn->close();
?>

