<?php
require_once __DIR__ . '/../config/database.php';

function runMigrations() {
    $db = new Database();
    $conn = $db->getConnection();

    try {
        // Start transaction
        $conn->beginTransaction();

        // Array of migration files in order
        $migrations = [
            'create_users_table.sql',
            'create_tasks_table.sql',
            'create_diary_entries_table.sql',
            'create_password_reset_tokens_table.sql',
            'add_soft_delete_to_users.sql'  // Added new migration
        ];

        foreach ($migrations as $migration) {
            $sql = file_get_contents(__DIR__ . '/migrations/' . $migration);
            
            // Split SQL by delimiter to handle triggers
            $queries = explode('DELIMITER //', $sql);
            
            foreach ($queries as $query) {
                if (trim($query)) {
                    // Reset delimiter and split into individual statements
                    $statements = explode(';', str_replace('DELIMITER ;', '', $query));
                    
                    foreach ($statements as $statement) {
                        if (trim($statement)) {
                            $conn->exec(trim($statement));
                        }
                    }
                }
            }
            
            echo "Executed migration: $migration\n";
        }

        // Commit transaction
        $conn->commit();
        echo "All migrations completed successfully!\n";

    } catch (PDOException $e) {
        // Rollback transaction on error
        $conn->rollBack();
        echo "Migration failed: " . $e->getMessage() . "\n";
        exit(1);
    }
}

// Run migrations
runMigrations(); 