<?php
require_once __DIR__ . '/../config/db_connect.php';

class TaskController {
    private $conn;
    private $tasks_table = "tasks";
    private $notes_table = "task_notes";
    private $subtasks_table = "subtasks";

    public function __construct() {
        try {
            $this->conn = get_database_connection();
        } catch (Exception $e) {
            error_log("Database connection error in TaskController: " . $e->getMessage());
            throw new Exception('Database connection error');
        }
    }

    public function createTask($user_id, $data) {
        try {
            // Validate input
            if (empty($data['title']) || empty($data['list_type']) || empty($data['priority'])) {
                return ['success' => false, 'message' => 'Required fields are missing'];
            }

            $query = "INSERT INTO {$this->tasks_table} 
                    (user_id, title, description, list_type, priority, reminder_date) 
                    VALUES (?, ?, ?, ?, ?, ?)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $user_id,
                $data['title'],
                $data['description'] ?? null,
                $data['list_type'],
                $data['priority'],
                !empty($data['reminder_date']) ? $data['reminder_date'] : null
            ]);

            $task_id = $this->conn->lastInsertId();

            // Add note if provided
            if (!empty($data['note'])) {
                $note_query = "INSERT INTO {$this->notes_table} (task_id, note) VALUES (?, ?)";
                $note_stmt = $this->conn->prepare($note_query);
                $note_stmt->execute([$task_id, $data['note']]);
            }

