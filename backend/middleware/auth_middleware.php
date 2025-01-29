<?php
session_start();
require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/../config/database.php';

function validateToken($headers) {
    Logger::debug('Starting token validation', [
        'session' => $_SESSION,
        'headers' => $headers
    ]);
    
    // Get token from Authorization header
    if (!isset($headers['Authorization'])) {
        Logger::error('No Authorization header found');
        return null;
    }

    $access_token = str_replace('Bearer ', '', $headers['Authorization']);
    if (!$access_token || $access_token === 'null') {
        Logger::error('Invalid token format');
        return null;
    }

    Logger::debug('Processing token', ['token' => substr($access_token, 0, 10) . '...']);

    try {
        $db = new Database();
        $conn = $db->getConnection();

        // Get user data through user_sessions table
        $query = "SELECT u.* 
                 FROM users u 
                 INNER JOIN user_sessions us ON u.id = us.user_id 
                 WHERE us.session_token = ? 
                 AND us.expires_at > NOW()
                 LIMIT 1";

        $stmt = $conn->prepare($query);
        $stmt->execute([$access_token]);
        
        if ($user = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Update PHP session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['username'] = $user['username'];
            
            Logger::info('Session validated successfully', [
                'user_id' => $user['id'],
                'username' => $user['username']
            ]);

            return [
                'id' => $user['id'],
                'email' => $user['email'],
                'username' => $user['username']
            ];
        }

        Logger::error('No valid session found for token');
        return null;

    } catch (Exception $e) {
        Logger::error('Session validation failed', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return null;
    }
} 