<?php
/**
 * API THÊM DANH SÁCH TỪ VỰNG (FINAL VERSION)
 * Updated: Fix column names, Validate data, Transaction
 */

// --- CẤU HÌNH CORS ---
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Tắt hiển thị lỗi ra màn hình client (chỉ log error)
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
require_once '../config/config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method Not Allowed');
    }

    // 1. BẢO MẬT: User phải login
    $user_id = api_require_login(); 
    
    // 2. NHẬN VÀ VALIDATE JSON
    $raw_input = file_get_contents('php://input');
    $input = json_decode($raw_input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE || is_null($input)) {
        throw new Exception('Dữ liệu gửi lên không đúng định dạng JSON.');
    }

    $course_id = isset($input['course_id']) ? intval($input['course_id']) : 0;
    $words = isset($input['words']) ? $input['words'] : [];

    if ($course_id <= 0) throw new Exception('ID khóa học không hợp lệ.');
    if (!is_array($words) || empty($words)) throw new Exception('Danh sách từ vựng trống hoặc sai cấu trúc.');

    // 3. KIỂM TRA QUYỀN SỞ HỮU (OWNERSHIP)
    // Sửa: id -> course_id, user_id -> create_by
    $checkOwnerSql = "SELECT course_id FROM course WHERE course_id = ? AND create_by = ?";
    $stmtOwner = $conn->prepare($checkOwnerSql);
    $stmtOwner->bind_param("ii", $course_id, $user_id);
    $stmtOwner->execute();
    $stmtOwner->store_result();
    
    if ($stmtOwner->num_rows === 0) {
        $stmtOwner->close();
        throw new Exception("Bạn không có quyền chỉnh sửa khóa học này.");
    }
    $stmtOwner->close();

    // 4. CHUẨN BỊ SQL (TRANSACTION)
    $conn->begin_transaction();

    // Query thêm từ
    $sqlInsert = "INSERT INTO word (course_id, word_en, word_vi, pronunciation, part_of_speech, definition, audio_file) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmtInsert = $conn->prepare($sqlInsert);

    // Query kiểm tra trùng lặp
    // Sửa: id -> word_id
    $sqlCheckDup = "SELECT word_id FROM word WHERE course_id = ? AND word_en = ?";
    $stmtCheckDup = $conn->prepare($sqlCheckDup);

    if (!$stmtInsert || !$stmtCheckDup) {
        throw new Exception("Lỗi hệ thống (Prepare SQL Failed).");
    }

    // Bind biến cho Insert
    $b_course_id = $course_id;
    $b_word_en = "";
    $b_word_vi = "";
    $b_pronunciation = "";
    $b_part_of_speech = "";
    $b_definition = "";
    $b_audio_file = "";

    $stmtInsert->bind_param("issssss", 
        $b_course_id, $b_word_en, $b_word_vi, $b_pronunciation, 
        $b_part_of_speech, $b_definition, $b_audio_file
    );

    // Bind biến cho Check Duplicate
    $stmtCheckDup->bind_param("is", $b_course_id, $b_word_en);

    $count = 0;

    foreach ($words as $index => $w) {
        // --- VALIDATION DỮ LIỆU ĐẦU VÀO ---
        $b_word_en = isset($w['tiengAnh']) ? trim($w['tiengAnh']) : '';
        $b_word_vi = isset($w['nghia']) ? trim($w['nghia']) : '';
        
        // Bắt buộc có từ và nghĩa
        if (empty($b_word_en) || empty($b_word_vi)) continue;

        // Giới hạn độ dài (Dùng mb_strlen cho tiếng Việt)
        if (mb_strlen($b_word_en, 'UTF-8') > 100 || mb_strlen($b_word_vi, 'UTF-8') > 255) {
             throw new Exception("Từ vựng thứ " . ($index + 1) . " quá dài (Xem lại giới hạn cột word_en/word_vi).");
        }

        // Validate Part of Speech
        $raw_pos = isset($w['tuLoai']) ? trim($w['tuLoai']) : '';
        if (mb_strlen($raw_pos, 'UTF-8') > 50) $raw_pos = mb_substr($raw_pos, 0, 50, 'UTF-8');
        $b_part_of_speech = $raw_pos;

        // Validate Audio URL (Chấp nhận cả URL http và đường dẫn nội bộ uploads/...)
        $raw_audio = isset($w['linkAm']) ? trim($w['linkAm']) : '';
        // Logic: Nếu là link web thì validate, nếu là path nội bộ thì cho qua
        if (!empty($raw_audio) && strpos($raw_audio, 'http') === 0 && !filter_var($raw_audio, FILTER_VALIDATE_URL)) {
            $raw_audio = ''; 
        }
        $b_audio_file = $raw_audio;

        $b_pronunciation = isset($w['phienAm']) ? trim($w['phienAm']) : '';
        $b_definition    = isset($w['moTa']) ? trim($w['moTa']) : '';

        // --- CHECK TRÙNG TỪ ---
        $stmtCheckDup->execute();
        $stmtCheckDup->store_result();
        if ($stmtCheckDup->num_rows > 0) {
            throw new Exception("Từ '$b_word_en' đã tồn tại trong khóa học này.");
        }

        // --- THỰC THI INSERT ---
        if (!$stmtInsert->execute()) {
            throw new Exception("Lỗi khi lưu từ: '$b_word_en'");
        }
        $count++;
    }

    $conn->commit();
    $stmtInsert->close();
    $stmtCheckDup->close();

    echo json_encode([
        'success' => true,
        'message' => "Đã thêm thành công $count từ vựng!",
        'count' => $count
    ]);

} catch (Exception $e) {
    if (isset($conn)) $conn->rollback();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
    if (isset($conn)) $conn->close();
}
?>