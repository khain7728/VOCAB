<?php
/**
 * API LẤY THÔNG TIN HỒ SƠ USER
 * Endpoint: api/get-user-profile.php?user_id=1
 * * Lấy dữ liệu trực tiếp từ bảng `user` và `statistic`
 */

// Tắt báo lỗi HTML để tránh hỏng JSON
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

try {
    // Kiểm tra kết nối
    if (!isset($conn)) {
        throw new Exception("Lỗi kết nối database");
    }

    // Lấy ID từ URL (mặc định 1)
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 1;

    if ($user_id <= 0) {
        throw new Exception('User ID không hợp lệ');
    }

    // ---------------------------------------------------------
    // 1. LẤY THÔNG TIN USER (Bảng `user`)
    // ---------------------------------------------------------
    $sqlUser = "SELECT user_id, name, email, bio, avatar, created_at 
                FROM user WHERE user_id = ?";
    
    $stmtUser = $conn->prepare($sqlUser);
    $stmtUser->bind_param("i", $user_id);
    $stmtUser->execute();
    $resultUser = $stmtUser->get_result();
    $userInfo = $resultUser->fetch_assoc();

    if (!$userInfo) {
        throw new Exception('Không tìm thấy người dùng');
    }

    // ---------------------------------------------------------
    // 2. LẤY THỐNG KÊ (Trực tiếp từ bảng `statistic`)
    // ---------------------------------------------------------
    $sqlStats = "SELECT total_courses, total_words_learned, total_quizzes_done, accuracy_rate, streak_days 
                 FROM statistic WHERE user_id = ?";
    
    $stmtStats = $conn->prepare($sqlStats);
    $stmtStats->bind_param("i", $user_id);
    $stmtStats->execute();
    $resultStats = $stmtStats->get_result();
    $statsInfo = $resultStats->fetch_assoc();

    // Nếu chưa có record trong bảng statistic, gán mặc định bằng 0
    if (!$statsInfo) {
        $statsInfo = [
            'total_courses' => 0,
            'total_words_learned' => 0,
            'total_quizzes_done' => 0,
            'accuracy_rate' => 0,
            'streak_days' => 0
        ];
    }

    // ---------------------------------------------------------
    // 3. TRẢ VỀ JSON
    // ---------------------------------------------------------
    echo json_encode([
        'success' => true,
        'data' => [
            'user' => [
                'id' => $userInfo['user_id'],
                'fullname' => $userInfo['name'], // Mapping: cột name -> fullname
                'email' => $userInfo['email'],
                'bio' => $userInfo['bio'] ?? 'Chưa cập nhật tiểu sử',
                'avatar' => $userInfo['avatar'],
                'joined_date' => date('d/m/Y', strtotime($userInfo['created_at'])),
                'language' => 'Tiếng Anh', 
                'level' => 'Trung cấp'     
            ],
            'statistics' => [
                'courses_joined' => (int)$statsInfo['total_courses'],
                'words_learned' => (int)$statsInfo['total_words_learned'],
                'streak_days' => (int)$statsInfo['streak_days'],
                'accuracy' => (float)$statsInfo['accuracy_rate'],
                'quizzes_done' => (int)$statsInfo['total_quizzes_done']
            ]
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} finally {
    if (isset($conn)) $conn->close();
}
?>