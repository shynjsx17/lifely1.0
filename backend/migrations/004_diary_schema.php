<?php
require_once __DIR__ . '/MigrationManager.php';

class DiarySchema {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function up() {
        // Diary entries table
        $this->conn->exec("CREATE TABLE IF NOT EXISTS diary_entries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            content LONGTEXT NOT NULL,
            mood ENUM('sad','angry','neutral','happy','very happy') DEFAULT 'neutral',
            date DATETIME NOT NULL,
            is_archived TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            KEY idx_user_date (user_id,date),
            KEY idx_archived (is_archived)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    }

    public function down() {
        $this->conn->exec("DROP TABLE IF EXISTS diary_entries");
    }
} 