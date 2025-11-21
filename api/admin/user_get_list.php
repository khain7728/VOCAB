<?php
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');
$rootPath = dirname(__DIR__);
require_once $rootPath .  '/../../config/database.php';

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
}
$conn->close();
?>