<?php
// FILE: api/admin/course_create.php
ob_start(); // Bắt đầu bộ đệm (chống lỗi rác header)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Tắt hiển thị lỗi ra màn hình
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

// 1. NẠP FILE KẾT NỐI VÀ LOG
require_once '../../config/database.php';
// Kiểm tra file log có tồn tại không trước khi require
if (file_exists('../../includes/log_helper.php')) {
    require_once '../../includes/log_helper.php';
}

try {
    if (!$conn) throw new Exception("Mất kết nối Database.");

    $input = json_decode(file_get_contents('php://input'), true);

    // --- CẤU HÌNH ADMIN ID = 2 ---
    $admin_id = 2; 

    // Validate
    $name = isset($input['name']) ? trim($input['name']) : '';
    $desc = isset($input['description']) ? trim($input['description']) : '';
    $visibility = (isset($input['status']) && $input['status'] === 'active') ? 'public' : 'private';

    // Xử lý Tags
    $tagsInput = isset($input['tags']) ? $input['tags'] : [];
    $tags = is_string($tagsInput) ? explode(',', $tagsInput) : $tagsInput;

    if (empty($name)) throw new Exception('Tên khóa học không được để trống.');

    // Check trùng tên
    $chk = $conn->prepare("SELECT course_id FROM course WHERE course_name = ?");
    $chk->bind_param("s", $name);
    $chk->execute();
    if ($chk->get_result()->num_rows > 0) throw new Exception("Tên khóa học '$name' đã tồn tại!");

    // BẮT ĐẦU INSERT
    $conn->begin_transaction();

    $sql = "INSERT INTO course (course_name, description, visibility, create_by, created_at, hide) VALUES (?, ?, ?, ?, NOW(), 0)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssi", $name, $desc, $visibility, $admin_id);
    
    if (!$stmt->execute()) throw new Exception("Lỗi lưu khóa học: " . $stmt->error);
    
    $new_course_id = $conn->insert_id;

    // Xử lý Tags
    if (!empty($tags)) {
        $tags = array_unique(array_filter(array_map('trim', $tags)));
        $stmtChk = $conn->prepare("SELECT tag_id FROM tag WHERE tag_name = ?");
        $stmtIns = $conn->prepare("INSERT INTO tag (tag_name) VALUES (?)");
        $stmtLnk = $conn->prepare("INSERT IGNORE INTO course_tag (course_id, tag_id) VALUES (?, ?)");

        foreach ($tags as $t) {
            if(!$t) continue;
            $tid = 0;
            $stmtChk->bind_param("s", $t); $stmtChk->execute();
            $res = $stmtChk->get_result();
            if($row = $res->fetch_assoc()) $tid = $row['tag_id'];
            else {
                $stmtIns->bind_param("s", $t);
                if($stmtIns->execute()) $tid = $stmtIns->insert_id;
            }
            if($tid) {
                $stmtLnk->bind_param("ii", $new_course_id, $tid);
                $stmtLnk->execute();
            }
        }
    }

    $conn->commit();

    // --- GHI LOG ---
    if (function_exists('writeAdminLog')) {
        writeAdminLog($conn, $admin_id, "Thêm khóa học mới: " . $name, $new_course_id);
    }
    // ---------------

    ob_clean(); // Xóa sạch bộ đệm trước khi in JSON
    echo json_encode(['status' => 'success', 'message' => 'Thêm thành công!']);

} catch (Exception $e) {
    if (isset($conn)) $conn->rollback();
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>