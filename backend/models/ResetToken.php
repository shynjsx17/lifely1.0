<?php
class ResetToken {
    private $conn;
    private $table = 'reset_tokens';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function createToken($email) {
        try {
            $this->conn->beginTransaction();

            // Delete any existing unused tokens for this email
            $deleteQuery = "DELETE FROM " . $this->table . " 
                          WHERE email = ? AND used = FALSE";
            $deleteStmt = $this->conn->prepare($deleteQuery);
            $deleteStmt->execute([$email]);

            // Generate a secure random token
            $token = bin2hex(random_bytes(32)); // 64 characters long
            
            // Set expiration time in UTC
            $expires_at = gmdate('Y-m-d H:i:s', strtotime('+1 hour'));
            error_log("Creating new token for email: $email, expires at (UTC): $expires_at");

            // Insert new token
            $insertQuery = "INSERT INTO " . $this->table . "
                          (email, token, expires_at) 
                          VALUES (?, ?, ?)";
            
            $stmt = $this->conn->prepare($insertQuery);
            $result = $stmt->execute([$email, $token, $expires_at]);

            if (!$result) {
                throw new Exception("Failed to create reset token");
            }

            $this->conn->commit();
            return $token;

        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log("Error creating reset token: " . $e->getMessage());
            throw $e;
        }
    }

    public function verifyToken($token, $email) {
        try {
            error_log("Verifying token for email: $email with token: $token");
            
            // Use UTC timezone for comparison
            $query = "SELECT * FROM " . $this->table . "
                     WHERE token = ? 
                     AND email = ?
                     AND expires_at > UTC_TIMESTAMP()
                     AND used = FALSE
                     LIMIT 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$token, $email]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$result) {
                error_log("No valid token found for email: $email. Token might be expired or invalid.");
                return false;
            }

            error_log("Valid token found for email: $email. Token expires at: " . $result['expires_at']);
            return true;

        } catch (Exception $e) {
            error_log("Error verifying reset token: " . $e->getMessage());
            throw $e;
        }
    }

    public function markTokenAsUsed($token, $email) {
        try {
            $query = "UPDATE " . $this->table . "
                     SET used = TRUE
                     WHERE token = ?
                     AND email = ?";
            
            $stmt = $this->conn->prepare($query);
            return $stmt->execute([$token, $email]);

        } catch (Exception $e) {
            error_log("Error marking token as used: " . $e->getMessage());
            throw $e;
        }
    }
} 