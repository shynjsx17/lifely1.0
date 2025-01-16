<?php
// Load environment variables
require_once '../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    }
    
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    
    exit(0);
}

header('Content-Type: application/json');

require_once '../config/database.php';
require_once '../models/user.php';

use Google\Client;
use Google\Service\Calendar;
use Google\Service\Calendar\Event;

// Initialize database connection
$database = new Database();
$db = $database->connect();

// Initialize user object
$user = new User($db);

// Get the authorization header
$headers = apache_request_headers();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (!$auth_header || !preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
    http_response_code(401);
    echo json_encode(['status' => false, 'message' => 'No valid authorization header found']);
    exit();
}

$token = $matches[1];

// Verify authentication
$user_id = $user->verifySession($token);
if (!$user_id) {
    http_response_code(401);
    echo json_encode(['status' => false, 'message' => 'Invalid or expired session']);
    exit();
}

try {
    // Get user's Google Calendar tokens
    $stmt = $db->prepare("SELECT google_access_token, google_refresh_token, google_calendar_connected FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user_data = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user_data['google_calendar_connected'] || !$user_data['google_access_token']) {
        http_response_code(401);
        echo json_encode(['status' => false, 'message' => 'Google Calendar not connected']);
        exit();
    }

    // Initialize Google Client
    $client = new Client();
    $client->setClientId($_ENV['GOOGLE_CLIENT_ID']);
    $client->setClientSecret($_ENV['GOOGLE_CLIENT_SECRET']);
    $client->setRedirectUri('http://localhost/lifely1.0/backend/api/google-calendar-callback.php');

    // Set the access token
    $access_token = json_decode($user_data['google_access_token'], true);
    $client->setAccessToken($access_token);

    // Refresh token if expired
    if ($client->isAccessTokenExpired()) {
        if ($user_data['google_refresh_token']) {
            $client->fetchAccessTokenWithRefreshToken($user_data['google_refresh_token']);
            
            // Save the new access token
            $stmt = $db->prepare("UPDATE users SET google_access_token = ? WHERE id = ?");
            $stmt->execute([json_encode($client->getAccessToken()), $user_id]);
        } else {
            // Token expired and no refresh token available
            http_response_code(401);
            echo json_encode(['status' => false, 'message' => 'Google Calendar token expired']);
            exit();
        }
    }

    // Initialize Calendar Service
    $service = new Calendar($client);

    // Handle different HTTP methods
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // List events
            $start = $_GET['start'] ?? null;
            $end = $_GET['end'] ?? null;

            if (!$start || !$end) {
                throw new Exception('Start and end dates are required');
            }

            $events = $service->events->listEvents('primary', [
                'timeMin' => $start,
                'timeMax' => $end,
                'singleEvents' => true,
                'orderBy' => 'startTime'
            ]);

            echo json_encode([
                'status' => true,
                'data' => $events->getItems()
            ]);
            break;

        // ... Add other methods (POST, PUT, DELETE) as needed ...
    }
} catch (Exception $e) {
    error_log('Google Calendar Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => false,
        'message' => 'Failed to process Google Calendar request: ' . $e->getMessage()
    ]);
} 