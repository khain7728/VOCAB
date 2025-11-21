<?php
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');
$rootPath = dirname(__DIR__);
require_once $rootPath .  '/../../config/database.php';
require_once $rootPath . '/../includes/log_helper.php';

$input = json_decode(file_get_contents('php://input'), true);
if (isset($input['id'])) {
    $stmt = $conn->prepare("DELETE FROM course WHERE course_id = ?");
    $stmt->bind_param("i", $input['id']);
    if ($stmt->execute()) {
        if(function_exists('writeAdminLog')) writeAdminLog($conn, 1, "Xóa khóa học ID: ".$input['id'], $input['id']);
        echo json_encode(['status' => 'success', 'message' => 'Đã xóa!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Lỗi xóa (Có thể do ràng buộc dữ liệu): ' . $conn->error]);
    }
}
$conn->close();
?>