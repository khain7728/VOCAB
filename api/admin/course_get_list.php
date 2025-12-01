<?php
// BẮT ĐẦU: Bật bộ đệm đầu ra (Hứng mọi thứ in ra màn hình)
ob_start();

// Cấu hình Header
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

// Tắt báo lỗi PHP in ra màn hình (Tránh làm hỏng JSON)
ini_set('display_errors', 0);
error_reporting(0);

try {
    // 1. KẾT NỐI DATABASE
    // Dùng đường dẫn tương đối để tránh lỗi sai đường dẫn tuyệt đối trên máy bạn
    require_once '../../config/database.php';

    // Kiểm tra kết nối
    if (!isset($conn) || !$conn) {
        throw new Exception("Biến kết nối \$conn không tồn tại hoặc null.");
    }
    if ($conn->connect_error) {
        throw new Exception("Lỗi kết nối MySQL: " . $conn->connect_error);
    }

    // 2. TRUY VẤN DỮ LIỆU
    // Sửa 'username' thành 'name' cho đúng với database của bạn
    $sql = "SELECT c.course_id, c.course_name, c.description, c.visibility, 
                   u.name as author_name 
            FROM course c 
            LEFT JOIN user u ON c.create_by = u.user_id 
            ORDER BY c.course_id DESC";

    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Lỗi SQL: " . $conn->error);
    }

    $data = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            
            // Xử lý Tags (nếu lỗi ở phần này thì bỏ qua để vẫn hiện khóa học)
            $tags = [];
            $courseId = $row['course_id'];
            
            // Query lấy tag riêng biệt
            $tagSql = "SELECT t.tag_name FROM tag t 
                       JOIN course_tag ct ON t.tag_id = ct.tag_id 
                       WHERE ct.course_id = " . intval($courseId);
            
            $tagRes = $conn->query($tagSql);
            if ($tagRes) {
                while($t = $tagRes->fetch_assoc()) {
                    $tags[] = $t['tag_name'];
                }
            }

            $data[] = [
                'id' => $row['course_id'],
                'name' => $row['course_name'],
                'description' => $row['description'],
                'author' => $row['author_name'] ? $row['author_name'] : 'Admin',
                'status' => $row['visibility'],
                'tags' => $tags
            ];
        }
    }

    // --- QUAN TRỌNG NHẤT: XÓA SẠCH BỘ ĐỆM TRƯỚC KHI IN JSON ---
    ob_clean(); 
    
    echo json_encode(['status' => 'success', 'data' => $data]);

} catch (Exception $e) {
    // Nếu có lỗi, cũng xóa sạch bộ đệm rồi mới in lỗi
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

// Dừng luồng chạy ngay lập tức để không có ký tự nào lọt vào sau đó
exit();
?>