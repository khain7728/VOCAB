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
    // 1. KIỂM TRA SESSION & QUYỀN HẠN
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (!check_session_timeout() || !validate_session_security()) throw new Exception("Phiên hết hạn, vui lòng đăng nhập lại.");
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') throw new Exception("Không đủ quyền truy cập.");

    $admin_id = $_SESSION['user_id'];
    $input = json_decode(file_get_contents('php://input'), true);

    // 2. CHECK CSRF
    if (!isset($input['csrf_token']) || $input['csrf_token'] !== $_SESSION['csrf_token']) {
        throw new Exception("Lỗi bảo mật CSRF.");
    }

    if (empty($input['id'])) throw new Exception("Thiếu ID khóa học.");
    $id = (int)$input['id'];

    // 3. LẤY THÔNG TIN KHÓA HỌC TRƯỚC KHI XÓA
    // Mục đích: Kiểm tra trạng thái và lấy tên để ghi log
    $stmtCheck = $conn->prepare("SELECT course_name, visibility FROM course WHERE course_id = ?");
    $stmtCheck->bind_param("i", $id);
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();
    $course = $resultCheck->fetch_assoc();

    if (!$course) {
        throw new Exception("Khóa học không tồn tại hoặc đã bị xóa.");
    }

    // --- YÊU CẦU LOGIC: CHỈ XÓA ĐƯỢC KHÓA HỌC CÔNG KHAI ---
    // Lưu ý: Logic này tuân thủ đúng yêu cầu của bạn (chỉ xóa Public). 
    // Nếu bạn muốn ngược lại (chỉ xóa Private), hãy đổi 'public' thành 'private'.
    if ($course['visibility'] !== 'public') {
        throw new Exception("Chỉ được phép xóa các khóa học đang ở trạng thái CÔNG KHAI (Public).");
    }

    // 4. THỰC HIỆN XÓA
    // Do DB có ràng buộc ON DELETE CASCADE (như giả định) thì chỉ cần xóa bảng cha.
    // Nếu không có CASCADE, cần xóa bảng con (lessons, course_tag) trước.
    $stmtDelete = $conn->prepare("DELETE FROM course WHERE course_id = ?");
    $stmtDelete->bind_param("i", $id);

    if ($stmtDelete->execute()) {
        // 5. GHI LOG HỆ THỐNG
        if (function_exists('writeAdminLog')) {
            writeAdminLog($conn, $admin_id, "Xóa khóa học công khai: " . $course['course_name'], $id);
        }

        ob_clean();
        echo json_encode([
            'status' => 'success', 
            'message' => 'Đã xóa khóa học thành công!'
        ]);
    } else {
        throw new Exception("Lỗi Database: " . $stmtDelete->error);
    }

} catch (Exception $e) {
    ob_clean();
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>