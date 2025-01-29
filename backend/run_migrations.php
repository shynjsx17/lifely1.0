<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/migrations/MigrationManager.php';

// Migration files in order
$migrationFiles = [
    '001_users_schema.php',
    '002_projects_schema.php',
    '003_tasks_schema.php',
    '004_comments_schema.php',
    '005_sessions_schema.php'
    // Add any other migration files in order
];

try {
    foreach ($migrationFiles as $file) {
        require_once __DIR__ . '/migrations/' . $file;
        
        // Get the class name from file (assuming class name matches schema name)
        $className = str_replace(['.php', '001_', '002_', '003_', '004_', '005_'], '', $file);
        $className = str_replace('_', ' ', $className);
        $className = str_replace(' ', '', ucwords($className));
        
        // Create instance and run migration
        $migration = new $className($conn);
        $migration->up();
        echo "Executed migration: $file\n";
    }
    
    echo "All migrations completed successfully!\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?> 