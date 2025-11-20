<?php
/**
 * API CẬP NHẬT TRẠNG THÁI ĐÃ HỌC
 * Endpoint: api/update-learned-word.php
 * Method: POST
 * Body: { "user_id": 1, "word_id": 3, "learned": true }
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Xử lý preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    // Chỉ chấp nhận POST request
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Only POST method is allowed');
    }
    
    // Đọc JSON từ request body
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }
    
    // Validate input
    $user_id = isset($input['user_id']) ? intval($input['user_id']) : 0;
    $word_id = isset($input['word_id']) ? intval($input['word_id']) : 0;
    $learned = isset($input['learned']) ? (bool)$input['learned'] : false;
    
    if ($user_id <= 0 || $word_id <= 0) {
        throw new Exception('Invalid user_id or word_id');
    }
    
    // Kiểm tra xem đã có record chưa
    $checkSql = "SELECT user_id FROM learned_word WHERE user_id = ? AND word_id = ?";
    $statementGetWords = $conn->prepare($checkSql);
    $statementGetWords->bind_param("ii", $user_id, $word_id);
    $statementGetWords->execute();
    $vocabularyResult = $statementGetWords->get_result();
    $exists = $vocabularyResult->num_rows > 0;
    $statementGetWords->close();
    
    if ($exists) {
        // Update existing record
        $status = $learned ? 'reviewing' : 'learning';
        $progress = $learned ? 50 : 25; // 50% khi đánh dấu đã học, 25% khi bỏ đánh dấu
        
        $updateSql = "UPDATE learned_word 
                      SET status = ?, 
                          learning_progress = ?,
                          last_reviewed_at = NOW(),
                          review_count = review_count + 1
                      WHERE user_id = ? AND word_id = ?";
        
        $statementGetWords = $conn->prepare($updateSql);
        $statementGetWords->bind_param("siii", $status, $progress, $user_id, $word_id);
        
    } else {
        // Insert new record
        $status = $learned ? 'reviewing' : 'learning';
        $progress = $learned ? 50 : 25;
        
        $insertSql = "INSERT INTO learned_word 
                      (user_id, word_id, status, learning_progress, current_position, review_mode, review_count) 
                      VALUES (?, ?, ?, ?, 0, 'flashcard', 1)";
        
        $statementGetWords = $conn->prepare($insertSql);
        $statementGetWords->bind_param("iisi", $user_id, $word_id, $status, $progress);
    }
    
    if (!$statementGetWords->execute()) {
        throw new Exception('Failed to update database: ' . $statementGetWords->error);
    }
    
    // Trả về kết quả
    echo json_encode([
        'success' => true,
        'message' => 'Word status updated successfully',
        'data' => [
            'user_id' => $user_id,
            'word_id' => $word_id,
            'learned' => $learned,
            'status' => $status,
            'progress' => $progress
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} finally {
    if (isset($statementGetWords)) $statementGetWords->close();
    if (isset($conn)) $conn->close();
}
?>