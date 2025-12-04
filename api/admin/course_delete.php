<?php
// FILE: api/admin/course_delete.php
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
    if (!isset($input['id'])) throw new Exception("Thiếu ID khóa học.");
    $id = (int)$input['id'];

    // 1. Lấy tên khóa học trước khi xóa để ghi log cho rõ
    $courseName = "ID " . $id;
    $getName = $conn->query("SELECT course_name FROM course WHERE course_id = $id");
    if ($getName && $row = $getName->fetch_assoc()) {
        $courseName = $row['course_name'];
    }

    // 2. Xóa CASCADE tất cả dữ liệu liên quan (FIX BUG #5)
    
    // Lấy danh sách word_id để xóa dữ liệu liên quan
    $wordIds = [];
    $getWords = $conn->query("SELECT word_id FROM word WHERE course_id = $id");
    if ($getWords) {
        while ($row = $getWords->fetch_assoc()) {
            $wordIds[] = $row['word_id'];
        }
    }
    
    if (!empty($wordIds)) {
        $wordIdsStr = implode(',', $wordIds);
        
        // Xóa review_session_detail trước (foreign key)
        $conn->query("
            DELETE FROM review_session_detail 
            WHERE session_id IN (
                SELECT session_id FROM review_session WHERE course_id = $id
            )
        ");
        
        // Xóa review_log
        $conn->query("DELETE FROM review_log WHERE word_id IN ($wordIdsStr)");
        
        // Xóa learned_word
        $conn->query("DELETE FROM learned_word WHERE word_id IN ($wordIdsStr)");
    }
    
    // Xóa review_session
    $conn->query("DELETE FROM review_session WHERE course_id = $id");
    
    // Xóa course_tag
    $conn->query("DELETE FROM course_tag WHERE course_id = $id");
    
    // Xóa user_course
    $conn->query("DELETE FROM user_course WHERE course_id = $id");
    
    // Xóa word
    $conn->query("DELETE FROM word WHERE course_id = $id");
    
    // 3. Thực hiện xóa khóa học chính
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