<?php
require_once __DIR__ . '/../config/db_connect.php';

class MigrationManager {
    private $conn;
    private $migrations_table = 'migrations';

    public function __construct() {
        $this->createDatabase();
        $this->conn = get_database_connection();
        $this->createMigrationsTable();
    }

    private function createDatabase() {
        try {
            // Connect without database selected
            $pdo = new PDO(
                "mysql:host=localhost",
                "root",
                ""
            );
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Create database if not exists
            $pdo->exec("CREATE DATABASE IF NOT EXISTS lifely CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            echo "Database 'lifely' ensured.\n";
        } catch(PDOException $e) {
            die("Database creation Error: " . $e->getMessage());
        }
    }

    private function createMigrationsTable() {
        $query = "CREATE TABLE IF NOT EXISTS {$this->migrations_table} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            migration_name VARCHAR(255) NOT NULL,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        
        try {
            $this->conn->exec($query);
        } catch (PDOException $e) {
            die("Error creating migrations table: " . $e->getMessage());
        }
    }

    public function hasMigrationRun($migrationName) {
        $query = "SELECT COUNT(*) FROM {$this->migrations_table} WHERE migration_name = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$migrationName]);
        return $stmt->fetchColumn() > 0;
    }

    public function recordMigration($migrationName) {
        $query = "INSERT INTO {$this->migrations_table} (migration_name) VALUES (?)";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$migrationName]);
    }

    public function getConnection() {
        return $this->conn;
    }
} 