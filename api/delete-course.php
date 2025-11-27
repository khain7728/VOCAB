<?php
/**
 * API XÓA HOẶC RỜI KHỎI KHÓA HỌC (Full Update)
 * Endpoint: api/delete-course.php
 * Method: POST
 */

// --- BẮT ĐẦU: CẤU HÌNH CORS CHUẨN ---
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
// --- KẾT THÚC: CẤU HÌNH CORS CHUẨN ---

ob_start();
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');

require_once '../config/database.php';

$response = [];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new Exception('Method Not Allowed');
    
    $input = json_decode(file_get_contents('php://input'), true);
    $user_id = isset($input['user_id']) ? intval($input['user_id']) : 0;
    $course_id = isset($input['course_id']) ? intval($input['course_id']) : 0;
    $action = isset($input['action']) ? $input['action'] : ''; // 'delete' | 'leave'

    if ($user_id <= 0 || $course_id <= 0) throw new Exception('Dữ liệu không hợp lệ');

    // Bắt đầu transaction
    $conn->begin_transaction();

    if ($action === 'delete') {
        // --- TRƯỜNG HỢP 1: XÓA VĨNH VIỄN (Chủ sở hữu) ---
        
        // 1. Kiểm tra quyền chủ sở hữu
        $check = $conn->prepare("SELECT create_by FROM course WHERE course_id = ?");
        $check->bind_param("i", $course_id);
        $check->execute();
        $res = $check->get_result();
        if ($res->num_rows === 0) throw new Exception('Khóa học không tồn tại');
        
        $row = $res->fetch_assoc();
        if ($row['create_by'] != $user_id) throw new Exception('Bạn không phải chủ sở hữu');

        // 2. Xóa dữ liệu liên quan (Foreign Keys)
        $conn->query("DELETE FROM course_tag WHERE course_id = $course_id");
        $conn->query("DELETE FROM user_course WHERE course_id = $course_id"); // Xóa tất cả học viên đang học
        $conn->query("DELETE FROM word WHERE course_id = $course_id");
        
        // 3. Xóa khóa học
        $stmt = $conn->prepare("DELETE FROM course WHERE course_id = ?");
        $stmt->bind_param("i", $course_id);
        
        if (!$stmt->execute()) throw new Exception("Lỗi khi xóa khóa học");
        
        $msg = "Đã xóa vĩnh viễn khóa học!";

    } elseif ($action === 'leave') {
        // --- TRƯỜNG HỢP 2: RỜI KHỎI KHÓA HỌC (Thành viên) ---
        
        // 1. Xóa khỏi bảng user_course
        $stmt = $conn->prepare("DELETE FROM user_course WHERE user_id = ? AND course_id = ?");
        $stmt->bind_param("ii", $user_id, $course_id);
        
        if (!$stmt->execute()) throw new Exception("Lỗi khi rời khóa học");
        
        // Kiểm tra xem có xóa được dòng nào không
        if ($stmt->affected_rows > 0) {
            // 2. Cập nhật giảm số lượng khóa học trong bảng statistic
            $updateStat = $conn->prepare("UPDATE statistic SET total_courses = GREATEST(0, total_courses - 1) WHERE user_id = ?");
            $updateStat->bind_param("i", $user_id);
            $updateStat->execute();
        }
        
        $msg = "Đã rời khỏi khóa học!";
        
    } else {
        throw new Exception('Hành động không hợp lệ (chỉ delete/leave)');
    }

    $conn->commit();
    $response = ['success' => true, 'message' => $msg];

} catch (Exception $e) {
    if (isset($conn)) $conn->rollback();
    $response = ['success' => false, 'error' => $e->getMessage()];
}

ob_clean();
echo json_encode($response);
exit();
?>