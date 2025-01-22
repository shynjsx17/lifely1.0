<?php
require_once __DIR__ . '/MigrationManager.php';

class AddArchivedToTasks {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function up() {
        // Add is_archived column to tasks table
        $this->conn->exec("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE");
    }

    public function down() {
        // Remove is_archived column from tasks table
        $this->conn->exec("ALTER TABLE tasks DROP COLUMN IF EXISTS is_archived");
    }
} 