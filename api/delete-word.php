<?php
/**
 * API XÓA TỪ VỰNG (Full CORS & Logic an toàn)
 * Endpoint: api/delete-word.php
 * Method: POST
 */

// --- 1. CẤU HÌNH CORS (Bắt buộc) ---
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Xử lý Preflight Request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- 2. CẤU HÌNH PHP ---
ob_start(); // Bắt đầu buffer để tránh lỗi header
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');

require_once '../config/database.php';

$response = [];

try {
    // Chỉ nhận POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method Not Allowed');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $user_id = isset($input['user_id']) ? intval($input['user_id']) : 0;
    $word_id = isset($input['word_id']) ? intval($input['word_id']) : 0;

    if ($user_id <= 0 || $word_id <= 0) {
        throw new Exception('Dữ liệu không hợp lệ');
    }

    // --- 3. KIỂM TRA QUYỀN SỞ HỮU ---
    // Phải kiểm tra xem người xóa (user_id) có phải là người tạo ra Khóa học chứa từ này không
    $sqlCheck = "SELECT c.create_by 
                 FROM word w 
                 JOIN course c ON w.course_id = c.course_id 
                 WHERE w.word_id = ?";
                 
    $stmtCheck = $conn->prepare($sqlCheck);
    $stmtCheck->bind_param("i", $word_id);
    $stmtCheck->execute();
    $resCheck = $stmtCheck->get_result();

    if ($resCheck->num_rows === 0) {
        throw new Exception('Từ vựng không tồn tại');
    }
    
    $row = $resCheck->fetch_assoc();
    if ($row['create_by'] != $user_id) {
        throw new Exception('Bạn không có quyền xóa từ vựng này (chỉ chủ khóa học mới được xóa)');
    }

    // --- 4. THỰC HIỆN XÓA (Transaction) ---
    $conn->begin_transaction();

    // Bước A: Xóa dữ liệu học tập liên quan đến từ này (trong bảng learned_word)
    // Nếu không xóa cái này trước, database có thể báo lỗi khóa ngoại (Foreign Key Constraint)
    $delLearn = $conn->prepare("DELETE FROM learned_word WHERE word_id = ?");
    $delLearn->bind_param("i", $word_id);
    $delLearn->execute();

    // Bước B: Xóa từ vựng trong bảng word
    $delWord = $conn->prepare("DELETE FROM word WHERE word_id = ?");
    $delWord->bind_param("i", $word_id);
    
    if (!$delWord->execute()) {
        throw new Exception("Lỗi Database: " . $conn->error);
    }

    $conn->commit();
    $response = ['success' => true, 'message' => 'Đã xóa từ vựng thành công'];

} catch (Exception $e) {
    if (isset($conn)) $conn->rollback();
    http_response_code(400);
    $response = ['success' => false, 'error' => $e->getMessage()];
}

// Xóa buffer rác và trả về JSON
ob_clean();
echo json_encode($response);
exit();
?>