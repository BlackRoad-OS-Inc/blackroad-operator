<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Simple mock API responses
$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Mock user database
$users = [
    ['id' => 1, 'username' => 'demo', 'email' => 'demo@blackroad.io', 'balance' => 1000]
];

if (strpos($uri, '/auth/register') !== false && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    echo json_encode([
        'id' => 2,
        'username' => $data['username'],
        'email' => $data['email'],
        'balance' => 100
    ]);
    exit();
}

if (strpos($uri, '/auth/token') !== false && $method === 'POST') {
    echo json_encode([
        'access_token' => 'mock_token_' . bin2hex(random_bytes(16)),
        'token_type' => 'bearer'
    ]);
    exit();
}

if (strpos($uri, '/auth/me') !== false) {
    echo json_encode($users[0]);
    exit();
}

if (strpos($uri, '/ai-chat/chat') !== false && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $responses = [
        "That's interesting! I'm powered by 30,000 AI agents.",
        "Great question! Let me process that with my neural network.",
        "BlackRoad OS is ready to help. What else would you like to know?",
        "I'm here to assist! Ask me anything."
    ];
    echo json_encode([
        'response' => $responses[array_rand($responses)] . " You said: '" . $data['message'] . "'"
    ]);
    exit();
}

if (strpos($uri, '/stripe/payment-intents') !== false && $method === 'POST') {
    echo json_encode([
        'client_secret' => 'pi_mock_' . bin2hex(random_bytes(16)),
        'id' => 'pi_' . bin2hex(random_bytes(8))
    ]);
    exit();
}

// Default response
echo json_encode([
    'status' => 'ok',
    'message' => 'BlackRoad API Mock Service',
    'timestamp' => time()
]);
?>
