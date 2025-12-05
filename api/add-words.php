<?php
/**
 * API THÊM DANH SÁCH TỪ VỰNG
 * Fix lỗi: Sử dụng Output Buffering để chặn lỗi rác (Warning/Notice/Space) làm hỏng JSON
 */

// [QUAN TRỌNG] Bắt đầu bộ đệm ngay dòng đầu tiên. 
// Mọi lệnh echo, lỗi warning, khoảng trắng sẽ bị gom vào đây chứ không in ra ngay.
ob_start();

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    ob_end_clean(); 
    http_response_code(200);
    exit();
}

// Tắt hiển thị lỗi ra màn hình (để tránh làm hỏng JSON)
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
require_once '../config/config.php';

$response = [];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method Not Allowed');
    }

    // 1. User phải login
    // Lưu ý: Nếu hàm này echo gì đó, ob_start() sẽ chặn lại.
    $user_id = api_require_login(); 
    
    // 2. Nhận dữ liệu
    $raw_input = file_get_contents('php://input');
    $input = json_decode($raw_input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE || is_null($input)) {
        throw new Exception('Dữ liệu gửi lên không đúng định dạng JSON.');
    }

    $course_id = isset($input['course_id']) ? intval($input['course_id']) : 0;
    $words = isset($input['words']) ? $input['words'] : [];

    if ($course_id <= 0) throw new Exception('ID khóa học không hợp lệ.');
    
    // --- ĐIỀU KIỆN 3 TỪ ---
    if (!is_array($words) || count($words) < 3) {
        throw new Exception('Bạn cần nhập tối thiểu 3 từ vựng mới được lưu.');
    }

    // 3. Check Ownership
    // Sửa câu query tùy vào DB của bạn có cột create_by hay không
    $checkOwnerSql = "SELECT course_id FROM course WHERE course_id = ?"; 
    // $checkOwnerSql = "SELECT course_id FROM course WHERE course_id = ? AND create_by = ?"; // Nếu có check user
    
    $stmtOwner = $conn->prepare($checkOwnerSql);
    $stmtOwner->bind_param("i", $course_id); 
    // $stmtOwner->bind_param("ii", $course_id, $user_id); // Nếu có check user
    
    $stmtOwner->execute();
    $stmtOwner->store_result();
    
    if ($stmtOwner->num_rows === 0) {
        $stmtOwner->close();
        throw new Exception("Khóa học không tồn tại hoặc bạn không có quyền.");
    }
    $stmtOwner->close();

    // 4. Transaction & Insert
    $conn->begin_transaction();

    $sqlInsert = "INSERT INTO word (course_id, word_en, word_vi, pronunciation, part_of_speech, definition, audio_file) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmtInsert = $conn->prepare($sqlInsert);

    $sqlCheckDup = "SELECT word_id FROM word WHERE course_id = ? AND word_en = ?";
    $stmtCheckDup = $conn->prepare($sqlCheckDup);

    if (!$stmtInsert || !$stmtCheckDup) {
        throw new Exception("Lỗi hệ thống (Prepare SQL Failed).");
    }

    $b_course_id = $course_id;
    $b_word_en = ""; $b_word_vi = ""; $b_pronunciation = "";
    $b_part_of_speech = ""; $b_definition = ""; $b_audio_file = "";

    $stmtInsert->bind_param("issssss", 
        $b_course_id, $b_word_en, $b_word_vi, $b_pronunciation, 
        $b_part_of_speech, $b_definition, $b_audio_file
    );

    $stmtCheckDup->bind_param("is", $b_course_id, $b_word_en);

    $count = 0;
    $skipped = 0;

    foreach ($words as $index => $w) {
        $b_word_en = isset($w['tiengAnh']) ? trim($w['tiengAnh']) : '';
        $b_word_vi = isset($w['nghia']) ? trim($w['nghia']) : '';
        
        if (empty($b_word_en) || empty($b_word_vi)) continue;

        // Validation độ dài
        if (mb_strlen($b_word_en, 'UTF-8') > 100 || mb_strlen($b_word_vi, 'UTF-8') > 255) {
             throw new Exception("Từ vựng thứ " . ($index + 1) . " quá dài.");
        }

        $raw_pos = isset($w['tuLoai']) ? trim($w['tuLoai']) : '';
        if (mb_strlen($raw_pos, 'UTF-8') > 50) $raw_pos = mb_substr($raw_pos, 0, 50, 'UTF-8');
        $b_part_of_speech = $raw_pos;

        $raw_audio = isset($w['linkAm']) ? trim($w['linkAm']) : '';
        if (!empty($raw_audio) && strpos($raw_audio, 'http') === 0 && !filter_var($raw_audio, FILTER_VALIDATE_URL)) {
            $raw_audio = ''; 
        }
        $b_audio_file = $raw_audio;

        $b_pronunciation = isset($w['phienAm']) ? trim($w['phienAm']) : '';
        $b_definition    = isset($w['moTa']) ? trim($w['moTa']) : '';

        // [LOGIC] Check trùng -> SKIP
        $stmtCheckDup->execute();
        $stmtCheckDup->store_result();
        if ($stmtCheckDup->num_rows > 0) {
            $skipped++;
            continue; 
        }

        if (!$stmtInsert->execute()) {
            throw new Exception("Lỗi khi lưu từ: '$b_word_en'");
        }
        $count++;
    }

    $conn->commit();
    $stmtInsert->close();
    $stmtCheckDup->close();

    $response = [
        'success' => true,
        'message' => "Đã thêm mới $count từ. (Bỏ qua $skipped từ trùng)",
        'count' => $count,
        'skipped' => $skipped
    ];

} catch (Exception $e) {
    if (isset($conn)) $conn->rollback();
    $response = ['success' => false, 'error' => $e->getMessage()];
} finally {
    if (isset($conn)) $conn->close();

    // [QUAN TRỌNG] Xóa sạch bộ đệm chứa rác/lỗi trước đó
    ob_end_clean(); 
    
    // Chỉ in ra chuỗi JSON sạch sẽ
    echo json_encode($response);
}
?>