<?php
class User {

    private $conn;
    private $table = 'users';


    public $id;
    public $username;
    public $email;
    public $password_hash;
    public $created_at;
    public $updated_at;
    public $last_login;
    public $status;
    public $profile_image;


    public function __construct($db) {
        $this->conn = $db;
    }


    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                (username, email, password_hash) 
                VALUES (:username, :email, :password_hash)";

        $stmt = $this->conn->prepare($query);


        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->password_hash = htmlspecialchars(strip_tags($this->password_hash));


        $stmt->bindParam(':username', $this->username);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':password_hash', $this->password_hash);

        return $stmt->execute();
    }

    public function login() {
        $query = "SELECT * FROM " . $this->table . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':email', $this->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Update last login
            $update_query = "UPDATE " . $this->table . " 
                           SET last_login = CURRENT_TIMESTAMP 
                           WHERE id = :id";
            $update_stmt = $this->conn->prepare($update_query);
            $update_stmt->bindParam(':id', $row['id']);
            $update_stmt->execute();
        }

        return $stmt;
    }

    public function update() {
        $query = "UPDATE " . $this->table . "
                SET username = :username,
                    email = :email
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(':username', $this->username);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':id', $this->id);

        return $stmt->execute();
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function emailExists() {
        $query = "SELECT id, username, password_hash FROM " . $this->table . " 
                WHERE email = :email LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $this->email);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }

    public function saveResetToken($email, $token, $expires_at) {
        try {
            $this->conn->beginTransaction();

            // Delete any existing reset tokens for this email
            $deleteQuery = "DELETE FROM password_resets WHERE email = ?";
            $deleteStmt = $this->conn->prepare($deleteQuery);
            $deleteStmt->execute([$email]);

            // Insert new reset token
            $insertQuery = "INSERT INTO password_resets (email, token, expires_at) 
                          VALUES (?, ?, ?)";
            $insertStmt = $this->conn->prepare($insertQuery);
            $result = $insertStmt->execute([$email, $token, $expires_at]);

            if (!$result) {
                throw new PDOException("Failed to save reset token");
            }

            $this->conn->commit();
            return true;

        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log("Error saving reset token: " . $e->getMessage());
            return false;
        }
    }

    public function resetPassword($token, $newPassword) {
        try {
            $this->conn->beginTransaction();

            // Get reset token info
            $query = "SELECT email, expires_at FROM password_resets 
                     WHERE token = ? AND expires_at > NOW() 
                     LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$token]);
            $reset = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$reset) {
                throw new Exception("Invalid or expired reset token");
            }

            // Update password
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            $updateQuery = "UPDATE " . $this->table . " 
                          SET password = ? 
                          WHERE email = ?";
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateResult = $updateStmt->execute([$hashedPassword, $reset['email']]);

            if (!$updateResult) {
                throw new PDOException("Failed to update password");
            }

            // Delete used reset token
            $deleteQuery = "DELETE FROM password_resets WHERE token = ?";
            $deleteStmt = $this->conn->prepare($deleteQuery);
            $deleteStmt->execute([$token]);

            $this->conn->commit();
            return true;

        } catch (Throwable $e) {
            $this->conn->rollBack();
            error_log("Error resetting password: " . $e->getMessage());
            return false;
        }
    }

    public function emailExists($email) {
        try {
            $query = "SELECT COUNT(*) FROM " . $this->table . " WHERE email = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$email]);
            return $stmt->fetchColumn() > 0;
        } catch (PDOException $e) {
            error_log("Error checking email existence: " . $e->getMessage());
            return false;
        }
    }
}
?>