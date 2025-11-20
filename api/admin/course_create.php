<?php
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');
$rootPath = dirname(__DIR__);
require_once $rootPath . '/../includes/db_connection.php';
require_once $rootPath . '/../includes/log_helper.php';

$input = json_decode(file_get_contents('php://input'), true);
$admin_id = 2;

if (isset($input['code']) && isset($input['name'])) {
    $check = $conn->prepare("SELECT course_id FROM course WHERE course_code = ?");
    $check->bind_param("s", $input['code']);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        die(json_encode(['status' => 'error', 'message' => 'Mã khóa học đã tồn tại!']));
    }

    $stmt = $conn->prepare("INSERT INTO course (course_code, course_name, create_by, visibility, created_at) VALUES (?, ?, ?, 'public', NOW())");
    $stmt->bind_param("ssi", $input['code'], $input['name'], $admin_id);
    
    if ($stmt->execute()) {
        if(function_exists('writeAdminLog')) writeAdminLog($conn, $admin_id, "Thêm khóa học: ".$input['name'], $conn->insert_id);
        echo json_encode(['status' => 'success', 'message' => 'Thêm thành công!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => $conn->error]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Thiếu dữ liệu']);
}
$conn->close();
?>