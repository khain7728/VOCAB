<?php
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');

$basePath = dirname(dirname(__DIR__)); 
require_once $basePath . '/config/database.php';

// Kiểm tra kết nối DB
if (!$conn) {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi kết nối CSDL.']);
    exit;
}

try {
    // Truy vấn lịch sử thao tác, join với bảng user để lấy tên admin
    $sql = "SELECT al.*, u.name AS admin_name 
            FROM admin_log al
            LEFT JOIN user u ON al.admin_id = u.user_id
            ORDER BY al.created_at DESC";
            
    $result = $conn->query($sql);
    $logs = [];

    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        echo json_encode(['status' => 'success', 'data' => $logs]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Lỗi truy vấn SQL: ' . $conn->error]);
    }

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi hệ thống: ' . $e->getMessage()]);
}

$conn->close();
?>