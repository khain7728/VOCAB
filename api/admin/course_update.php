<?php
// FILE: api/admin/course_update.php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

require_once '../../config/config.php';
if (file_exists('../../includes/log_helper.php')) {
    require_once '../../includes/log_helper.php';
}

$input = json_decode(file_get_contents('php://input'), true);
$admin_id = $_SESSION['user_id']; // Lấy admin_id từ session đăng nhập

try {
    if (!$conn) throw new Exception("Mất kết nối Database.");

    // Kiểm tra dữ liệu đầu vào
    if (!isset($input['id']) || !isset($input['name'])) {
        throw new Exception("Thiếu dữ liệu ID hoặc Tên.");
    }

    $id = (int)$input['id'];
    $name = trim($input['name']);
    $desc = isset($input['description']) ? trim($input['description']) : '';
    // Status từ client gửi lên là 'active'/'hidden' -> DB là 'public'/'private'
    $visibility = (isset($input['status']) && $input['status'] === 'active') ? 'public' : 'private';
    
    // Tags xử lý sau nếu cần, ở đây update bảng course trước
    // Lưu ý: Cột mô tả của bạn là `description` (theo SQL đã check)
    $stmt = $conn->prepare("UPDATE course SET 
        course_name = ?, 
        description = ?, 
        visibility = ?
        WHERE course_id = ?");
    
    $stmt->bind_param("sssi", $name, $desc, $visibility, $id);

    if ($stmt->execute()) {
        
        // Cập nhật Tags (nếu có gửi lên)
        if (isset($input['tags'])) {
            // Xóa tags cũ
            $conn->query("DELETE FROM course_tag WHERE course_id = $id");
            
            // Thêm tags mới
            $tagsRaw = $input['tags'];
            $tags = is_string($tagsRaw) ? explode(',', $tagsRaw) : $tagsRaw;
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
                    $stmtLnk->bind_param("ii", $id, $tid);
                    $stmtLnk->execute();
                }
            }
        }

        // --- GHI LOG ---
        if (function_exists('writeAdminLog')) {
            writeAdminLog($conn, $admin_id, "Cập nhật khóa học: " . $name, $id);
        }
        // ---------------

        ob_clean();
        echo json_encode(['status' => 'success', 'message' => 'Cập nhật thành công!']);
    } else {
        throw new Exception("Lỗi SQL: " . $stmt->error);
    }

} catch (Exception $e) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>