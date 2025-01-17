<?php
// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: POST, OPTIONS");
    }
    
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/AuthController.php';

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Only allow POST requests for actual operations
if ($method === 'POST') {
    // Get POST data
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid request data']);
        exit();
    }

    $auth = new AuthController();

    switch ($action) {
        case 'signup':
            $result = $auth->signup($data);
            if ($result['success']) {
                http_response_code(201);
            } else {
                http_response_code(400);
            }
            echo json_encode($result);
            break;

        case 'login':
            $result = $auth->login($data);
            if ($result['success']) {
                http_response_code(200);
            } else {
                http_response_code(401);
            }
            echo json_encode($result);
            break;

        default:
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Unknown action']);
            break;
    }
} else if ($method !== 'OPTIONS') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
} 