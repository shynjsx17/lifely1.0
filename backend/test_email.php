<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/services/MailService.php';
require_once __DIR__ . '/../vendor/autoload.php';

try {
    echo "Starting email test...\n";
    echo "Loading mail service...\n";
    
    $mailService = new MailService();
    $testOTP = '123456';
    
    echo "Mail service loaded successfully.\n";
    echo "Attempting to send test email to lifelywebdev@gmail.com...\n";
    
    // Test sending email
    $result = $mailService->sendOTP('lifelywebdev@gmail.com', $testOTP);
    
    if ($result) {
        echo "Test email sent successfully!\n";
        echo "Please check lifelywebdev@gmail.com for the test OTP: $testOTP\n";
    } else {
        echo "Failed to send test email.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
} 