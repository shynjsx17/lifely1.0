<?php
require_once __DIR__ . '/../config/db_connect.php';

function validateSessionToken() {
    // Get the Authorization header
    $headers = getallheaders();
    $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (empty($auth_header)) {
        return null;
    }

    // Extract the token
    $token = str_replace('Bearer ', '', $auth_header);
    
    if (empty($token)) {
        return null;
    }

    try {
        // Get database connection
        $conn = get_database_connection();
        
        // Check if the token exists and is valid
        $stmt = $conn->prepare("
            SELECT user_id 
            FROM user_sessions 
            WHERE session_token = :session_token 
            AND expires_at > NOW()
        ");
        
        $stmt->execute(['session_token' => $token]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result ? $result['user_id'] : null;
    } catch (Exception $e) {
        error_log("Session validation error: " . $e->getMessage());
        return null;
    }
} 