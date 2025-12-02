<?php
/**
 * API LẤY CHI TIẾT KHÓA HỌC
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

ob_start();
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');
require_once '../config/config.php';

$response = [];

try {
    if (!isset($conn)) throw new Exception("Lỗi kết nối Database");

    $course_id = isset($_GET['course_id']) ? intval($_GET['course_id']) : 0;
    // BẢO MẬT: Lấy user_id từ session
    $user_id = api_verify_user_id($_GET['user_id'] ?? null);

    if ($course_id <= 0) throw new Exception('ID khóa học không hợp lệ');

    // --- PHẦN 1: LẤY THÔNG TIN KHÓA HỌC ---
    $sqlCourse = "SELECT 
                    c.course_id, c.course_name, c.description, c.create_by, c.created_at,
                    u.name as creator_name,
                    uc.status as enroll_status,
                    uc.progress as user_progress,
                    (SELECT COUNT(*) FROM word w WHERE w.course_id = c.course_id) as total_words
                  FROM course c
                  LEFT JOIN user u ON c.create_by = u.user_id
                  LEFT JOIN user_course uc ON c.course_id = uc.course_id AND uc.user_id = ?
                  WHERE c.course_id = ?";

    $stmt = $conn->prepare($sqlCourse);
    $stmt->bind_param("ii", $user_id, $course_id);
    $stmt->execute();
    $courseInfo = $stmt->get_result()->fetch_assoc();

    if (!$courseInfo) throw new Exception('Khóa học không tồn tại');

    $isOwner = ($courseInfo['create_by'] == $user_id);
    $isJoined = !empty($courseInfo['enroll_status']);
    
    // Nếu chưa tham gia, progress = 0
    $progress = isset($courseInfo['user_progress']) ? (int)$courseInfo['user_progress'] : 0;

    // --- PHẦN 2: LẤY DANH SÁCH TỪ VỰNG ---
    $sqlWords = "SELECT word_id, word_en, word_vi, definition, pronunciation, audio_file, part_of_speech 
                 FROM word 
                 WHERE course_id = ? 
                 ORDER BY word_id ASC";
    
    $stmtWord = $conn->prepare($sqlWords);
    $stmtWord->bind_param("i", $course_id);
    $stmtWord->execute();
    $resWords = $stmtWord->get_result();

    $words = [];
    while ($row = $resWords->fetch_assoc()) {
        $words[] = [
            'word_id' => $row['word_id'],
            'word_en' => $row['word_en'],
            'word_vi' => $row['word_vi'],
            'definition' => $row['definition'] ?? '',
            'pronunciation' => $row['pronunciation'] ?? '',
            'audio_file' => $row['audio_file'] ?? '',
            'part_of_speech' => $row['part_of_speech'] ?? ''
        ];
    }

    $response = [
        'success' => true,
        'data' => [
            'info' => [
                'id' => $courseInfo['course_id'],
                'tieuDe' => $courseInfo['course_name'],
                'mota' => $courseInfo['description'] ?? 'Không có mô tả',
                'nguoiTao' => $isOwner ? 'Bạn' : ($courseInfo['creator_name'] ?? 'Unknown'),
                'soTu' => (int)$courseInfo['total_words'],
                'tienDo' => $progress,
                'trangThai' => $courseInfo['enroll_status'] ?? 'not_joined',
                'isOwner' => $isOwner,
                'isJoined' => $isJoined
            ],
            'words' => $words
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