            return [
                'success' => true,
                'message' => 'Task created successfully',
                'task_id' => $task_id
            ];

        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to create task: ' . $e->getMessage()];
        }
    }

    public function updateTask($user_id, $task_id, $data) {
        try {
            // Verify task belongs to user
            $check_query = "SELECT id FROM {$this->tasks_table} WHERE id = ? AND user_id = ?";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->execute([$task_id, $user_id]);
            
            if ($check_stmt->rowCount() === 0) {
                return ['success' => false, 'message' => 'Task not found or access denied'];
            }

            $updates = [];
            $params = [];

            // Build dynamic update query
            if (isset($data['title'])) {
                $updates[] = "title = ?";
                $params[] = $data['title'];
            }
            if (isset($data['description'])) {
                $updates[] = "description = ?";
                $params[] = $data['description'];
            }
            if (isset($data['list_type'])) {
                $updates[] = "list_type = ?";
                $params[] = $data['list_type'];
            }
            if (isset($data['priority'])) {
                $updates[] = "priority = ?";
                $params[] = $data['priority'];
            }
            if (isset($data['reminder_date'])) {
                $updates[] = "reminder_date = ?";
                $params[] = $data['reminder_date'];
            }
            if (isset($data['is_completed'])) {
                $updates[] = "is_completed = ?";
                $params[] = $data['is_completed'];
            }
            if (isset($data['is_archived'])) {
                $updates[] = "is_archived = ?";
                $params[] = $data['is_archived'];
            }

            if (!empty($updates)) {
                $params[] = $task_id;
                $params[] = $user_id;

                $query = "UPDATE {$this->tasks_table} SET " . implode(", ", $updates) . 
                        " WHERE id = ? AND user_id = ?";
                
                $stmt = $this->conn->prepare($query);
                $stmt->execute($params);
            }

            // Handle note update if provided
            if (isset($data['note'])) {
                // Check if note exists
                $check_note_query = "SELECT id FROM {$this->notes_table} WHERE task_id = ?";
                $check_note_stmt = $this->conn->prepare($check_note_query);
                $check_note_stmt->execute([$task_id]);

                if ($check_note_stmt->rowCount() > 0) {
                    // Update existing note
                    $note_query = "UPDATE {$this->notes_table} SET note = ? WHERE task_id = ?";
                    $note_stmt = $this->conn->prepare($note_query);
                    $note_stmt->execute([$data['note'], $task_id]);
                } else {
                    // Insert new note
                    $note_query = "INSERT INTO {$this->notes_table} (task_id, note) VALUES (?, ?)";
                    $note_stmt = $this->conn->prepare($note_query);
                    $note_stmt->execute([$task_id, $data['note']]);
                }
            }

            return [
                'success' => true,
                'message' => 'Task updated successfully'
            ];

        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to update task: ' . $e->getMessage()];
        }
    }

    public function getTasks($user_id, $filters = []) {
        try {
            // Debug logging
            error_log("Fetching tasks for user_id: " . $user_id);

            // First get tasks without subtasks to avoid GROUP_CONCAT issues
            $query = "SELECT t.*, 
                     (SELECT note FROM {$this->notes_table} WHERE task_id = t.id LIMIT 1) as note
                     FROM {$this->tasks_table} t 
                     WHERE t.user_id = ?";
            $params = [$user_id];

            // Apply filters if they exist
            if (!empty($filters['list_type'])) {
                $query .= " AND t.list_type = ?";
                $params[] = $filters['list_type'];
            }
            if (!empty($filters['priority'])) {
                $query .= " AND t.priority = ?";
                $params[] = $filters['priority'];
            }
            if (isset($filters['is_completed'])) {
                $query .= " AND t.is_completed = ?";
                $params[] = $filters['is_completed'];
            }
            if (isset($filters['is_archived'])) {
                $query .= " AND t.is_archived = ?";
                $params[] = $filters['is_archived'];
            } else {
                $query .= " AND (t.is_archived = 0 OR t.is_archived IS NULL)";
            }

            $query .= " ORDER BY t.created_at DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);
            $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Now get subtasks for each task
            foreach ($tasks as &$task) {
                // Convert boolean fields from strings to actual booleans
                $task['is_completed'] = (bool)$task['is_completed'];
                $task['is_archived'] = (bool)$task['is_archived'];
                $task['is_pinned'] = (bool)($task['is_pinned'] ?? false);

                // Get subtasks for this specific task
                $subtasks_query = "SELECT id, title, is_completed 
                                 FROM {$this->subtasks_table} 
                                 WHERE task_id = ? 
                                 ORDER BY created_at ASC";
                $subtasks_stmt = $this->conn->prepare($subtasks_query);
                $subtasks_stmt->execute([$task['id']]);
                $subtasks = $subtasks_stmt->fetchAll(PDO::FETCH_ASSOC);

                // Convert subtask boolean fields
                foreach ($subtasks as &$subtask) {
                    $subtask['is_completed'] = (bool)$subtask['is_completed'];
                }

                // Assign the subtasks to this specific task
                $task['subtasks'] = $subtasks;
            }

            return [
                'success' => true,
                'tasks' => $tasks
            ];

        } catch (PDOException $e) {
            error_log('Failed to fetch tasks: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to fetch tasks: ' . $e->getMessage()];
        }
    }

    public function deleteTask($user_id, $task_id) {
        try {
            $query = "DELETE FROM {$this->tasks_table} WHERE id = ? AND user_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$task_id, $user_id]);

            if ($stmt->rowCount() === 0) {
                return ['success' => false, 'message' => 'Task not found or access denied'];
            }

            return [
                'success' => true,
                'message' => 'Task deleted successfully'
            ];

        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to delete task: ' . $e->getMessage()];
        }
    }

    public function addSubtask($task_id, $title) {
        try {
            // Verify task exists and belongs to user
            $check_query = "SELECT id FROM {$this->tasks_table} WHERE id = ?";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->execute([$task_id]);
            
            if ($check_stmt->rowCount() === 0) {
                return ['success' => false, 'message' => 'Task not found'];
            }

            $query = "INSERT INTO {$this->subtasks_table} (task_id, title) VALUES (?, ?)";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$task_id, $title]);

            return [
                'success' => true,
                'message' => 'Subtask added successfully',
                'subtask_id' => $this->conn->lastInsertId()
            ];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to add subtask: ' . $e->getMessage()];
        }
    }

    public function toggleSubtask($subtask_id) {
        try {
            $query = "UPDATE {$this->subtasks_table} 
                     SET is_completed = NOT is_completed 
                     WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$subtask_id]);

            return [
                'success' => true,
                'message' => 'Subtask toggled successfully'
            ];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to toggle subtask: ' . $e->getMessage()];
        }
    }

    public function getSubtasks($task_id) {
        try {
            $query = "SELECT * FROM {$this->subtasks_table} WHERE task_id = ? ORDER BY created_at ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$task_id]);

            return [
                'success' => true,
                'subtasks' => $stmt->fetchAll(PDO::FETCH_ASSOC)
            ];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to fetch subtasks: ' . $e->getMessage()];
        }
    }
} 