<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'lifely';
    private $username = 'root';
    private $password = '';
    private $conn;

    public function connect() {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);

            // Check if users table exists and add reset token columns if needed
            $this->addResetTokenColumns();

            return $this->conn;
        } catch(PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
    }

    private function addResetTokenColumns() {
        try {
            // Check if users table exists
            $stmt = $this->conn->query("SHOW TABLES LIKE 'users'");
            if ($stmt->rowCount() > 0) {
                // Add reset token columns if they don't exist
                $this->conn->exec("
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
                    ADD COLUMN IF NOT EXISTS reset_token_expiry DATETIME
                ");
            }
        } catch (PDOException $e) {
            // Log error but don't throw exception as this is not critical
            error_log("Error adding reset token columns: " . $e->getMessage());
        }
    }
}

// Create a single database instance to be used throughout the application
$database = new Database();
$conn = $database->connect();

// Function to get the database connection
function get_database_connection() {
    global $conn;
    return $conn;
}