<?php
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');
$rootPath = dirname(__DIR__);
require_once $rootPath .  '/../../config/database.php';
require_once $rootPath . '/../includes/log_helper.php';

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