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

    public function updatePassword() {
        try {
            $query = "UPDATE " . $this->table . "
                    SET password_hash = :password_hash,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE email = :email";

            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':password_hash', $this->password_hash);
            $stmt->bindParam(':email', $this->email);

            if($stmt->execute()) {
                return true;
            }

            error_log("Failed to update password for email: " . $this->email);
            return false;
        } catch (PDOException $e) {
            error_log("Database error in updatePassword: " . $e->getMessage());
            return false;
        }
    }

    // Update user's profile image
    public function updateProfileImage($userId, $imagePath) {
        $query = "UPDATE users SET profile_image = :image_path WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':image_path', $imagePath);
        $stmt->bindParam(':id', $userId);
        
        return $stmt->execute();
    }
    
    // Update user's name
    public function updateName($userId, $name) {
        $query = "UPDATE users SET name = :name WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':id', $userId);
        
        return $stmt->execute();
    }

    // Verify session token
    public function verifySessionToken($token) {
        $query = "SELECT user_id FROM sessions WHERE token = :token AND expires_at > NOW()";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
}
?>