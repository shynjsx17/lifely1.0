<?php
require_once __DIR__ . '/MigrationManager.php';

// Initialize the migration manager
$migrationManager = new MigrationManager();
$db = $migrationManager->getConnection();

echo "Starting migrations...\n";

// List of migrations in order
$migrations = [
    ['name' => '001_initial_schema.php', 'class' => 'InitialSchema'],
    ['name' => '002_tasks_schema.php', 'class' => 'TasksSchema'],
    ['name' => '003_subtasks_schema.php', 'class' => 'SubtasksSchema'],
    ['name' => '004_diary_schema.php', 'class' => 'DiarySchema'],
    ['name' => '005_verification_schema.php', 'class' => 'VerificationSchema'],
    ['name' => '006_sessions_schema.php', 'class' => 'SessionsSchema']
];

// Run migrations
foreach ($migrations as $migration) {
    if (!$migrationManager->hasMigrationRun($migration['name'])) {
        echo "Running migration: {$migration['name']}\n";
        
        try {
            require_once $migration['name'];
            $migrationClass = new $migration['class']($db);
            
            // Run the migration
            $migrationClass->up();
            
            // Record successful migration
            $migrationManager->recordMigration($migration['name']);
            
            echo "Successfully executed migration: {$migration['name']}\n";
        } catch (Exception $e) {
            echo "Error executing migration {$migration['name']}: " . $e->getMessage() . "\n";
            exit(1);
        }
    } else {
        echo "Migration already executed: {$migration['name']}\n";
    }
}

echo "All migrations completed successfully!\n";
?> 