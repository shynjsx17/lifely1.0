<?php
class Subtask {
    private $conn;
    private $table = 'subtasks';

    // Subtask properties
    public $id;
    public $task_id;
    public $title;
    public $completed;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create new subtask
    public function create() {
        $query = "INSERT INTO " . $this->table . "
                (task_id, title)
                VALUES
                (:task_id, :title)";

        $stmt = $this->conn->prepare($query);

        // Clean data
        $this->title = htmlspecialchars(strip_tags($this->title));

        // Bind data
        $stmt->bindParam(':task_id', $this->task_id);
        $stmt->bindParam(':title', $this->title);

        try {
            if($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
        } catch(PDOException $e) {
            throw $e;
        }
        return false;
    }

    // Get subtasks by task ID
    public function getSubtasksByTask($task_id) {
        $query = "SELECT * FROM " . $this->table . " 
                WHERE task_id = :task_id 
                ORDER BY created_at ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([':task_id' => $task_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Update subtask
    public function update() {
        $updateFields = [];
        $params = [':id' => $this->id, ':task_id' => $this->task_id];

        // Only update fields that are set
        if(isset($this->title)) {
            $updateFields[] = "title = :title";
            $params[':title'] = htmlspecialchars(strip_tags($this->title));
        }
        if(isset($this->completed)) {
            $updateFields[] = "completed = :completed";
            $params[':completed'] = $this->completed;
        }

        if(empty($updateFields)) {
            return false;
        }

        $query = "UPDATE " . $this->table . " SET " . implode(', ', $updateFields) . 
                " WHERE id = :id AND task_id = :task_id";

        $stmt = $this->conn->prepare($query);
        return $stmt->execute($params);
    }

    // Delete subtask
    public function delete() {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id AND task_id = :task_id";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([':id' => $this->id, ':task_id' => $this->task_id]);
    }

    // Toggle subtask completion
    public function toggleComplete() {
        $query = "UPDATE " . $this->table . " 
                SET completed = NOT completed 
                WHERE id = :id AND task_id = :task_id";
        
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([':id' => $this->id, ':task_id' => $this->task_id]);
    }

    // Get a single subtask by ID
    public function getSubtaskById() {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id AND task_id = :task_id";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':id' => $this->id, ':task_id' => $this->task_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
} 