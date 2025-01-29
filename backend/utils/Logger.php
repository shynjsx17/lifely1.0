<?php

class Logger {
    private static $log_file = __DIR__ . '/../logs/app.log';

    public static function init() {
        $log_dir = dirname(self::$log_file);
        if (!file_exists($log_dir)) {
            mkdir($log_dir, 0777, true);
        }
    }

    public static function log($message, $type = 'INFO', $context = []) {
        self::init();
        
        $timestamp = date('Y-m-d H:i:s');
        $context_str = !empty($context) ? json_encode($context) : '';
        $log_message = "[$timestamp] [$type] $message $context_str\n";
        
        error_log($log_message, 3, self::$log_file);
    }

    public static function error($message, $context = []) {
        self::log($message, 'ERROR', $context);
    }

    public static function info($message, $context = []) {
        self::log($message, 'INFO', $context);
    }

    public static function debug($message, $context = []) {
        self::log($message, 'DEBUG', $context);
    }
} 