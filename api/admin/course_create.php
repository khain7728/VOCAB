<?php
// FILE: api/admin/course_create.php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

require_once '../../config/database.php';
// Log helper (nếu có)
if (file_exists('../../includes/log_helper.php')) {
    require_once '../../includes/log_helper.php';
}

try {
    if (!$conn) throw new Exception("Mất kết nối Database.");

    $input = json_decode(file_get_contents('php://input'), true);
    
    $admin_id = 2; // Cần thay bằng $_SESSION['user_id']
    $codePrefix = "ENG"; // Tiền tố mã

    $name = isset($input['name']) ? trim($input['name']) : '';
    $desc = isset($input['description']) ? trim($input['description']) : '';
    $visibility = (isset($input['status']) && $input['status'] === 'active') ? 'public' : 'private';
    
    // Tag handling
    $tagsInput = isset($input['tags']) ? $input['tags'] : [];
    $tags = is_string($tagsInput) ? explode(',', $tagsInput) : $tagsInput;

    if (empty($name)) throw new Exception('Tên khóa học không được để trống.');

    // Check trùng tên
    $chk = $conn->prepare("SELECT course_id FROM course WHERE course_name = ?");
    $chk->bind_param("s", $name);
    $chk->execute();
    if ($chk->get_result()->num_rows > 0) throw new Exception("Tên khóa học '$name' đã tồn tại!");

    // TRANSACTION
    $conn->begin_transaction();

    // 1. Insert (Mã để NULL hoặc tự DB handle)
    $sqlInsert = "INSERT INTO course (course_name, description, visibility, create_by, created_at, hide) VALUES (?, ?, ?, ?, NOW(), 0)";
    $stmt = $conn->prepare($sqlInsert);
    $stmt->bind_param("sssi", $name, $desc, $visibility, $admin_id);
    
    if (!$stmt->execute()) throw new Exception("Lỗi Database: " . $stmt->error);
    
    $new_course_id = $conn->insert_id;

    // 2. Update Mã Tự Động (ENG + ID 3 chữ số)
    $autoCode = $codePrefix . str_pad($new_course_id, 3, '0', STR_PAD_LEFT);
    
    $sqlUpdate = $conn->prepare("UPDATE course SET course_code = ? WHERE course_id = ?");
    $sqlUpdate->bind_param("si", $autoCode, $new_course_id);
    
    if (!$sqlUpdate->execute()) throw new Exception("Lỗi sinh mã: " . $sqlUpdate->error);

    // 3. Xử lý Tags
    if (!empty($tags)) {
        $tags = array_unique(array_filter(array_map('trim', $tags)));
        $stmtChkTag = $conn->prepare("SELECT tag_id FROM tag WHERE tag_name = ?");
        $stmtInsTag = $conn->prepare("INSERT INTO tag (tag_name) VALUES (?)");
        $stmtLink   = $conn->prepare("INSERT IGNORE INTO course_tag (course_id, tag_id) VALUES (?, ?)");

        foreach ($tags as $t) {
            if(!$t) continue;
            $tid = 0;
            $stmtChkTag->bind_param("s", $t); $stmtChkTag->execute();
            $resTag = $stmtChkTag->get_result();
            if ($rowTag = $resTag->fetch_assoc()) $tid = $rowTag['tag_id'];
            else {
                $stmtInsTag->bind_param("s", $t);
                if($stmtInsTag->execute()) $tid = $stmtInsTag->insert_id;
            }
            if ($tid) {
                $stmtLink->bind_param("ii", $new_course_id, $tid);
                $stmtLink->execute();
            }
        }
    }

    $conn->commit();

    if (function_exists('writeAdminLog')) {
        writeAdminLog($conn, $admin_id, "Thêm khóa học: $name ($autoCode)", $new_course_id);
    }

    ob_clean();
    echo json_encode(['status' => 'success', 'message' => 'Thêm thành công! Mã: ' . $autoCode]);

} catch (Exception $e) {
    if (isset($conn)) $conn->rollback();
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>