<?php
// FILE: api/admin/course_create.php
ob_start();
session_start(); // Quan trọng: Phải start session để lấy user_id từ đăng nhập
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

require_once '../../config/database.php';

// Nạp file log helper nếu có
if (file_exists('../../includes/log_helper.php')) {
    require_once '../../includes/log_helper.php';
}

try {
    if (!$conn) throw new Exception("Mất kết nối Database.");

    // Lấy dữ liệu JSON từ client
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Lấy ID Admin từ session (nếu không có thì mặc định là 1 hoặc báo lỗi)
    $admin_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 1; 

    $codePrefix = "ENG"; // Tiền tố mã

    $name = isset($input['name']) ? trim($input['name']) : '';
    $desc = isset($input['description']) ? trim($input['description']) : '';
    $visibility = (isset($input['status']) && $input['status'] === 'active') ? 'public' : 'private';
    
    // Xử lý Tag input
    $tagsInput = isset($input['tags']) ? $input['tags'] : [];
    $tags = is_string($tagsInput) ? explode(',', $tagsInput) : $tagsInput;

    if (empty($name)) throw new Exception('Tên khóa học không được để trống.');

    // Kiểm tra trùng tên khóa học
    $chk = $conn->prepare("SELECT course_id FROM course WHERE course_name = ?");
    $chk->bind_param("s", $name);
    $chk->execute();
    if ($chk->get_result()->num_rows > 0) throw new Exception("Tên khóa học '$name' đã tồn tại!");

    // --- BẮT ĐẦU TRANSACTION ---
    $conn->begin_transaction();

    // 1. Insert bảng Course (Tạm thời chưa có mã course_code, dùng ID để sinh sau)
    $sqlInsert = "INSERT INTO course (course_name, description, visibility, create_by, created_at, hide) VALUES (?, ?, ?, ?, NOW(), 0)";
    $stmt = $conn->prepare($sqlInsert);
    $stmt->bind_param("sssi", $name, $desc, $visibility, $admin_id);
    
    if (!$stmt->execute()) throw new Exception("Lỗi Database: " . $stmt->error);
    
    // Lấy ID vừa tạo (QUAN TRỌNG)
    $new_course_id = $conn->insert_id;

    // 2. Cập nhật Mã khóa học tự động (Ví dụ: ENG001, ENG012)
    $autoCode = $codePrefix . str_pad($new_course_id, 3, '0', STR_PAD_LEFT);
    
    $sqlUpdate = $conn->prepare("UPDATE course SET course_code = ? WHERE course_id = ?");
    $sqlUpdate->bind_param("si", $autoCode, $new_course_id);
    
    if (!$sqlUpdate->execute()) throw new Exception("Lỗi sinh mã: " . $sqlUpdate->error);

    // 3. Xử lý Tags (Thêm tag mới và liên kết vào khóa học)
    if (!empty($tags)) {
        $tags = array_unique(array_filter(array_map('trim', $tags)));
        
        // Chuẩn bị statement
        $stmtChkTag = $conn->prepare("SELECT tag_id FROM tag WHERE tag_name = ?");
        $stmtInsTag = $conn->prepare("INSERT INTO tag (tag_name) VALUES (?)");
        $stmtLink   = $conn->prepare("INSERT IGNORE INTO course_tag (course_id, tag_id) VALUES (?, ?)");

        foreach ($tags as $t) {
            if(!$t) continue;
            $tid = 0;
            
            // Kiểm tra tag tồn tại chưa
            $stmtChkTag->bind_param("s", $t); 
            $stmtChkTag->execute();
            $resTag = $stmtChkTag->get_result();
            
            if ($rowTag = $resTag->fetch_assoc()) {
                $tid = $rowTag['tag_id'];
            } else {
                // Nếu chưa có, thêm mới tag
                $stmtInsTag->bind_param("s", $t);
                if($stmtInsTag->execute()) $tid = $stmtInsTag->insert_id;
            }
            
            // Liên kết Course - Tag
            if ($tid) {
                $stmtLink->bind_param("ii", $new_course_id, $tid);
                $stmtLink->execute();
            }
        }
    }

    // 4. Ghi Lịch sử thao tác (LOGGING)
    // Kiểm tra xem hàm writeAdminLog có tồn tại trong log_helper.php không
    if (function_exists('writeAdminLog')) {
        writeAdminLog($conn, $admin_id, "Thêm khóa học mới: $name ($autoCode)", "ID: $new_course_id");
    } else {
        // Fallback: Nếu không có hàm log helper, bạn có thể tự insert vào bảng log ở đây nếu muốn
        // Ví dụ: $conn->query("INSERT INTO admin_logs ...");
    }

    // Hoàn tất Transaction
    $conn->commit();

    // 5. TRẢ VỀ KẾT QUẢ CHO JAVASCRIPT
    ob_clean();
    echo json_encode([
        'status' => 'success',
        'message' => 'Thêm thành công! Mã: ' . $autoCode,
        'data' => [
            'id' => $new_course_id, // Dòng này giúp JS chuyển trang được
            'code' => $autoCode
        ]
    ]);

} catch (Exception $e) {
    if (isset($conn)) $conn->rollback();
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>