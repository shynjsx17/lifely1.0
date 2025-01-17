<?php

class DiarySchema {
    public function up() {
        $sql = "CREATE TABLE IF NOT EXISTS diary_entries (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            content LONGTEXT NOT NULL,
            mood ENUM('sad', 'angry', 'neutral', 'happy', 'very happy') NOT NULL DEFAULT 'neutral',
            date DATETIME NOT NULL,
            is_archived BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_date (user_id, date),
            INDEX idx_archived (is_archived)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

        return $sql;
    }

    public function down() {
        return "DROP TABLE IF EXISTS diary_entries;";
    }
}

// Run the migration
try {
    require_once __DIR__ . '/../config/db_connect.php';
    
    // Create an instance of the class
    $migration = new DiarySchema();
    
    // Run the up() method
    $sql = $migration->up();
    
    if ($conn->query($sql) === TRUE) {
        echo "DiarySchema migration completed successfully\n";
    } else {
        echo "Error running DiarySchema migration: " . $conn->error . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
} 