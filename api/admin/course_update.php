<?php
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');
$rootPath = dirname(__DIR__);
require_once $rootPath .  '/../../config/database.php';
require_once $rootPath . '/../includes/log_helper.php';

$input = json_decode(file_get_contents('php://input'), true);
$admin_id = 1; 

if (isset($input['id']) && isset($input['code']) && isset($input['name'])) {
    $stmt = $conn->prepare("UPDATE course SET course_code = ?, course_name = ? WHERE course_id = ?");
    $stmt->bind_param("ssi", $input['code'], $input['name'], $input['id']);
    
    if ($stmt->execute()) {
        if(function_exists('writeAdminLog')) writeAdminLog($conn, $admin_id, "Sửa khóa học: ".$input['code'], $input['id']);
        echo json_encode(['status' => 'success', 'message' => 'Cập nhật thành công!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => $conn->error]);
    }
}
$conn->close();
?>