<?php
/**
 * API LƯU KẾT QUẢ ÔN TẬP
 * Endpoint: api/save-review-session.php
 * Method: POST
 * Body: {
 *   user_id, course_id, review_type, total_words, 
 *   correct_count, score, duration_seconds, details[]
 * }
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

try {
    // Lấy dữ liệu JSON
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Validate input
    if (!isset($data['user_id']) || !isset($data['course_id']) || !isset($data['review_type'])) {
        throw new Exception('Missing required fields');
    }
    
    $user_id = intval($data['user_id']);
    $course_id = intval($data['course_id']);
    $review_type = $data['review_type'];
    $total_words = intval($data['total_words']);
    $correct_count = intval($data['correct_count']);
    $incorrect_count = $total_words - $correct_count;
    $score = floatval($data['score']);
    $duration_seconds = isset($data['duration_seconds']) ? intval($data['duration_seconds']) : null;
    $details = isset($data['details']) ? $data['details'] : [];
    
    // Bắt đầu transaction
    $conn->begin_transaction();
    
    // 1. Lưu session
    $insertSession = $conn->prepare(
        "INSERT INTO review_session 
        (user_id, course_id, review_type, total_words, correct_count, incorrect_count, score, duration_seconds) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $insertSession->bind_param(
        "iisiiddi", 
        $user_id, $course_id, $review_type, 
        $total_words, $correct_count, $incorrect_count, 
        $score, $duration_seconds
    );
    $insertSession->execute();
    $session_id = $conn->insert_id;
    
    // 2. Lưu chi tiết từng câu
    if (!empty($details)) {
        $insertDetail = $conn->prepare(
            "INSERT INTO review_session_detail 
            (session_id, word_id, user_answer, correct_answer, is_correct, response_time) 
            VALUES (?, ?, ?, ?, ?, ?)"
        );
        
        foreach ($details as $detail) {
            $word_id = intval($detail['word_id']);
            $user_answer = isset($detail['user_answer']) ? $detail['user_answer'] : null;
            $correct_answer = isset($detail['correct_answer']) ? $detail['correct_answer'] : null;
            $is_correct = isset($detail['is_correct']) ? ($detail['is_correct'] ? 1 : 0) : 0;
            $response_time = isset($detail['response_time']) ? intval($detail['response_time']) : null;
            
            $insertDetail->bind_param(
                "iissii", 
                $session_id, $word_id, 
                $user_answer, $correct_answer, 
                $is_correct, $response_time
            );
            $insertDetail->execute();
            
            // 3. Cập nhật trạng thái từ (gọi stored procedure)
            $updateWord = $conn->prepare("CALL sp_update_word_after_review(?, ?, ?)");
            $updateWord->bind_param("iii", $user_id, $word_id, $is_correct);
            $updateWord->execute();
            $updateWord->close(); // Phải close để tránh lỗi "Commands out of sync"
        }
        
        $insertDetail->close();
    }
    
    // 4. Cập nhật thống kê user
    $updateStats = $conn->prepare(
        "UPDATE statistic 
         SET total_quizzes_done = total_quizzes_done + 1,
             accuracy_rate = (
                 SELECT ROUND(AVG(score), 2) 
                 FROM review_session 
                 WHERE user_id = ?
             ),
             updated_at = NOW()
         WHERE user_id = ?"
    );
    $updateStats->bind_param("ii", $user_id, $user_id);
    $updateStats->execute();
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Review session saved successfully',
        'session_id' => $session_id
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    // Rollback nếu có lỗi
    if (isset($conn)) {
        $conn->rollback();
    }
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    
} finally {
    if (isset($insertSession)) $insertSession->close();
    if (isset($updateStats)) $updateStats->close();
    if (isset($conn)) $conn->close();
}
?>