<?php
// FILE: api/admin/course_update.php
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
    $name = trim($input['name']);
    $desc = trim($input['description']);
    $status = ($input['status'] === 'active') ? 'public' : 'private';
    $tagsRaw = $input['tags'] ?? '';

    // Verify ownership (Lỗi #3) - Chỉ cho phép nếu là Admin
    // (Vì role đã check là admin ở trên, nên admin có quyền sửa mọi khóa học)
    
    $stmt = $conn->prepare("UPDATE course SET course_name=?, description=?, visibility=? WHERE course_id=?");
    $stmt->bind_param("sssi", $name, $desc, $status, $id);
    
    if ($stmt->execute()) {
        // Cập nhật Tags
        $conn->query("DELETE FROM course_tag WHERE course_id = $id");
        if (!empty($tagsRaw)) {
            $tags = array_unique(array_filter(array_map('trim', explode(',', $tagsRaw))));
            // ... (Logic thêm tag y hệt phần Create)
             $stmtChk = $conn->prepare("SELECT tag_id FROM tag WHERE tag_name = ?");
            $stmtIns = $conn->prepare("INSERT INTO tag (tag_name) VALUES (?)");
            $stmtLnk = $conn->prepare("INSERT IGNORE INTO course_tag (course_id, tag_id) VALUES (?, ?)");

            foreach ($tags as $t) {
                $tid = 0;
                $stmtChk->bind_param("s", $t); $stmtChk->execute();
                $res = $stmtChk->get_result();
                if ($row = $res->fetch_assoc()) {
                    $tid = $row['tag_id'];
                } else {
                    $stmtIns->bind_param("s", $t); 
                    if ($stmtIns->execute()) $tid = $stmtIns->insert_id;
                }
                if ($tid) {
                    $stmtLnk->bind_param("ii", $id, $tid);
                    $stmtLnk->execute();
                }
            }
        }

        if (function_exists('writeAdminLog')) {
            writeAdminLog($conn, $admin_id, "Cập nhật khóa học: $name", $id);
        }

        ob_clean();
        echo json_encode(['status' => 'success', 'message' => 'Cập nhật thành công!']);
    } else {
        throw new Exception("Lỗi SQL: " . $stmt->error);
    }

} catch (Exception $e) {
    ob_clean();
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>