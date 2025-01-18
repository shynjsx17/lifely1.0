<?php
require_once __DIR__ . '/MigrationManager.php';

class SubtasksSchema {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function up() {
        // Subtasks table
        $this->conn->exec("CREATE TABLE IF NOT EXISTS subtasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            task_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            is_completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    }

    public function down() {
        $this->conn->exec("DROP TABLE IF EXISTS subtasks");
    }
} 