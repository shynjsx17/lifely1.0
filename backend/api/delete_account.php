<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header("Content-Type: application/json");

include_once '../config/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->user_id) || !isset($data->password)) {
        echo json_encode(['status' => 'error', 'message' => 'User ID and password are required']);
        exit;
    }

    $user_id = mysqli_real_escape_string($conn, $data->user_id);
    $password = $data->password;
    
    // First verify the password
    $query = "SELECT password FROM users WHERE id = '$user_id'";
    $result = mysqli_query($conn, $query);
    
    if ($row = mysqli_fetch_assoc($result)) {
        if (password_verify($password, $row['password'])) {
            // Password is correct, proceed with deletion
            $delete_query = "DELETE FROM users WHERE id = '$user_id'";
            
            if (mysqli_query($conn, $delete_query)) {
                // Delete associated data (tasks, diary entries, etc.)
                mysqli_query($conn, "DELETE FROM tasks WHERE user_id = '$user_id'");
                mysqli_query($conn, "DELETE FROM diary_entries WHERE user_id = '$user_id'");
                
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Account successfully deleted'
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Failed to delete account'
                ]);
            }
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Incorrect password'
            ]);
        }
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'User not found'
        ]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
} 