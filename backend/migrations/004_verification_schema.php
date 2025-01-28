<?php
class VerificationSchema {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function up() {
        $sql = "CREATE TABLE IF NOT EXISTS verifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            otp VARCHAR(6) NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            verified BOOLEAN DEFAULT FALSE,
            UNIQUE KEY unique_email (email)
        )";

        try {
            $this->conn->exec($sql);
            echo "Table 'verifications' created successfully\n";
        } catch (PDOException $e) {
            throw new Exception("Error creating table: " . $e->getMessage());
        }
    }
} 