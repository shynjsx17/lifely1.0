<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

require_once './config/database.php';
require_once './models/user.php';

// Initialize database connection
$database = new Database();
$db = $database->connect();

if ($_SERVER['REQUEST_METHOD'] === "OPTIONS") {
    http_response_code(200);
    exit();
}

$request = $_SERVER['REQUEST_URI'];
$uri = parse_url($request, PHP_URL_PATH);
$uri = explode('/', $uri);
$endpoint = end($uri);

switch ($endpoint) {
    case 'login':
        require_once './api/login.php';
        break;
        
    case 'register':
        require_once './api/register.php';
        break;
        
    case 'google-auth':
        require_once './api/google-auth.php';
        break;

    case 'tasks':
        require_once './api/tasks.php';
        break;

    case 'diary':
        require_once './api/diary.php';
        break;
        
    default:
        http_response_code(404);
        echo json_encode([
            'status' => false,
            'message' => 'Endpoint not found'
        ]);
        break;
}
?>