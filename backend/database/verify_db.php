<?php
require_once '../config/database.php';

function verifyDatabase() {
    $database = new Database();
    $db = $database->connect();
    
    try {
        // Check users table
        $result = $db->query("DESCRIBE users");
        $columns = $result->fetchAll(PDO::FETCH_COLUMN);
        echo "Users table columns: " . implode(', ', $columns) . "\n";
        
        // Check for invalid session tokens
        $stmt = $db->query("SELECT id, userEmail, session_token FROM users WHERE session_token IS NOT NULL");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "Users with session tokens: " . count($users) . "\n";
        foreach ($users as $user) {
            echo "User {$user['userEmail']}: Token " . substr($user['session_token'], 0, 10) . "...\n";
        }
        
        // Check tasks table integrity
        $stmt = $db->query("
            SELECT t.id, t.user_id, u.userEmail 
            FROM tasks t 
            LEFT JOIN users u ON t.user_id = u.id 
            WHERE u.id IS NULL
        ");
        $orphanedTasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (count($orphanedTasks) > 0) {
            echo "WARNING: Found orphaned tasks: " . count($orphanedTasks) . "\n";
            foreach ($orphanedTasks as $task) {
                echo "Task ID {$task['id']} has invalid user_id {$task['user_id']}\n";
            }
        } else {
            echo "No orphaned tasks found\n";
        }
        
        // Check subtasks table integrity
        $stmt = $db->query("
            SELECT s.id, s.task_id, t.id as task_exists 
            FROM subtasks s 
            LEFT JOIN tasks t ON s.task_id = t.id 
            WHERE t.id IS NULL
        ");
        $orphanedSubtasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (count($orphanedSubtasks) > 0) {
            echo "WARNING: Found orphaned subtasks: " . count($orphanedSubtasks) . "\n";
            foreach ($orphanedSubtasks as $subtask) {
                echo "Subtask ID {$subtask['id']} has invalid task_id {$subtask['task_id']}\n";
            }
        } else {
            echo "No orphaned subtasks found\n";
        }
        
        // Check diary entries integrity
        $stmt = $db->query("
            SELECT d.id, d.user_id, u.userEmail 
            FROM diary_entries d 
            LEFT JOIN users u ON d.user_id = u.id 
            WHERE u.id IS NULL
        ");
        $orphanedEntries = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (count($orphanedEntries) > 0) {
            echo "WARNING: Found orphaned diary entries: " . count($orphanedEntries) . "\n";
            foreach ($orphanedEntries as $entry) {
                echo "Entry ID {$entry['id']} has invalid user_id {$entry['user_id']}\n";
            }
        } else {
            echo "No orphaned diary entries found\n";
        }
        
        // Check indexes
        $tables = ['users', 'tasks', 'subtasks', 'diary_entries'];
        foreach ($tables as $table) {
            $stmt = $db->query("SHOW INDEX FROM $table");
            $indexes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo "\nIndexes for $table:\n";
            foreach ($indexes as $index) {
                echo "- {$index['Key_name']} on {$index['Column_name']}\n";
            }
        }
        
    } catch (PDOException $e) {
        echo "Database verification failed: " . $e->getMessage() . "\n";
    }
}

// Run the verification
echo "Starting database verification...\n";
verifyDatabase();
echo "Database verification complete.\n";
?> 