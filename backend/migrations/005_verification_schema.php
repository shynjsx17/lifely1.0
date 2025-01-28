<?php
require_once __DIR__ . '/MigrationManager.php';

class VerificationSchema {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function up() {
        // Verifications table
        $this->conn->exec("CREATE TABLE IF NOT EXISTS verifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            otp VARCHAR(6) NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            verified TINYINT(1) DEFAULT 0,
            UNIQUE KEY unique_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
    }

    public function down() {
        $this->conn->exec("DROP TABLE IF EXISTS verifications");
    }
} 