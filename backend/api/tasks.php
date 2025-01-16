<?php
// Set CORS headers for development
$allowed_origins = array(
    'http://localhost:3000',
    'http://localhost'
);

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $origin);
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../models/user.php';
require_once '../models/task.php';
require_once '../models/subtask.php';

// Get the Authorization header
$auth_header = null;
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
} elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $auth_header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
} elseif (isset($_SERVER['HTTP_AUTHORIZATION_TOKEN'])) {
    $auth_header = 'Bearer ' . $_SERVER['HTTP_AUTHORIZATION_TOKEN'];
}

// Initialize database connection
$database = new Database();
$db = $database->connect();

// Initialize objects
$user = new User($db);
$task = new Task($db);
$subtask = new Subtask($db);

// Verify authentication
if (!$auth_header) {
    http_response_code(401);
    echo json_encode(['status' => false, 'message' => 'No authorization header provided']);
    exit();
}

$user_id = $user->verifySession();
if (!$user_id) {
    http_response_code(401);
    echo json_encode(['status' => false, 'message' => 'Invalid or expired session']);
    exit();
}

// Process request based on method
switch($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Get query parameters
        $list_type = isset($_GET['list_type']) ? $_GET['list_type'] : null;
        $archived = isset($_GET['archived']) ? (bool)$_GET['archived'] : false;

        // Build query
        $query = "SELECT * FROM tasks WHERE user_id = :user_id";
        $params = [':user_id' => $user_id];

        if ($list_type) {
            $query .= " AND list_type = :list_type";
            $params[':list_type'] = $list_type;
        }

        if (isset($_GET['archived'])) {
            $query .= " AND archived = :archived";
            $params[':archived'] = $archived;
        }

        $query .= " ORDER BY created_at DESC";

        // Execute query
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get subtasks for each task
        foreach ($tasks as &$task) {
            $subtaskQuery = "SELECT * FROM subtasks WHERE task_id = :task_id ORDER BY created_at ASC";
            $subtaskStmt = $db->prepare($subtaskQuery);
            $subtaskStmt->execute([':task_id' => $task['id']]);
            $task['subtasks'] = $subtaskStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        echo json_encode(['status' => true, 'data' => $tasks]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['title']) || !isset($data['list_type'])) {
            http_response_code(400);
            echo json_encode(['status' => false, 'message' => 'Missing required fields']);
            exit();
        }

        $query = "INSERT INTO tasks (user_id, title, list_type, priority_tag, notes, reminder_date, reminder_time) 
                 VALUES (:user_id, :title, :list_type, :priority_tag, :notes, :reminder_date, :reminder_time)";
        
        $stmt = $db->prepare($query);
        $params = [
            ':user_id' => $user_id,
            ':title' => $data['title'],
            ':list_type' => $data['list_type'],
            ':priority_tag' => $data['priority_tag'] ?? null,
            ':notes' => $data['notes'] ?? null,
            ':reminder_date' => $data['reminder_date'] ?? null,
            ':reminder_time' => $data['reminder_time'] ?? null
        ];

        if ($stmt->execute($params)) {
            $task_id = $db->lastInsertId();
            
            // Handle subtasks if provided
            if (isset($data['subtasks']) && is_array($data['subtasks'])) {
                $subtaskQuery = "INSERT INTO subtasks (task_id, title) VALUES (:task_id, :title)";
                $subtaskStmt = $db->prepare($subtaskQuery);
                
                foreach ($data['subtasks'] as $subtask) {
                    $subtaskStmt->execute([
                        ':task_id' => $task_id,
                        ':title' => $subtask['title']
                    ]);
                }
            }

            http_response_code(201);
            echo json_encode([
                'status' => true,
                'message' => 'Task created successfully',
                'data' => ['task_id' => $task_id]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['status' => false, 'message' => 'Failed to create task']);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['status' => false, 'message' => 'Task ID required']);
            exit();
        }

        $fields = [];
        $params = [':user_id' => $user_id, ':id' => $data['id']];

        $updateableFields = [
            'title', 'list_type', 'priority_tag', 'notes', 
            'completed', 'pinned', 'archived', 
            'reminder_date', 'reminder_time'
        ];

        foreach ($updateableFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['status' => false, 'message' => 'No fields to update']);
            exit();
        }

        $query = "UPDATE tasks SET " . implode(', ', $fields) . " WHERE user_id = :user_id AND id = :id";
        $stmt = $db->prepare($query);
        
        if ($stmt->execute($params)) {
            echo json_encode(['status' => true, 'message' => 'Task updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => false, 'message' => 'Failed to update task']);
        }
        break;

    case 'DELETE':
        $task_id = $_GET['id'] ?? null;
        
        if (!$task_id) {
            http_response_code(400);
            echo json_encode(['status' => false, 'message' => 'Task ID required']);
            exit();
        }

        // Start transaction to delete task and its subtasks
        try {
            $db->beginTransaction();

            // Delete subtasks first
            $subtaskQuery = "DELETE FROM subtasks WHERE task_id = :task_id";
            $subtaskStmt = $db->prepare($subtaskQuery);
            $subtaskStmt->execute([':task_id' => $task_id]);

            // Then delete the task
            $taskQuery = "DELETE FROM tasks WHERE id = :id AND user_id = :user_id";
            $taskStmt = $db->prepare($taskQuery);
            $taskStmt->execute([':id' => $task_id, ':user_id' => $user_id]);

            $db->commit();
            echo json_encode(['status' => true, 'message' => 'Task and subtasks deleted successfully']);
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(['status' => false, 'message' => 'Failed to delete task']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['status' => false, 'message' => 'Method not allowed']);
        break;
} 