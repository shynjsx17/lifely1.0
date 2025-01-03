<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once './config/config.php';
require_once './config/db_connect.php';

$database = new Database();
$db = $database->connect(); 

$request = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

$uri = parse_url($request, PHP_URL_PATH);
$uri = explode('/', $uri);
$endpoint = end($uri);

if ($method === "OPTIONS") {
    header("HTTP/1.1 200 OK");
    exit();
}

switch ($endpoint) {
    case 'login':
        require_once './api/login.php';
        break;
        
    case 'register':
        require_once './api/register.php';
        break;
        
    default:
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint not found'
        ]);
        break;
}
?>