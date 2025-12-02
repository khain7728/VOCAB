<?php
// FILE: api/admin/course_get_list.php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET');

// Bắt đầu bộ đệm để tránh lỗi ký tự lạ
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    $db_path = '../../config/config.php'; 
    if (!file_exists($db_path)) {
        throw new Exception("Không tìm thấy file config database");
    }
    require_once $db_path;
    
    // ✅ BẢO MẬT: Chỉ admin mới được truy cập
    api_require_admin();

    if (!$conn) throw new Exception("Mất kết nối Database.");
    $conn->set_charset("utf8mb4");

    // --- SỬA LỖI Ở ĐÂY ---
    // Thay u.username thành u.name
    $sql = "SELECT 
                c.course_id, 
                c.course_code, 
                c.course_name, 
                c.description, 
                c.visibility, 
                c.created_at, 
                IFNULL(u.name, 'Admin') as author_name 
            FROM course c 
            LEFT JOIN user u ON c.create_by = u.user_id 
            ORDER BY c.created_at DESC";

    $result = $conn->query($sql);

    if (!$result) throw new Exception("Lỗi SQL: " . $conn->error);
    
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    ob_clean();
    echo json_encode(['status' => 'success', 'data' => $data]);

} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>