<?php
// Bật báo lỗi để debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

// __DIR__ là thư mục api/admin
// __DIR__ . '/../../' nghĩa là lùi ra api, rồi lùi ra root
require_once __DIR__ . '/../../config/database.php';

$input = json_decode(file_get_contents("php://input"), true);
if (isset($input['user_id']) && isset($input['status'])) {
    $newStatus = ($input['status'] === 'active') ? 0 : 1; 
    $stmt = $conn->prepare("UPDATE user SET status = ? WHERE user_id = ?");
    $stmt->bind_param("ii", $newStatus, $input['user_id']);
    if ($stmt->execute()) {
        if(function_exists('writeAdminLog')) writeAdminLog($conn, 1, "Đổi trạng thái User", $input['user_id']);
        echo json_encode(['status' => 'success', 'message' => 'Thành công!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => $conn->error]);
    }
}
$conn->close();
?>