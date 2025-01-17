<?php
require_once __DIR__ . '/MigrationManager.php';

class TasksSchema {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function up() {
        // Tasks table
        $this->conn->exec("CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            list_type ENUM('personal', 'work', 'school') NOT NULL,
            priority ENUM('high', 'medium', 'low') NOT NULL,
            reminder_date DATETIME,
            is_completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        // Task notes table for additional notes on tasks
        $this->conn->exec("CREATE TABLE IF NOT EXISTS task_notes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            task_id INT NOT NULL,
            note TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    }

    public function down() {
        // Drop tables in reverse order of creation
        $this->conn->exec("DROP TABLE IF EXISTS task_notes");
        $this->conn->exec("DROP TABLE IF EXISTS tasks");
    }
} 