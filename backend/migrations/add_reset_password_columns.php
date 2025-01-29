<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Logger.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Check if reset_token column exists
    $checkQuery = "SHOW COLUMNS FROM users LIKE 'reset_token'";
    $result = $conn->query($checkQuery);

    if ($result->rowCount() === 0) {
        // Add reset_token and reset_token_expiry columns
        $alterQuery = "ALTER TABLE users 
            ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL,
            ADD COLUMN reset_token_expiry DATETIME DEFAULT NULL";
        
        $conn->exec($alterQuery);
        
        Logger::info('Successfully added reset password columns to users table');
        echo "Successfully added reset password columns to users table\n";
    } else {
        Logger::info('Reset password columns already exist in users table');
        echo "Reset password columns already exist in users table\n";
    }

} catch (PDOException $e) {
    Logger::error('Failed to add reset password columns', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    echo "Error: " . $e->getMessage() . "\n";
} 