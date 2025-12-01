<?php
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');
$rootPath = dirname(__DIR__);
require_once $rootPath . '/../../config/database.php';
require_once $rootPath . '/../includes/log_helper.php';

$input = json_decode(file_get_contents('php://input'), true);
$admin_id = 2; // Giả định admin_id

// Kiểm tra đầy đủ dữ liệu cần thiết
if (isset($input['id']) && isset($input['code']) && isset($input['name']) && isset($input['status']) && isset($input['tags']) && isset($input['description'])) {
    
    $id = (int)$input['id'];
    $code = trim($input['code']);
    $name = trim($input['name']);
    $status = ($input['status'] === 'active') ? 'public' : 'private'; // Xử lý status từ JS
    $tags = trim($input['tags']);
    $description = trim($input['description']);

    // 1. Kiểm tra trùng Mã (trừ mã hiện tại)
    $check = $conn->prepare("SELECT course_id FROM course WHERE course_code = ? AND course_id != ?");
    $check->bind_param("si", $code, $id);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        die(json_encode(['status' => 'error', 'message' => 'Mã khóa học đã tồn tại!']));
    }
    
    // 2. CẬP NHẬT CÁC TRƯỜNG MỚI VÀ TRẠNG THÁI
    $stmt = $conn->prepare("UPDATE course SET 
        course_code = ?, 
        course_name = ?, 
        visibility = ?, 
        course_tags = ?, 
        course_description = ? 
        WHERE course_id = ?");
        
    $stmt->bind_param("sssssi", $code, $name, $status, $tags, $description, $id);
    
    if ($stmt->execute()) {
        if(function_exists('writeAdminLog')) writeAdminLog($conn, $admin_id, "Cập nhật khóa học ID: " . $id, $id);
        echo json_encode(['status' => 'success', 'message' => 'Cập nhật thành công!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Lỗi thực thi: ' . $conn->error]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Thiếu dữ liệu để cập nhật.']);
}
$conn->close();
?>