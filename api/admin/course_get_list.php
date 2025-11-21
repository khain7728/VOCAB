<?php
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');
$rootPath = dirname(__DIR__);
require_once $rootPath .  '/../../config/database.php';

$sql = "SELECT c.course_id, c.course_code, c.course_name, c.created_at, c.visibility, u.name as author_name FROM course c LEFT JOIN user u ON c.create_by = u.user_id ORDER BY c.created_at DESC";
$result = $conn->query($sql);
$data = [];

if ($result) {
    while($row = $result->fetch_assoc()) {
        $data[] = [
            'id' => $row['course_id'],
            'code' => $row['course_code'],
            'name' => $row['course_name'],
            'author' => $row['author_name'] ?? 'Admin',
            'status' => $row['visibility']
        ];
    }
    echo json_encode(['status' => 'success', 'data' => $data]);
} else {
    echo json_encode(['status' => 'error', 'message' => $conn->error]);
}
$conn->close();
?>