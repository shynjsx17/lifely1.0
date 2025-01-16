<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../models/user.php';
require_once '../models/task.php';
require_once '../models/subtask.php';

// Initialize database connection
$database = new Database();
$db = $database->connect();

// Initialize objects
$user = new User($db);
$task = new Task($db);
$subtask = new Subtask($db);

// Debug: Log all headers
$headers = getallheaders();
error_log('All received headers: ' . print_r($headers, true));

// Debug: Log specific Authorization header
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : 
             (isset($headers['authorization']) ? $headers['authorization'] : 'not set');
error_log('Authorization header: ' . $auth_header);

// Verify authentication with debug logging
$user_id = $user->verifySession();
error_log('User verification result: ' . ($user_id ? $user_id : 'failed'));

if (!$user_id) {
    http_response_code(401);
    echo json_encode(['status' => false, 'message' => 'Unauthorized']);
    exit();
}

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Check if task_id is provided
        if(!isset($_GET['task_id'])) {
            http_response_code(400);
            echo json_encode(['status' => false, 'message' => 'Task ID is required']);
            exit();
        }

        // Verify task belongs to user
        $task->id = $_GET['task_id'];
        $task->user_id = $user_id;
        
        try {
            // Get subtasks
            $subtasks = $subtask->getSubtasksByTask($_GET['task_id']);
            
            // The result is already an array of subtasks, no need for while loop
            echo json_encode([
                'status' => true,
                'data' => array_map(function($row) {
                    return [
                        'id' => $row['id'],
                        'task_id' => $row['task_id'],
                        'title' => $row['title'],
                        'completed' => (bool)$row['completed'],
                        'created_at' => $row['created_at']
                    ];
                }, $subtasks)
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => false,
                'message' => 'Error fetching subtasks: ' . $e->getMessage()
            ]);
        }
        break;

    case 'POST':
        // Get posted data
        $data = json_decode(file_get_contents("php://input"));

        if(!isset($data->task_id) || !isset($data->title)) {
            http_response_code(400);
            echo json_encode(['status' => false, 'message' => 'Missing required fields']);
            exit();
        }

        // Verify task belongs to user
        $task->id = $data->task_id;
        $task->user_id = $user_id;

        // Set subtask properties
        $subtask->task_id = $data->task_id;
        $subtask->title = $data->title;

        // Create subtask
        if($subtask->create()) {
            http_response_code(201);
            echo json_encode([
                'status' => true,
                'message' => 'Subtask created successfully',
                'data' => [
                    'task_id' => $data->task_id,
                    'title' => $data->title
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['status' => false, 'message' => 'Error creating subtask']);
        }
        break;

    case 'PUT':
        // Get posted data
        $data = json_decode(file_get_contents("php://input"));

        if(!isset($data->id)) {
            http_response_code(400);
            echo json_encode(['status' => false, 'message' => 'Subtask ID is required']);
            exit();
        }

        // Set subtask ID
        $subtask->id = $data->id;

        // Get the task_id for this subtask
        $query = "SELECT task_id FROM subtasks WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $data->id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$result) {
            http_response_code(404);
            echo json_encode(['status' => false, 'message' => 'Subtask not found']);
            exit();
        }

        $subtask->task_id = $result['task_id'];

        // Check if this is a toggle action
        if (isset($data->action) && $data->action === 'toggle') {
            if($subtask->toggleComplete()) {
                // Get the updated subtask to return its current state
                $result = $subtask->getSubtaskById();
                echo json_encode([
                    'status' => true,
                    'message' => 'Subtask toggled successfully',
                    'data' => [
                        'id' => $result['id'],
                        'completed' => (bool)$result['completed']
                    ]
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['status' => false, 'message' => 'Error toggling subtask']);
            }
        } else {
            // Regular update
            $subtask->title = $data->title ?? null;
            $subtask->completed = $data->completed ?? null;

            if($subtask->update()) {
                echo json_encode([
                    'status' => true,
                    'message' => 'Subtask updated successfully',
                    'data' => [
                        'id' => $data->id,
                        'title' => $data->title,
                        'completed' => $data->completed
                    ]
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['status' => false, 'message' => 'Error updating subtask']);
            }
        }
        break;

    case 'DELETE':
        // Get subtask ID
        $data = json_decode(file_get_contents("php://input"));

        if(!isset($data->id)) {
            http_response_code(400);
            echo json_encode(['status' => false, 'message' => 'Subtask ID is required']);
            exit();
        }

        // Set ID to delete
        $subtask->id = $data->id;

        if($subtask->delete()) {
            echo json_encode([
                'status' => true,
                'message' => 'Subtask deleted successfully',
                'data' => ['id' => $data->id]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['status' => false, 'message' => 'Error deleting subtask']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['status' => false, 'message' => 'Method not allowed']);
        break;
} 