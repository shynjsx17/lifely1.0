<?php
require_once __DIR__ . '/../config/db_connect.php';
require_once __DIR__ . '/../utils/session_helper.php';

// Set headers
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Get database connection
    $conn = get_database_connection();
    
    // Validate session and get user_id
    $user_id = validateSessionToken();
    if (!$user_id) {
        throw new Exception('Unauthorized access');
    }

    // Handle different HTTP methods
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get query parameters for pagination and filtering
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $offset = ($page - 1) * $limit;
            $search = isset($_GET['search']) ? $_GET['search'] : '';
            $mood = isset($_GET['mood']) ? $_GET['mood'] : '';
            $archived = isset($_GET['archived']) ? (bool)$_GET['archived'] : false;

            // Build the base query
            $query = "SELECT * FROM diary_entries WHERE user_id = :user_id";
            $params = ['user_id' => $user_id];

            // Add filters
            if ($search) {
                $query .= " AND (title LIKE :search OR content LIKE :search)";
                $params['search'] = "%$search%";
            }
            if ($mood) {
                $query .= " AND mood = :mood";
                $params['mood'] = $mood;
            }
            $query .= " AND is_archived = :archived";
            $params['archived'] = $archived;

            // Add sorting and pagination
            $query .= " ORDER BY date DESC LIMIT :limit OFFSET :offset";
            $params['limit'] = $limit;
            $params['offset'] = $offset;

            // Execute query
            $stmt = $conn->prepare($query);
            foreach ($params as $key => &$val) {
                $stmt->bindParam($key, $val);
            }
            $stmt->execute();
            $entries = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get total count for pagination
            $countQuery = "SELECT COUNT(*) FROM diary_entries WHERE user_id = :user_id AND is_archived = :archived";
            $stmt = $conn->prepare($countQuery);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':archived', $archived);
            $stmt->execute();
            $total = $stmt->fetchColumn();

            echo json_encode([
                'status' => 'success',
                'data' => [
                    'entries' => $entries,
                    'pagination' => [
                        'current_page' => $page,
                        'total_pages' => ceil($total / $limit),
                        'total_entries' => $total,
                        'limit' => $limit
                    ]
                ]
            ]);
            break;

        case 'POST':
            // Get POST data
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['title']) || !isset($data['content']) || !isset($data['mood'])) {
                throw new Exception('Missing required fields');
            }

            // Insert new entry
            $stmt = $conn->prepare("INSERT INTO diary_entries (user_id, title, content, mood, date) VALUES (:user_id, :title, :content, :mood, NOW())");
            $stmt->execute([
                'user_id' => $user_id,
                'title' => $data['title'],
                'content' => $data['content'],
                'mood' => $data['mood']
            ]);

            echo json_encode([
                'status' => 'success',
                'message' => 'Entry created successfully',
                'data' => ['id' => $conn->lastInsertId()]
            ]);
            break;

        case 'PUT':
            // Get PUT data
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                throw new Exception('Entry ID is required');
            }

            // Verify entry belongs to user
            $stmt = $conn->prepare("SELECT id FROM diary_entries WHERE id = :id AND user_id = :user_id");
            $stmt->execute(['id' => $data['id'], 'user_id' => $user_id]);
            if (!$stmt->fetch()) {
                throw new Exception('Entry not found or unauthorized');
            }

            // Build update query
            $updates = [];
            $params = ['id' => $data['id'], 'user_id' => $user_id];

            if (isset($data['title'])) {
                $updates[] = "title = :title";
                $params['title'] = $data['title'];
            }
            if (isset($data['content'])) {
                $updates[] = "content = :content";
                $params['content'] = $data['content'];
            }
            if (isset($data['mood'])) {
                $updates[] = "mood = :mood";
                $params['mood'] = $data['mood'];
            }
            if (isset($data['is_archived'])) {
                $updates[] = "is_archived = :is_archived";
                $params['is_archived'] = $data['is_archived'];
            }

            if (!empty($updates)) {
                $query = "UPDATE diary_entries SET " . implode(", ", $updates) . " WHERE id = :id AND user_id = :user_id";
                $stmt = $conn->prepare($query);
                $stmt->execute($params);
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'Entry updated successfully'
            ]);
            break;

        case 'DELETE':
            // Get DELETE data
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                throw new Exception('Entry ID is required');
            }

            // Delete entry
            $stmt = $conn->prepare("DELETE FROM diary_entries WHERE id = :id AND user_id = :user_id");
            $stmt->execute(['id' => $data['id'], 'user_id' => $user_id]);

            if ($stmt->rowCount() === 0) {
                throw new Exception('Entry not found or unauthorized');
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'Entry deleted successfully'
            ]);
            break;

        default:
            throw new Exception('Method not allowed');
    }
} catch (Exception $e) {
    http_response_code($e->getMessage() === 'Unauthorized access' ? 401 : 400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} 