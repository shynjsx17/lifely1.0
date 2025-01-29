<?php
require_once __DIR__ . '/../config/db_connect.php';

try {
    $database = new Database();
    $conn = $database->connect();
    
    // Enable PDO error mode
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Drop table if exists
    $conn->exec("DROP TABLE IF EXISTS reset_tokens");
    
    // Create table
    $sql = "CREATE TABLE reset_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(64) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used BOOLEAN DEFAULT FALSE,
        UNIQUE KEY unique_token (token),
        KEY idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    
    $conn->exec($sql);
    echo "Reset tokens table created successfully\n";
    
} catch(PDOException $e) {
    echo "Error creating table: " . $e->getMessage() . "\n";
    error_log("Database Error: " . $e->getMessage());
    exit(1);
} 