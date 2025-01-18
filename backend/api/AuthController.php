<?php
require_once __DIR__ . '/../config/db_connect.php';

class AuthController {
    private $conn;
    private $table_name = "users";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->connect();
    }

    public function signup($data) {
        try {
            // Validate input
            if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
                return ['success' => false, 'message' => 'All fields are required'];
            }

            // Check if email already exists
            $stmt = $this->conn->prepare("SELECT id FROM {$this->table_name} WHERE email = ?");
            $stmt->execute([$data['email']]);
            if ($stmt->rowCount() > 0) {
                return ['success' => false, 'message' => 'Email already exists'];
            }

            // Check if username already exists
            $stmt = $this->conn->prepare("SELECT id FROM {$this->table_name} WHERE username = ?");
            $stmt->execute([$data['username']]);
            if ($stmt->rowCount() > 0) {
                return ['success' => false, 'message' => 'Username already exists'];
            }

            // Hash password
            $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);

            // Insert new user
            $query = "INSERT INTO {$this->table_name} 
                    (username, email, password_hash) 
                    VALUES (?, ?, ?)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $data['username'],
                $data['email'],
                $password_hash
            ]);

            // Create user profile
            $user_id = $this->conn->lastInsertId();
            $profile_query = "INSERT INTO user_profiles (user_id) VALUES (?)";
            $profile_stmt = $this->conn->prepare($profile_query);
            $profile_stmt->execute([$user_id]);

            return [
                'success' => true,
                'message' => 'User registered successfully',
                'user_id' => $user_id
            ];

        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()];
        }
    }

    public function login($data) {
        try {
            // Validate input
            if (empty($data['email']) || empty($data['password'])) {
                return ['success' => false, 'message' => 'Email and password are required'];
            }

            // Get user by email
            $stmt = $this->conn->prepare("SELECT id, username, email, password_hash, status 
                                        FROM {$this->table_name} 
                                        WHERE email = ?");
            $stmt->execute([$data['email']]);
            
            if ($stmt->rowCount() === 0) {
                return ['success' => false, 'message' => 'Invalid email or password'];
            }

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Verify password
            if (!password_verify($data['password'], $user['password_hash'])) {
                return ['success' => false, 'message' => 'Invalid email or password'];
            }

            // Check if account is active
            if ($user['status'] !== 'active') {
                return ['success' => false, 'message' => 'Account is not active'];
            }

            // Generate session token
            $session_token = bin2hex(random_bytes(32));
            $expires_at = date('Y-m-d H:i:s', strtotime('+24 hours'));

            // Store session
            $session_query = "INSERT INTO user_sessions (user_id, session_token, expires_at) 
                            VALUES (?, ?, ?)";
            $session_stmt = $this->conn->prepare($session_query);
            $session_stmt->execute([$user['id'], $session_token, $expires_at]);

            // Update last login
            $update_stmt = $this->conn->prepare("UPDATE {$this->table_name} 
                                               SET last_login = CURRENT_TIMESTAMP 
                                               WHERE id = ?");
            $update_stmt->execute([$user['id']]);

            return [
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email']
                ],
                'session_token' => $session_token,
                'expires_at' => $expires_at
            ];

        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Login failed: ' . $e->getMessage()];
        }
    }
} 