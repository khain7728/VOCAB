<?php
/**
 * API CẬP NHẬT HỒ SƠ USER
 * Endpoint: api/update-user-profile.php
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require_once '../config/database.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Only POST method is allowed');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) { throw new Exception('Invalid JSON input'); }

    $user_id = isset($input['user_id']) ? intval($input['user_id']) : 0;
    $fullname = isset($input['fullname']) ? trim($input['fullname']) : '';
    $bio = isset($input['bio']) ? trim($input['bio']) : '';

    if ($user_id <= 0) { throw new Exception('Invalid user_id'); }

    $sql = "UPDATE user SET name = ?, bio = ? WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssi", $fullname, $bio, $user_id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Cập nhật hồ sơ thành công'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception('Lỗi cập nhật: ' . $stmt->error);
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} finally {
    if (isset($conn)) $conn->close();
}
?>