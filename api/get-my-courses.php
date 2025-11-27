<?php
// api/get-my-courses.php
// --- BẮT ĐẦU: CẤU HÌNH CORS CHUẨN ---
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
// --- KẾT THÚC: CẤU HÌNH CORS CHUẨN ---
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');
require_once '../config/database.php';

try {
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 1;

    // CẬP NHẬT: Dùng bảng user_course
    $sql = "SELECT 
                c.course_id, c.course_name, c.description, c.create_by, c.visibility,
                u.name as creator_name,
                uc.progress, uc.status as enroll_status,
                (SELECT COUNT(*) FROM word w WHERE w.course_id = c.course_id) as word_count,
                (SELECT COUNT(*) FROM user_course uc_count WHERE uc_count.course_id = c.course_id) as student_count
            FROM course c
            LEFT JOIN user_course uc ON c.course_id = uc.course_id AND uc.user_id = ?
            LEFT JOIN user u ON c.create_by = u.user_id
            WHERE c.create_by = ? OR uc.user_id = ?
            ORDER BY c.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iii", $user_id, $user_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $courses = [];
    while ($row = $result->fetch_assoc()) {
        // Lấy Tags (giữ nguyên)
        $tags = [];
        try {
            $tagStmt = $conn->prepare("SELECT t.tag_name FROM tag t JOIN course_tag ct ON t.tag_id = ct.tag_id WHERE ct.course_id = ?");
            $tagStmt->bind_param("i", $row['course_id']);
            $tagStmt->execute();
            $tagRes = $tagStmt->get_result();
            while ($t = $tagRes->fetch_assoc()) $tags[] = $t['tag_name'];
        } catch (Exception $ex) {}

        $isOwner = ($row['create_by'] == $user_id);
        $trangThai = 'Chưa học';
        $progress = isset($row['progress']) ? (int)$row['progress'] : 0;
        $enrollStatus = $row['enroll_status'] ?? '';

        if ($enrollStatus === 'completed' || $progress === 100) $trangThai = 'Hoàn thành';
        else if ($progress > 0 || $enrollStatus === 'active') $trangThai = 'Đang học';
        
        $courses[] = [
            'id' => $row['course_id'],
            'tieuDe' => $row['course_name'],
            'mota' => $row['description'] ?? 'Chưa có mô tả',
            'nguoiTao' => $isOwner ? 'Bạn' : ($row['creator_name'] ?? 'Unknown'),
            'soTu' => (int)$row['word_count'],
            'hocVien' => (int)$row['student_count'],
            'trangThaiChiaSe' => ($row['visibility'] === 'public') ? 'Công khai' : 'Riêng tư',
            'trangThai' => $trangThai,
            'tienDo' => $progress,
            'tags' => $tags,
            'isOwner' => $isOwner
        ];
    }
    echo json_encode(['success' => true, 'data' => $courses]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>