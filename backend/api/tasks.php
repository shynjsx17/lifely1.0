<?php
// Prevent PHP from displaying errors that would break JSON output
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Start output buffering
ob_start();

// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    }
    
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    
    exit(0);
}

// Clear any existing output
ob_clean();

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/TaskController.php';
require_once __DIR__ . '/../config/db_connect.php';

try {
    // Get request method
    $method = $_SERVER['REQUEST_METHOD'];

    // Get the user ID from the session token
    $user_id = null;
    $headers = getallheaders();

    if (isset($headers['Authorization'])) {
        $token = str_replace('Bearer ', '', $headers['Authorization']);
        
        try {
            // Connect to database
            $conn = get_database_connection();
            
            // Verify token and get user_id
            $stmt = $conn->prepare("SELECT user_id FROM user_sessions WHERE session_token = ? AND expires_at > NOW()");
            $stmt->execute([$token]);
            
            if ($stmt->rowCount() > 0) {
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                $user_id = $result['user_id'];
            }
        } catch (Exception $e) {
            error_log("Database error: " . $e->getMessage());
            throw new Exception('Database connection error');
        }
    }

    if (!$user_id) {
        throw new Exception('Unauthorized');
    }

    $taskController = new TaskController();

    switch ($method) {
        case 'GET':
            // Get tasks with optional filters
            $filters = [
                'list_type' => $_GET['list_type'] ?? null,
                'priority' => $_GET['priority'] ?? null,
                'is_completed' => isset($_GET['is_completed']) ? (bool)$_GET['is_completed'] : null
            ];

            // If subtasks endpoint is called
            if (isset($_GET['subtasks']) && isset($_GET['task_id'])) {
                $result = $taskController->getSubtasks($_GET['task_id']);
            } else {
                $result = $taskController->getTasks($user_id, $filters);
            }
            echo json_encode($result);
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            if (!$data) {
                throw new Exception('Invalid request data');
            }

            // If adding a subtask
            if (isset($_GET['subtask']) && isset($_GET['task_id'])) {
                $result = $taskController->addSubtask($_GET['task_id'], $data['title']);
            } else {
                $result = $taskController->createTask($user_id, $data);
            }

            if ($result['success']) {
                http_response_code(201);
            }
            echo json_encode($result);
            break;

        case 'PUT':
            // If toggling a subtask
            if (isset($_GET['subtask']) && isset($_GET['id'])) {
                $result = $taskController->toggleSubtask($_GET['id']);
            } else {
                $data = json_decode(file_get_contents("php://input"), true);
                if (!$data) {
                    throw new Exception('Invalid request data');
                }
                $result = $taskController->updateTask($user_id, $_GET['id'], $data);
            }

            echo json_encode($result);
            break;

        case 'DELETE':
            // Delete task
            if (!isset($_GET['id'])) {
                throw new Exception('Task ID is required');
            }
            $result = $taskController->deleteTask($user_id, $_GET['id']);
            echo json_encode($result);
            break;

        default:
            throw new Exception('Method not allowed');
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 