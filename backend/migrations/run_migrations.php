<?php
require_once __DIR__ . '/MigrationManager.php';
require_once __DIR__ . '/001_initial_schema.php';

try {
    $migrationManager = new MigrationManager();
    
    // List of migrations in order
    $migrations = [
        ['name' => 'InitialSchema', 'class' => new InitialSchema($migrationManager->getConnection())]
    ];

    // Run migrations
    foreach ($migrations as $migration) {
        if (!$migrationManager->hasMigrationRun($migration['name'])) {
            echo "Running migration: {$migration['name']}\n";
            $migration['class']->up();
            $migrationManager->recordMigration($migration['name']);
            echo "Migration completed: {$migration['name']}\n";
        } else {
            echo "Migration {$migration['name']} has already been executed.\n";
        }
    }

    echo "All migrations completed successfully!\n";
} catch (Exception $e) {
    die("Migration failed: " . $e->getMessage() . "\n");
} 