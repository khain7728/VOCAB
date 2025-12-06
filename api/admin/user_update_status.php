<?php
session_start();
header('Content-Type: application/json');

// #2: Check Admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Không có quyền truy cập"]);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

// Nhận JSON Input
$input = json_decode(file_get_contents("php://input"), true);
$userId = isset($input['user_id']) ? (int)$input['user_id'] : 0;
// Quy ước: 'active' => 1, 'locked' => 0
$status = (isset($input['status']) && $input['status'] == 'active') ? 1 : 0; 

// #20: Validate ID
if ($userId <= 0) {
    echo json_encode(["status" => "error", "message" => "ID tài khoản không hợp lệ"]);
    exit();
}

// #1: Prevent Admin self-lock (Dùng Session ID thật)
if ($userId == $_SESSION['user_id']) {
    echo json_encode(["status" => "error", "message" => "Bạn không thể tự khóa chính mình!"]);
    exit();
}

try {
    // #4: SQL Injection prevention
    $stmt = $conn->prepare("UPDATE user SET status = ? WHERE user_id = ?");
    $stmt->bind_param("ii", $status, $userId);

    if ($stmt->execute()) {
        $msg = $status == 1 ? "Đã mở khóa tài khoản thành công." : "Đã khóa tài khoản thành công.";
        echo json_encode(["status" => "success", "message" => $msg]);
    } else {
        throw new Exception($stmt->error);
    }
} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Lỗi cập nhật trạng thái."]);
}
?>