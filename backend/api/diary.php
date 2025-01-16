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

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../models/user.php';

// Initialize database connection
$database = new Database();
$db = $database->connect();

// Initialize user object
$user = new User($db);

// Get the Authorization header
$auth_header = null;
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
} elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $auth_header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
} elseif (isset($_SERVER['HTTP_AUTHORIZATION_TOKEN'])) {
    $auth_header = 'Bearer ' . $_SERVER['HTTP_AUTHORIZATION_TOKEN'];
}

// Verify authentication
if (!$auth_header) {
    error_log('No authorization header provided in diary.php');
    http_response_code(401);
    echo json_encode(['status' => false, 'message' => 'No authorization header provided']);
    exit();
}

$user_id = $user->verifySession();
if (!$user_id) {
    error_log('Invalid or expired session in diary.php');
    http_response_code(401);
    echo json_encode(['status' => false, 'message' => 'Invalid or expired session']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all diary entries for the user
        $archived = isset($_GET['archived']) ? (bool)$_GET['archived'] : false;
        $query = "SELECT * FROM diary_entries WHERE user_id = :user_id AND archived = :archived ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':archived', $archived, PDO::PARAM_BOOL);
        $stmt->execute();
        $entries = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => true, 'data' => $entries]);
        break;

    case 'POST':
        // Create new diary entry
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['title']) || !isset($data['content']) || !isset($data['mood'])) {
            http_response_code(400);
            echo json_encode(['status' => false, 'message' => 'Missing required fields']);
            exit();
        }

        $query = "INSERT INTO diary_entries (user_id, title, content, mood) VALUES (:user_id, :title, :content, :mood)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':content', $data['content']);
        $stmt->bindParam(':mood', $data['mood']);
        
        if ($stmt->execute()) {
            $entry_id = $db->lastInsertId();
            http_response_code(201);
            echo json_encode([
                'status' => true,
                'message' => 'Entry created successfully',
                'data' => ['id' => $entry_id]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['status' => false, 'message' => 'Failed to create entry']);
        }
        break;

    case 'PUT':
        // Update diary entry
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['status' => false, 'message' => 'Entry ID required']);
            exit();
        }

        $fields = [];
        $params = [':user_id' => $user_id, ':id' => $data['id']];

        if (isset($data['title'])) {
            $fields[] = 'title = :title';
            $params[':title'] = $data['title'];
        }
        if (isset($data['content'])) {
            $fields[] = 'content = :content';
            $params[':content'] = $data['content'];
        }
        if (isset($data['mood'])) {
            $fields[] = 'mood = :mood';
            $params[':mood'] = $data['mood'];
        }
        if (isset($data['archived'])) {
            $fields[] = 'archived = :archived';
            $params[':archived'] = $data['archived'];
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['status' => false, 'message' => 'No fields to update']);
            exit();
        }

        $query = "UPDATE diary_entries SET " . implode(', ', $fields) . " WHERE user_id = :user_id AND id = :id";
        $stmt = $db->prepare($query);
        
        if ($stmt->execute($params)) {
            echo json_encode(['status' => true, 'message' => 'Entry updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => false, 'message' => 'Failed to update entry']);
        }
        break;

    case 'DELETE':
        // Delete diary entry
        $entry_id = $_GET['id'] ?? null;
        
        if (!$entry_id) {
            http_response_code(400);
            echo json_encode(['status' => false, 'message' => 'Entry ID required']);
            exit();
        }

        $query = "DELETE FROM diary_entries WHERE id = :id AND user_id = :user_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $entry_id);
        $stmt->bindParam(':user_id', $user_id);
        
        if ($stmt->execute()) {
            echo json_encode(['status' => true, 'message' => 'Entry deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => false, 'message' => 'Failed to delete entry']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['status' => false, 'message' => 'Method not allowed']);
        break;
} 