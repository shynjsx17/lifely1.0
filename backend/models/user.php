<?php
class User {

    private $conn;
    private $table = 'users';


    public $id;
    public $userName;
    public $userEmail;
    public $userPass;
    public $google_id;
    public $created_at;
    public $updated_at;


    public function __construct($db) {
        $this->conn = $db;
    }


    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                (userName, userEmail, userPass, google_id) 
                VALUES (:userName, :userEmail, :userPass, :google_id)";

        $stmt = $this->conn->prepare($query);


        $this->userName = htmlspecialchars(strip_tags($this->userName));
        $this->userEmail = htmlspecialchars(strip_tags($this->userEmail));
        $this->userPass = htmlspecialchars(strip_tags($this->userPass));
        $this->google_id = htmlspecialchars(strip_tags($this->google_id));


        $stmt->bindParam(':userName', $this->userName);
        $stmt->bindParam(':userEmail', $this->userEmail);
        $stmt->bindParam(':userPass', $this->userPass);
        $stmt->bindParam(':google_id', $this->google_id);

        if($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function login($email, $password) {
        $query = "SELECT * FROM " . $this->table . " WHERE userEmail = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if(password_verify($password, $row['userPass'])) {
                // Generate and store session token
                $session_token = bin2hex(random_bytes(32));
                $token_expiry = date('Y-m-d H:i:s', strtotime('+24 hours'));
                
                // Update user with session token
                $update_query = "UPDATE " . $this->table . " 
                               SET session_token = :session_token,
                                   token_expiry = :token_expiry
                               WHERE id = :id";
                $update_stmt = $this->conn->prepare($update_query);
                $update_stmt->bindParam(':session_token', $session_token);
                $update_stmt->bindParam(':token_expiry', $token_expiry);
                $update_stmt->bindParam(':id', $row['id']);
                
                if($update_stmt->execute()) {
                    $row['session_token'] = $session_token;
                    $row['token_expiry'] = $token_expiry;
                    return $row;
                }
            }
        }
        
        return false;
    }

    public function update() {
        $query = "UPDATE " . $this->table . "
                SET userName = :userName,
                    userEmail = :userEmail
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->userName = htmlspecialchars(strip_tags($this->userName));
        $this->userEmail = htmlspecialchars(strip_tags($this->userEmail));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(':userName', $this->userName);
        $stmt->bindParam(':userEmail', $this->userEmail);
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
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
        $query = "SELECT id, userName, userPass FROM " . $this->table . " 
                WHERE userEmail = :userEmail LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':userEmail', $this->userEmail);
        $stmt->execute();
        
        $num = $stmt->rowCount();
        
        if($num > 0) {
            return true;
        }
        return false;
    }

    public function findByEmail($email) {
        $query = 'SELECT * FROM ' . $this->table . ' WHERE userEmail = :email LIMIT 1';
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        return false;
    }

    public function updateGoogleCredentials() {
        $query = 'UPDATE ' . $this->table . ' 
                SET google_id = :google_id
                WHERE id = :id';

        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':google_id', $this->google_id);
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function verifySession() {
        if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
            error_log('No authorization header found in verifySession');
            return false;
        }

        $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
        error_log('Raw Authorization header: ' . $auth_header);
        
        $token = str_replace('Bearer ', '', $auth_header);
        error_log('Extracted token: ' . substr($token, 0, 10) . '...');

        if (empty($token)) {
            error_log('Empty token after extraction');
            return false;
        }

        // Debug: Check token in database
        $query = "SELECT id, session_token, token_expiry FROM " . $this->table . " 
                 WHERE session_token = :token LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':token', $token);
        
        try {
            $stmt->execute();
            error_log('Token query executed. Found rows: ' . $stmt->rowCount());

            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                error_log('Found user with ID: ' . $row['id']);
                
                // Check if token has expired
                if (isset($row['token_expiry'])) {
                    $expiry = strtotime($row['token_expiry']);
                    $now = time();
                    error_log("Token expiry check - Expiry: " . date('Y-m-d H:i:s', $expiry) . ", Now: " . date('Y-m-d H:i:s', $now));
                    
                    if ($expiry < $now) {
                        error_log('Token has expired');
                        return false;
                    }
                }

                error_log('Token is valid for user: ' . $row['id']);
                return $row['id'];
            }

            error_log('No matching token found in database');
            return false;
        } catch (PDOException $e) {
            error_log('Database error in verifySession: ' . $e->getMessage());
            return false;
        }
    }

    public function googleAuth($email, $google_id) {
        try {
            // First try to find the user
            $query = "SELECT * FROM " . $this->table . " WHERE userEmail = :email LIMIT 1";
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            if($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Generate and store session token
                $session_token = bin2hex(random_bytes(32));
                $token_expiry = date('Y-m-d H:i:s', strtotime('+24 hours'));
                
                // Update user with session token and ensure google_id is set
                $update_query = "UPDATE " . $this->table . " 
                               SET session_token = :session_token,
                                   token_expiry = :token_expiry,
                                   google_id = :google_id
                               WHERE id = :id";
                $update_stmt = $this->conn->prepare($update_query);
                $update_stmt->bindParam(':session_token', $session_token);
                $update_stmt->bindParam(':token_expiry', $token_expiry);
                $update_stmt->bindParam(':google_id', $google_id);
                $update_stmt->bindParam(':id', $row['id']);
                
                if($update_stmt->execute()) {
                    $row['session_token'] = $session_token;
                    $row['token_expiry'] = $token_expiry;
                    return $row;
                }
            }
            
            return false;
        } catch(Exception $e) {
            error_log("Google Auth Error in User model: " . $e->getMessage());
            return false;
        }
    }
}
?>