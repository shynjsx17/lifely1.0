<?php
require_once __DIR__ . '/db_connect.php';

class Database {
    public function connect() {
        return get_database_connection();
    }
} 