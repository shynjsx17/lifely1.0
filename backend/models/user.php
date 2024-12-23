<?php
class User {

    private $conn;
    private $table = 'users';


    public $id;
    public $userName;
    public $userEmail;
    public $userPass;
    public $created_at;
    public $updated_at;


    public function __construct($db) {
        $this->conn = $db;
    }


    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                (userName, userEmail, userPass) 
                VALUES (:userName, :userEmail, :userPass)";

        $stmt = $this->conn->prepare($query);


        $this->userName = htmlspecialchars(strip_tags($this->userName));
        $this->userEmail = htmlspecialchars(strip_tags($this->userEmail));
        $this->userPass = htmlspecialchars(strip_tags($this->userPass));


        $stmt->bindParam(':userName', $this->userName);
        $stmt->bindParam(':userEmail', $this->userEmail);
        $stmt->bindParam(':userPass', $this->userPass);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function login() {
        $query = "SELECT * FROM " . $this->table . " WHERE userEmail = :userEmail LIMIT 1";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':userEmail', $this->userEmail);
        $stmt->execute();

        return $stmt;
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
}
?>