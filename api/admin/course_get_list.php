<?php
// Bật báo lỗi để dễ debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

// Sửa đường dẫn để tránh lỗi
require_once __DIR__ . '/../../config/database.php';

// Kiểm tra kết nối
if (!$conn) {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi kết nối Database']);
    exit;
}

$sql = "SELECT c.course_id, c.course_code, c.course_name, c.created_at, c.visibility, u.name as author_name 
        FROM course c 
        LEFT JOIN user u ON c.create_by = u.user_id 
        ORDER BY c.created_at DESC";

$result = $conn->query($sql);
$data = [];

if ($result) {
    while($row = $result->fetch_assoc()) {
        $data[] = [
            'id' => $row['course_id'],
            'code' => $row['course_code'],
            'name' => $row['course_name'],
            'author' => $row['author_name'] ?? 'Admin',
            // status sẽ trả về 'public' hoặc 'private' (hoặc giá trị khác trong DB)
            'status' => $row['visibility'] 
        ];
    }
    echo json_encode(['status' => 'success', 'data' => $data]);
} else {
    echo json_encode(['status' => 'error', 'message' => $conn->error]);
}
$conn->close();
?>