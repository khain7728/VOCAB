<?php
// FILE: api/admin/course_delete.php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

require_once '../../config/database.php';
if (file_exists('../../includes/log_helper.php')) {
    require_once '../../includes/log_helper.php';
}

$input = json_decode(file_get_contents('php://input'), true);
$admin_id = 2; // ID Admin cố định

try {
    if (!isset($input['id'])) throw new Exception("Thiếu ID khóa học.");
    $id = (int)$input['id'];

    // 1. Lấy tên khóa học trước khi xóa để ghi log cho rõ
    $courseName = "ID " . $id;
    $getName = $conn->query("SELECT course_name FROM course WHERE course_id = $id");
    if ($getName && $row = $getName->fetch_assoc()) {
        $courseName = $row['course_name'];
    }

    // 2. Thực hiện xóa
    $stmt = $conn->prepare("DELETE FROM course WHERE course_id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        
        // --- GHI LOG ---
        if (function_exists('writeAdminLog')) {
            writeAdminLog($conn, $admin_id, "Xóa khóa học: " . $courseName, $id);
        }
        // ---------------

        ob_clean();
        echo json_encode(['status' => 'success', 'message' => 'Đã xóa khóa học!']);
    } else {
        throw new Exception("Lỗi xóa: " . $conn->error);
    }

} catch (Exception $e) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>