<?php
// 1. Cấu hình header JSON và tắt báo lỗi rác
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');

// 2. Kết nối Database (Đường dẫn tuyệt đối)
$rootPath = dirname(__DIR__);
require_once $rootPath . '/../includes/db_connection.php';

try {
    // 3. Câu lệnh SQL
    // Join bảng admin_log với user để lấy tên người thực hiện
    $sql = "SELECT 
                l.log_id, 
                l.action, 
                l.target_id, 
                l.created_at, 
                u.name as admin_name
            FROM admin_log l
            LEFT JOIN user u ON l.admin_id = u.user_id
            ORDER BY l.created_at DESC"; // Mới nhất lên đầu

    $result = $conn->query($sql);
    $data = [];

    if ($result) {
        while($row = $result->fetch_assoc()) {
            // Bảng admin_log trong SQL của bạn không có cột 'status'
            // Nên mình mặc định trả về status='success' để giao diện hiện màu xanh
            $data[] = [
                'log_id' => $row['log_id'],
                'admin_name' => $row['admin_name'] ?? 'Admin (Đã xóa)',
                'action' => $row['action'],
                'target_id' => $row['target_id'],
                'created_at' => $row['created_at'],
                'status' => 'success' 
            ];
        }
        echo json_encode(['status' => 'success', 'data' => $data]);
    } else {
        throw new Exception("Lỗi truy vấn: " . $conn->error);
    }

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>