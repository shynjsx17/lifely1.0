<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth_middleware.php';
require_once __DIR__ . '/../middleware/cors_middleware.php';
require_once __DIR__ . '/../utils/Logger.php';

// Handle CORS
handleCors();

class ProfileController {
    private $conn;
    private $upload_path = '../uploads/profile_images/';

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
        if (!$this->conn) {
            Logger::error('Failed to establish database connection in ProfileController');
        }
    }

    public function updateProfileImage() {
        try {
            // Verify user session with headers
            $headers = getallheaders();
            $user = validateToken($headers);

            if (!$user) {
                Logger::error('Unauthorized profile image update attempt', ['headers' => $headers]);
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Please login to continue']);
                return;
            }

            Logger::info('Profile image update initiated', ['user_id' => $user['id']]);

            if (!isset($_FILES['profile_image'])) {
                Logger::error('No image file uploaded', ['user_id' => $user['id']]);
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'No image file uploaded']);
                return;
            }

            $file = $_FILES['profile_image'];
            $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];

            if (!in_array($file_extension, $allowed_extensions)) {
                Logger::error('Invalid file type uploaded', [
                    'user_id' => $user['id'],
                    'file_type' => $file_extension
                ]);
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid file type']);
                return;
            }

            // Create upload directory if it doesn't exist
            if (!file_exists($this->upload_path)) {
                Logger::info('Creating upload directory', ['path' => $this->upload_path]);
                mkdir($this->upload_path, 0777, true);
            }

            // Generate unique filename
            $new_filename = uniqid('profile_') . '.' . $file_extension;
            $upload_path = $this->upload_path . $new_filename;

            if (move_uploaded_file($file['tmp_name'], $upload_path)) {
                // Update database with new profile image path
                $query = "UPDATE users SET profile_image = ?, updated_at = NOW() WHERE id = ?";
                $stmt = $this->conn->prepare($query);
                $relative_path = 'uploads/profile_images/' . $new_filename;
                
                if ($stmt->execute([$relative_path, $user['id']])) {
                    Logger::info('Profile image updated successfully', [
                        'user_id' => $user['id'],
                        'file_path' => $relative_path
                    ]);
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Profile image updated successfully',
                        'profile_image' => $relative_path
                    ]);
                } else {
                    Logger::error('Database update failed for profile image', [
                        'user_id' => $user['id'],
                        'file_path' => $relative_path
                    ]);
                    http_response_code(500);
                    echo json_encode(['status' => 'error', 'message' => 'Failed to update profile image in database']);
                }
            } else {
                Logger::error('Failed to move uploaded file', [
                    'user_id' => $user['id'],
                    'source' => $file['tmp_name'],
                    'destination' => $upload_path
                ]);
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to upload image']);
            }
        } catch (Exception $e) {
            Logger::error('Exception in updateProfileImage', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function updateUsername() {
        try {
            // Verify user session with headers
            $headers = getallheaders();
            $user = validateToken($headers);

            if (!$user) {
                Logger::error('Unauthorized username update attempt', ['headers' => $headers]);
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Please login to continue']);
                return;
            }

            Logger::info('Username update initiated', ['user_id' => $user['id']]);

            // Get JSON data from request body
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['username']) || empty(trim($data['username']))) {
                Logger::error('Empty username provided', ['user_id' => $user['id']]);
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Username is required']);
                return;
            }

            $new_username = trim($data['username']);

            // Check if username already exists
            $check_query = "SELECT id FROM users WHERE username = ? AND id != ?";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->execute([$new_username, $user['id']]);

            if ($check_stmt->rowCount() > 0) {
                Logger::error('Username already taken', [
                    'user_id' => $user['id'],
                    'attempted_username' => $new_username
                ]);
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Username already taken']);
                return;
            }

            // Update username
            $update_query = "UPDATE users SET username = ?, updated_at = NOW() WHERE id = ?";
            $update_stmt = $this->conn->prepare($update_query);

            if ($update_stmt->execute([$new_username, $user['id']])) {
                // Update session with new username
                $_SESSION['username'] = $new_username;
                
                Logger::info('Username updated successfully', [
                    'user_id' => $user['id'],
                    'old_username' => $user['username'],
                    'new_username' => $new_username
                ]);

                echo json_encode([
                    'status' => 'success',
                    'message' => 'Username updated successfully',
                    'username' => $new_username
                ]);
            } else {
                Logger::error('Failed to update username in database', [
                    'user_id' => $user['id'],
                    'attempted_username' => $new_username
                ]);
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to update username']);
            }
        } catch (Exception $e) {
            Logger::error('Exception in updateUsername', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function getProfileImage() {
        try {
            // Verify user session with headers
            $headers = getallheaders();
            $user = validateToken($headers);

            if (!$user) {
                Logger::error('Unauthorized profile image fetch attempt', ['headers' => $headers]);
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Please login to continue']);
                return;
            }

            // Get user's profile image from database
            $query = "SELECT profile_image FROM users WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$user['id']]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($result && $result['profile_image']) {
                echo json_encode([
                    'status' => 'success',
                    'profile_image' => $result['profile_image']
                ]);
            } else {
                echo json_encode([
                    'status' => 'success',
                    'profile_image' => null
                ]);
            }
        } catch (Exception $e) {
            Logger::error('Exception in getProfileImage', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}

// Handle incoming requests
$controller = new ProfileController();
$request_method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

Logger::info('Incoming profile request', [
    'method' => $request_method,
    'action' => $action
]);

switch ($request_method) {
    case 'GET':
        if ($action === 'get_image') {
            $controller->getProfileImage();
        } else {
            Logger::error('Invalid GET action requested', ['action' => $action]);
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Action not found']);
        }
        break;
    case 'POST':
        if ($action === 'update_image') {
            $controller->updateProfileImage();
        } elseif ($action === 'update_username') {
            $controller->updateUsername();
        } else {
            Logger::error('Invalid POST action requested', ['action' => $action]);
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Action not found']);
        }
        break;
    default:
        Logger::error('Invalid request method', ['method' => $request_method]);
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
        break;
} 