<?php
// Load environment variables
require_once '../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../models/user.php';
require_once '../vendor/autoload.php';

use Google\Client;
use Google\Service\Calendar;

// Initialize database connection
$database = new Database();
$db = $database->connect();

// Initialize user object
$user = new User($db);

// Get the authorization header
$headers = getallheaders();
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

// Get the authorization code from the query string
$code = $_GET['code'] ?? null;
if (!$code) {
    http_response_code(400);
    echo json_encode(['status' => false, 'message' => 'Authorization code missing']);
    exit();
}

try {
    // Check if required environment variables are set
    if (!isset($_ENV['GOOGLE_CLIENT_ID']) || !isset($_ENV['GOOGLE_CLIENT_SECRET'])) {
        throw new Exception('Google OAuth credentials not configured');
    }

    // Initialize Google Client
    $client = new Client();
    $client->setClientId($_ENV['GOOGLE_CLIENT_ID']);
    $client->setClientSecret($_ENV['GOOGLE_CLIENT_SECRET']);
    $client->setRedirectUri('http://localhost:3000/mycalendar');
    $client->addScope('https://www.googleapis.com/auth/calendar');
    $client->setAccessType('offline');
    $client->setPrompt('consent');
    $client->setIncludeGrantedScopes(true);

    // Verify state parameter if provided
    if (isset($_GET['state'])) {
        // In a production environment, you should verify the state matches what you sent
        // For now, we'll just log it
        error_log('State parameter received: ' . $_GET['state']);
    }

    // Exchange authorization code for access token
    $token = $client->fetchAccessTokenWithAuthCode($code);
    
    if (!isset($token['error'])) {
        // Store the tokens in the database
        $stmt = $db->prepare("
            UPDATE users 
            SET google_access_token = ?, 
                google_refresh_token = ?,
                google_calendar_connected = TRUE
            WHERE id = ?
        ");
        
        $access_token = json_encode($token);
        $refresh_token = isset($token['refresh_token']) ? $token['refresh_token'] : null;
        
        if (!$stmt->execute([$access_token, $refresh_token, $user_id])) {
            throw new Exception('Failed to store Google Calendar tokens');
        }

        echo json_encode([
            'status' => true,
            'message' => 'Successfully connected to Google Calendar'
        ]);
    } else {
        throw new Exception($token['error'] ?? 'Unknown error while fetching access token');
    }
} catch (Exception $e) {
    error_log('Google Calendar Callback Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => false,
        'message' => 'Failed to connect to Google Calendar: ' . $e->getMessage()
    ]);
} 