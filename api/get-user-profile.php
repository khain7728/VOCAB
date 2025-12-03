<?php
/**
 * API LẤY THÔNG TIN HỒ SƠ USER (Full Update)
 */
ob_start();
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once '../config/config.php';

$response = [];

try {
    if (!isset($conn)) throw new Exception("Lỗi kết nối Database");

    $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
    if ($user_id <= 0) throw new Exception("User ID không hợp lệ");

    // A. LẤY INFO
    $sqlUser = "SELECT user_id, name, email, bio, avatar, created_at, role 
                FROM user WHERE user_id = ?";
    $stmtUser = $conn->prepare($sqlUser);
    $stmtUser->bind_param("i", $user_id);
    $stmtUser->execute();
    $userInfo = $stmtUser->get_result()->fetch_assoc();

    if (!$userInfo) throw new Exception('User không tồn tại');

    // B. LẤY THỐNG KÊ (Statistic + Count Realtime)
    $sqlStats = "SELECT total_courses, total_words_learned, total_quizzes_done, accuracy_rate, streak_days 
                 FROM statistic WHERE user_id = ?";
    $stmtStats = $conn->prepare($sqlStats);
    $stmtStats->bind_param("i", $user_id);
    $stmtStats->execute();
    $statsInfo = $stmtStats->get_result()->fetch_assoc();

    if (!$statsInfo) {
        $statsInfo = [
            'total_courses' => 0, 'total_words_learned' => 0, 
            'total_quizzes_done' => 0, 'accuracy_rate' => 0, 'streak_days' => 0
        ];
    }

    // Recount Courses
    $sqlCountCourse = "SELECT COUNT(*) as cnt FROM user_course WHERE user_id = ?";
    $stmtCount = $conn->prepare($sqlCountCourse);
    $stmtCount->bind_param("i", $user_id);
    $stmtCount->execute();
    $statsInfo['total_courses'] = $stmtCount->get_result()->fetch_assoc()['cnt'];

    // Recount Words (Logic mới: status != not_learned)
    $sqlCountWords = "SELECT COUNT(*) as cnt FROM learned_word 
                      WHERE user_id = ? AND status != 'not_learned'";
    $stmtWord = $conn->prepare($sqlCountWords);
    $stmtWord->bind_param("i", $user_id);
    $stmtWord->execute();
    $statsInfo['total_words_learned'] = $stmtWord->get_result()->fetch_assoc()['cnt'];

    // C. RESPONSE
    $response = [
        'success' => true,
        'data' => [
            'user' => [
                'id' => $userInfo['user_id'],
                'fullname' => $userInfo['name'],
                'email' => $userInfo['email'],
                'bio' => $userInfo['bio'] ?? 'Chưa cập nhật tiểu sử',
                'avatar' => $userInfo['avatar'] ?? '',
                'joined_date' => date('d/m/Y', strtotime($userInfo['created_at'])),
                'role' => $userInfo['role'],
                'language' => 'Tiếng Anh',
                'level' => 'Trung cấp' 
            ],
            'statistics' => [
                'courses_joined' => (int)$statsInfo['total_courses'],
                'words_learned' => (int)$statsInfo['total_words_learned'],
                'quizzes_done' => (int)$statsInfo['total_quizzes_done'],
                'accuracy' => (float)$statsInfo['accuracy_rate'],
                'streak_days' => (int)$statsInfo['streak_days']
            ]
        ]
    ];

} catch (Exception $e) {
    http_response_code(400); 
    $response = ['success' => false, 'error' => $e->getMessage()];
}

ob_clean();
echo json_encode($response);
exit();
?>