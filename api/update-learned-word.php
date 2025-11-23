<?php
/**
 * API CẬP NHẬT TRẠNG THÁI HỌC TỪ VỰNG
 * Endpoint: api/update-learned-word.php
 * Method: POST
 * Body: { user_id, word_id, learned, review_mode }
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

try {
    // Lấy dữ liệu JSON từ request body
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Validate input
    if (!isset($data['user_id']) || !isset($data['word_id'])) {
        throw new Exception('Missing required fields: user_id, word_id');
    }
    
    $user_id = intval($data['user_id']);
    $word_id = intval($data['word_id']);
    $learned = isset($data['learned']) ? (bool)$data['learned'] : false;
    $review_mode = isset($data['review_mode']) ? $data['review_mode'] : 'flashcard';
    $is_correct = isset($data['is_correct']) ? (bool)$data['is_correct'] : null;
    
    // Kiểm tra xem đã có record chưa
    $checkStmt = $conn->prepare("SELECT * FROM learned_word WHERE user_id = ? AND word_id = ?");
    $checkStmt->bind_param("ii", $user_id, $word_id);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows > 0) {
        // Cập nhật record hiện có
        $row = $result->fetch_assoc();
        $current_progress = $row['learning_progress'];
        $review_count = $row['review_count'];
        
        // Tính toán trạng thái mới
        $new_status = $learned ? 'reviewing' : 'learning';
        $new_progress = $learned ? min(100, $current_progress + 10) : max(0, $current_progress - 5);
        $new_review_count = $review_count + 1;
        
        // Nếu progress = 100, chuyển sang mastered
        if ($new_progress >= 100) {
            $new_status = 'mastered';
        }
        
        $updateStmt = $conn->prepare(
            "UPDATE learned_word 
             SET status = ?, 
                 learning_progress = ?, 
                 review_mode = ?,
                 review_count = ?,
                 last_reviewed_at = NOW()
             WHERE user_id = ? AND word_id = ?"
        );
        $updateStmt->bind_param("sisiii", $new_status, $new_progress, $review_mode, $new_review_count, $user_id, $word_id);
        $updateStmt->execute();
        
    } else {
        // Tạo record mới
        $initial_status = $learned ? 'learning' : 'not_learned';
        $initial_progress = $learned ? 10 : 0;
        
        $insertStmt = $conn->prepare(
            "INSERT INTO learned_word 
             (user_id, word_id, status, learning_progress, review_mode, review_count, current_position, last_reviewed_at) 
             VALUES (?, ?, ?, ?, ?, 1, 0, NOW())"
        );
        $insertStmt->bind_param("iisis", $user_id, $word_id, $initial_status, $initial_progress, $review_mode);
        $insertStmt->execute();
    }
    
    // Ghi log review nếu có
    if ($is_correct !== null) {
        $logStmt = $conn->prepare(
            "INSERT INTO review_log (user_id, word_id, is_correct) VALUES (?, ?, ?)"
        );
        $is_correct_int = $is_correct ? 1 : 0;
        $logStmt->bind_param("iii", $user_id, $word_id, $is_correct_int);
        $logStmt->execute();
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Updated successfully'
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} finally {
    if (isset($checkStmt)) $checkStmt->close();
    if (isset($updateStmt)) $updateStmt->close();
    if (isset($insertStmt)) $insertStmt->close();
    if (isset($logStmt)) $logStmt->close();
    if (isset($conn)) $conn->close();
}
?>