<?php
// FILE: api/admin/user_get_list.php

// BẮT ĐẦU OUTPUT BUFFERING
ob_start();
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../../config/config.php';

try {
    // ✅ BẢO MẬT: Chỉ admin mới được truy cập
    api_require_admin();
    
    if (!$conn) throw new Exception("Lỗi kết nối CSDỄ: " . mysqli_connect_error());

    // Chỉ lấy user thường (role = 'user') hoặc lấy tất cả tùy nhu cầu
    // Ở đây lấy tất cả user có role='user' theo code cũ của bạn
    $sql = "SELECT user_id, name, email, created_at, status FROM user WHERE role = 'user' ORDER BY user_id DESC";
    $result = $conn->query($sql);

    if (!$result) throw new Exception("Lỗi truy vấn: " . $conn->error);

    $data = [];
    while($row = $result->fetch_assoc()) {
        $data[] = [
            'id' => $row['user_id'],
            'fullname' => $row['name'], // Cột trong DB là 'name'
            'email' => $row['email'],
            'created_at' => $row['created_at'],
            // status trong DB: 1 là active, 0 là locked
            'status' => ($row['status'] == 1) ? 'active' : 'locked'
        ];
    }
    
    ob_clean(); // Xóa sạch bộ đệm trước khi in JSON
    echo json_encode(['status' => 'success', 'data' => $data]);

} catch (Exception $e) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

if (isset($conn)) $conn->close();
ob_end_flush();
?>