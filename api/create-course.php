<?php
/**
 * API TẠO KHÓA HỌC MỚI
 * Endpoint: api/create-course.php
 * Method: POST
 */

// 1. Cấu hình Header chuẩn
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once '../config/database.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method Not Allowed');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate dữ liệu
    $user_id = isset($input['user_id']) ? intval($input['user_id']) : 0;
    $course_name = isset($input['course_name']) ? trim($input['course_name']) : '';
    $description = isset($input['description']) ? trim($input['description']) : '';
    $visibility = isset($input['visibility']) ? $input['visibility'] : 'public';
    $tags = isset($input['tags']) ? $input['tags'] : []; 

    if ($user_id <= 0 || empty($course_name)) {
        throw new Exception('Tên khóa học không được để trống');
    }

    // Bắt đầu Transaction
    $conn->begin_transaction();

    // 2. Insert Khóa học
    // Lưu ý: Đảm bảo bảng course đã có AUTO_INCREMENT
    $sql = "INSERT INTO course (course_name, description, visibility, create_by, created_at, hide) VALUES (?, ?, ?, ?, NOW(), 0)";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) throw new Exception("Lỗi SQL: " . $conn->error);
    
    $stmt->bind_param("sssi", $course_name, $description, $visibility, $user_id);
    
    if (!$stmt->execute()) throw new Exception("Lỗi thực thi: " . $stmt->error);
    
    // --- QUAN TRỌNG: LẤY ID VỪA TẠO ---
    $new_course_id = $stmt->insert_id;

    if ($new_course_id == 0) {
        throw new Exception("Tạo thành công nhưng ID trả về bằng 0. Hãy kiểm tra AUTO_INCREMENT trong Database.");
    }

    // 3. Xử lý Tags (nếu có)
    if (!empty($tags)) {
        $tags = array_unique(array_filter($tags));
        
        $stmtCheck = $conn->prepare("SELECT tag_id FROM tag WHERE tag_name = ?");
        $stmtInsTag = $conn->prepare("INSERT INTO tag (tag_name) VALUES (?)");
        $stmtLink = $conn->prepare("INSERT IGNORE INTO course_tag (course_id, tag_id) VALUES (?, ?)");

        foreach ($tags as $tagName) {
            $tagName = trim($tagName);
            if (empty($tagName)) continue;

            $tagId = 0;
            // Kiểm tra tag tồn tại
            $stmtCheck->bind_param("s", $tagName);
            $stmtCheck->execute();
            $resTag = $stmtCheck->get_result();
            
            if ($row = $resTag->fetch_assoc()) {
                $tagId = $row['tag_id'];
            } else {
                // Tạo mới nếu chưa có
                $stmtInsTag->bind_param("s", $tagName);
                if ($stmtInsTag->execute()) {
                    $tagId = $stmtInsTag->insert_id;
                }
            }

            // Link vào khóa học
            if ($tagId > 0) {
                $stmtLink->bind_param("ii", $new_course_id, $tagId);
                $stmtLink->execute();
            }
        }
    }

    $conn->commit();

    // 4. Trả về kết quả JSON có chứa course_id
    echo json_encode([
        'success' => true, 
        'message' => 'Tạo khóa học thành công!',
        'course_id' => $new_course_id // Đây là biến quan trọng nhất
    ]);

} catch (Exception $e) {
    if (isset($conn)) $conn->rollback();
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
    if (isset($conn)) $conn->close();
}
?>