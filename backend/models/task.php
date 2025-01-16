<?php
class Task {
    private $conn;
    private $table = 'tasks';

    // Task properties
    public $id;
    public $user_id;
    public $title;
    public $list_type;
    public $priority_tag;
    public $notes;
    public $completed;
    public $pinned;
    public $archived;
    public $reminder_date;
    public $reminder_time;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create new task
    public function create() {
        $query = "INSERT INTO " . $this->table . "
                (user_id, title, list_type, priority_tag, notes, reminder_date, reminder_time)
                VALUES
                (:user_id, :title, :list_type, :priority_tag, :notes, :reminder_date, :reminder_time)";

        $stmt = $this->conn->prepare($query);

        // Clean data
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->list_type = htmlspecialchars(strip_tags($this->list_type));
        $this->priority_tag = $this->priority_tag ? htmlspecialchars(strip_tags($this->priority_tag)) : null;
        $this->notes = $this->notes ? htmlspecialchars(strip_tags($this->notes)) : null;

        // Bind data
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':list_type', $this->list_type);
        $stmt->bindParam(':priority_tag', $this->priority_tag);
        $stmt->bindParam(':notes', $this->notes);
        $stmt->bindParam(':reminder_date', $this->reminder_date);
        $stmt->bindParam(':reminder_time', $this->reminder_time);

        try {
            if($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
        } catch(PDOException $e) {
            throw $e;
        }
        return false;
    }

    // Get tasks by user
    public function getTasksByUser($user_id, $list_type = null, $archived = false) {
        $query = "SELECT * FROM " . $this->table . " WHERE user_id = :user_id";
        $params = [':user_id' => $user_id];

        if ($list_type) {
            $query .= " AND list_type = :list_type";
            $params[':list_type'] = $list_type;
        }

        if (isset($archived)) {
            $query .= " AND archived = :archived";
            $params[':archived'] = $archived;
        }

        $query .= " ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Update task
    public function update() {
        $updateFields = [];
        $params = [':id' => $this->id, ':user_id' => $this->user_id];

        // Only update fields that are set
        if(isset($this->title)) {
            $updateFields[] = "title = :title";
            $params[':title'] = htmlspecialchars(strip_tags($this->title));
        }
        if(isset($this->list_type)) {
            $updateFields[] = "list_type = :list_type";
            $params[':list_type'] = htmlspecialchars(strip_tags($this->list_type));
        }
        if(isset($this->priority_tag)) {
            $updateFields[] = "priority_tag = :priority_tag";
            $params[':priority_tag'] = htmlspecialchars(strip_tags($this->priority_tag));
        }
        if(isset($this->notes)) {
            $updateFields[] = "notes = :notes";
            $params[':notes'] = htmlspecialchars(strip_tags($this->notes));
        }
        if(isset($this->completed)) {
            $updateFields[] = "completed = :completed";
            $params[':completed'] = $this->completed;
        }
        if(isset($this->pinned)) {
            $updateFields[] = "pinned = :pinned";
            $params[':pinned'] = $this->pinned;
        }
        if(isset($this->archived)) {
            $updateFields[] = "archived = :archived";
            $params[':archived'] = $this->archived;
        }
        if(isset($this->reminder_date)) {
            $updateFields[] = "reminder_date = :reminder_date";
            $params[':reminder_date'] = $this->reminder_date;
        }
        if(isset($this->reminder_time)) {
            $updateFields[] = "reminder_time = :reminder_time";
            $params[':reminder_time'] = $this->reminder_time;
        }

        if(empty($updateFields)) {
            return false;
        }

        $query = "UPDATE " . $this->table . " SET " . implode(', ', $updateFields) . 
                " WHERE id = :id AND user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        return $stmt->execute($params);
    }

    // Delete task
    public function delete() {
        try {
            $this->conn->beginTransaction();

            // Delete subtasks first
            $subtaskQuery = "DELETE FROM subtasks WHERE task_id = :task_id";
            $subtaskStmt = $this->conn->prepare($subtaskQuery);
            $subtaskStmt->execute([':task_id' => $this->id]);

            // Then delete the task
            $taskQuery = "DELETE FROM " . $this->table . " WHERE id = :id AND user_id = :user_id";
            $taskStmt = $this->conn->prepare($taskQuery);
            $taskStmt->execute([':id' => $this->id, ':user_id' => $this->user_id]);

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    // Get a single task by ID
    public function getTaskById() {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':id' => $this->id, ':user_id' => $this->user_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Toggle task completion
    public function toggleComplete() {
        $query = "UPDATE " . $this->table . " 
                SET completed = NOT completed 
                WHERE id = :id AND user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([':id' => $this->id, ':user_id' => $this->user_id]);
    }

    // Toggle task pin status
    public function togglePin() {
        $query = "UPDATE " . $this->table . " 
                SET pinned = NOT pinned 
                WHERE id = :id AND user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([':id' => $this->id, ':user_id' => $this->user_id]);
    }

    // Archive task
    public function archive() {
        $query = "UPDATE " . $this->table . " 
                SET archived = true 
                WHERE id = :id AND user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([':id' => $this->id, ':user_id' => $this->user_id]);
    }
} 