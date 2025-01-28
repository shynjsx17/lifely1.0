<?php
require_once __DIR__ . '/../config/db_connect.php';

try {
    $database = new Database();
    $conn = $database->connect();
    
    // Enable PDO error mode
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Drop table if exists
    $conn->exec("DROP TABLE IF EXISTS verifications");
    
    // Create table
    $sql = "CREATE TABLE verifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified BOOLEAN DEFAULT FALSE,
        UNIQUE KEY unique_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    
    $conn->exec($sql);
    echo "Verifications table created successfully\n";
    
} catch(PDOException $e) {
    echo "Error creating table: " . $e->getMessage() . "\n";
    error_log("Database Error: " . $e->getMessage());
    exit(1);
} 