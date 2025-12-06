<?php
// FILE: api/admin/course_delete.php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ob_start();

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

require_once '../../config/config.php';
require_once '../../includes/auth_check.php';
require_once '../../includes/log_helper.php';

try {
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (!check_session_timeout() || !validate_session_security()) throw new Exception("Phiên hết hạn.");
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') throw new Exception("Không đủ quyền.");

    $admin_id = $_SESSION['user_id'];
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['csrf_token']) || $input['csrf_token'] !== $_SESSION['csrf_token']) throw new Exception("Lỗi CSRF.");

    $id = (int)$input['id'];

    // Lấy tên để ghi log
    $res = $conn->query("SELECT course_name FROM course WHERE course_id=$id");
    $cName = ($res && $row = $res->fetch_assoc()) ? $row['course_name'] : "ID $id";

    // Xóa Cascade thủ công (nếu DB chưa có ON DELETE CASCADE)
    // Nhưng vì DB của bạn đã có ON DELETE CASCADE (như file sql bạn gửi), chỉ cần xóa course
    $stmt = $conn->prepare("DELETE FROM course WHERE course_id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        if (function_exists('writeAdminLog')) {
            writeAdminLog($conn, $admin_id, "Xóa khóa học: $cName", $id);
        }
        ob_clean();
        echo json_encode(['status' => 'success', 'message' => 'Đã xóa khóa học!']);
    } else {
        throw new Exception("Lỗi xóa: " . $stmt->error);
    }

} catch (Exception $e) {
    ob_clean();
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>