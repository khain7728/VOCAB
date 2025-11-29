<?php
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');

// Định nghĩa đường dẫn gốc
$basePath = dirname(dirname(__DIR__)); 

require_once $basePath . '/config/database.php'; 
require_once $basePath . '/includes/log_helper.php'; 

$input = json_decode(file_get_contents('php://input'), true);
$admin_id = 1;

if (!isset($input['id']) || !isset($input['code']) || !isset($input['name'])) {
    echo json_encode(['status' => 'error', 'message' => 'Dữ liệu đầu vào không đủ.']);
    exit;
}

// ------------------------------------
// Chuẩn bị biến và logic
// ------------------------------------
$course_id = $input['id'];
$course_code = $input['code'];
$course_name = $input['name'];

// Logic xử lý trạng thái (visibility)
$update_visibility_sql = "";
$bind_types = "ssi"; // default: code, name, id
$bind_params = [&$course_code, &$course_name, &$course_id];

if (isset($input['status'])) {
    // Ánh xạ trạng thái từ JS ('active', 'hidden') sang DB ('public', 'private')
    $db_visibility = ($input['status'] === 'active') ? 'public' : 'private'; 
    
    // Sửa tên cột thành 'visibility'
    $update_visibility_sql = ", visibility = ?";
    $bind_types = "sssi"; // code, name, visibility, id
    $bind_params = [&$course_code, &$course_name, &$db_visibility, &$course_id];
}

// ------------------------------------
// Thực thi SQL
// ------------------------------------

// Câu lệnh SQL đã được sửa để sử dụng 'visibility'
$sql = "UPDATE course SET course_code = ?, course_name = ?{$update_visibility_sql} WHERE course_id = ?";
$stmt = $conn->prepare($sql);

if ($stmt) {
    // Gắn tham số động (sử dụng dấu ... cho mảng tham số)
    $stmt->bind_param($bind_types, ...$bind_params);
    
    if ($stmt->execute()) {
        if(function_exists('writeAdminLog')) {
            writeAdminLog($conn, $admin_id, "Sửa khóa học: ".$course_code, $course_id);
        }
        echo json_encode(['status' => 'success', 'message' => 'Cập nhật thành công!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Lỗi truy vấn: ' . $conn->error]);
    }
    $stmt->close();

} else {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi prepare SQL: ' . $conn->error]);
}

$conn->close();
?>