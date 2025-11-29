<?php
// Debug settings
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

// SỬA ĐƯỜNG DẪN: Lùi 2 cấp từ thư mục hiện tại
require_once __DIR__ . '/../../config/database.php';

// Kiểm tra kết nối DB
if (!$conn) {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi kết nối CSDL: ' . mysqli_connect_error()]);
    exit;
}

$sql = "SELECT user_id, name, email, created_at, status FROM user WHERE role = 'user' ORDER BY user_id DESC";
$result = $conn->query($sql);

$data = [];
if ($result) {
    while($row = $result->fetch_assoc()) {
        $data[] = [
            'id' => $row['user_id'],
            'fullname' => $row['name'],
            'email' => $row['email'],
            'created_at' => $row['created_at'],
            'status' => ($row['status'] == 1) ? 'active' : 'locked'
        ];
    }
    echo json_encode(['status' => 'success', 'data' => $data]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi truy vấn: ' . $conn->error]);
}
$conn->close();
?>