<?php
// api/join-course.php
// --- BẮT ĐẦU: CẤU HÌNH CORS CHUẨN ---
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
// --- KẾT THÚC: CẤU HÌNH CORS CHUẨN ---
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');
require_once '../config/database.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new Exception('Method Not Allowed');
    $input = json_decode(file_get_contents('php://input'), true);
    
    $user_id = isset($input['user_id']) ? intval($input['user_id']) : 0;
    $course_id = isset($input['course_id']) ? intval($input['course_id']) : 0;

    if ($user_id <= 0 || $course_id <= 0) throw new Exception('Dữ liệu không hợp lệ');

    // 1. Kiểm tra đã tham gia chưa (Bảng user_course)
    $checkSql = "SELECT 1 FROM user_course WHERE user_id = ? AND course_id = ?";
    $stmtCheck = $conn->prepare($checkSql);
    $stmtCheck->bind_param("ii", $user_id, $course_id);
    $stmtCheck->execute();
    
    if ($stmtCheck->get_result()->num_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Bạn đã tham gia khóa học này rồi']);
        exit;
    }

    // 2. Insert vào user_course
    // Lưu ý: Kiểm tra file SQL xem cột ngày giờ tên là gì (created_at hay enrolled_at)
    // Giả sử trong bảng user_course bạn dùng 'created_at'
    $sql = "INSERT INTO user_course (user_id, course_id, status, progress, enrolled_at) VALUES (?, ?, 'active', 0, NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $user_id, $course_id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Ghi danh thành công!']);
    } else {
        throw new Exception('Lỗi Database: ' . $stmt->error);
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>