<?php
/**
 * API THÊM DANH SÁCH TỪ VỰNG
 */

// 1. BẬT BÁO LỖI ĐỂ DEBUG (Sau khi chạy ngon thì comment lại dòng này)
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); // Cẩn thận khi deploy thật
header('Access-Control-Allow-Methods: POST');

require_once '../config/database.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method Not Allowed');
    }

    // Nhận JSON
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Log thử dữ liệu nhận được (Xem trong F12 -> Network -> Response nếu có lỗi)
    if (is_null($input)) {
        throw new Exception('Dữ liệu gửi lên không đúng định dạng JSON');
    }

    $course_id = isset($input['course_id']) ? intval($input['course_id']) : 0;
    $words = isset($input['words']) ? $input['words'] : [];

    if ($course_id <= 0) throw new Exception('ID khóa học không hợp lệ');
    if (empty($words)) throw new Exception('Danh sách từ vựng trống');

    // Bắt đầu Transaction
    $conn->begin_transaction();

    // 2. CHUẨN BỊ SQL (Lưu ý thứ tự dấu ?)
    $sql = "INSERT INTO word (course_id, word_en, word_vi, pronunciation, part_of_speech, definition, audio_file) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception("Lỗi Prepare SQL: " . $conn->error);
    }

    // Khởi tạo các biến bind (để trống ban đầu)
    $b_course_id = $course_id; // course_id không đổi
    $b_word_en = "";
    $b_word_vi = "";
    $b_pronunciation = "";
    $b_part_of_speech = "";
    $b_definition = "";
    $b_audio_file = "";

    // 3. BIND PARAM (GỌI 1 LẦN DUY NHẤT NGOÀI VÒNG LẶP)
    // i: integer, s: string. Tổng cộng 1 'i' và 6 's'
    $stmt->bind_param("issssss", 
        $b_course_id, 
        $b_word_en, 
        $b_word_vi, 
        $b_pronunciation, 
        $b_part_of_speech, 
        $b_definition, 
        $b_audio_file
    );

    $count = 0;
    foreach ($words as $w) {
        // Gán giá trị vào các biến đã bind
        $b_word_en = trim($w['tiengAnh']);
        $b_word_vi = trim($w['nghia']);
        
        // Bỏ qua nếu thiếu dữ liệu bắt buộc
        if (empty($b_word_en) || empty($b_word_vi)) continue;

        $b_pronunciation  = $w['phienAm'] ?? '';
        $b_part_of_speech = $w['tuLoai'] ?? '';
        $b_definition     = $w['moTa'] ?? '';
        $b_audio_file     = $w['linkAm'] ?? '';

        // Thực thi
        if (!$stmt->execute()) {
            // Ném lỗi chi tiết ra để frontend bắt được
            throw new Exception("Lỗi MySQL tại từ '{$b_word_en}': " . $stmt->error);
        }
        $count++;
    }

    // Commit transaction
    $conn->commit();
    $stmt->close();

    echo json_encode([
        'success' => true,
        'message' => "Đã thêm thành công $count từ vựng!",
        'count' => $count
    ]);

} catch (Exception $e) {
    if (isset($conn)) $conn->rollback();
    http_response_code(400); // Trả về mã lỗi 400 để JS nhảy vào catch hoặc else
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
    if (isset($conn)) $conn->close();
}
?>