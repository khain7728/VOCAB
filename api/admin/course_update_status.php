<?php
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');
$rootPath = dirname(__DIR__);
require_once $rootPath .  '/../../config/database.php';
require_once $rootPath . '/../includes/log_helper.php';

$input = json_decode(file_get_contents('php://input'), true);
if (isset($input['id']) && isset($input['status'])) {
    $newStatus = ($input['status'] === 'public') ? 'private' : 'public';
    $stmt = $conn->prepare("UPDATE course SET visibility = ? WHERE course_id = ?");
    $stmt->bind_param("si", $newStatus, $input['id']);
    if ($stmt->execute()) {
        if(function_exists('writeAdminLog')) writeAdminLog($conn, 1, "Đổi trạng thái khóa học", $input['id']);
        echo json_encode(['status' => 'success', 'message' => 'Đã đổi trạng thái!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => $conn->error]);
    }
}
$conn->close();
?>