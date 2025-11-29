<?php
// --- BƯỚC 1: BẬT BÁO LỖI ĐỂ DEUBG (Sau này chạy ngon thì tắt đi) ---
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

$response = [];

try {
    // --- BƯỚC 2: SỬA ĐƯỜNG DẪN KẾT NỐI DATABASE ---
    // __DIR__ là: .../VOCAB/api/admin
    // Đi lùi 2 cấp (../../) là về: .../VOCAB/
    // Sau đó vào config/database.php
    $configFile = __DIR__ . '/../../config/database.php';

    if (!file_exists($configFile)) {
        // Nếu không thấy file, in ra đường dẫn đang tìm kiếm để kiểm tra
        throw new Exception("Lỗi đường dẫn: Không tìm thấy file database.php tại: " . realpath(__DIR__ . '/../../') . "/config/");
    }

    require_once $configFile;

    // Kiểm tra kết nối
    if (!isset($conn) || $conn->connect_error) {
        throw new Exception("Lỗi kết nối MySQL: " . ($conn->connect_error ?? "Biến \$conn chưa được khởi tạo"));
    }

    // --- BƯỚC 3: TRUY VẤN DỮ LIỆU ---

    // A. Thống kê số lượng
    // Lưu ý: Kiểm tra kỹ tên bảng 'user' hay 'users' trong database của bạn
    $res = $conn->query("SELECT COUNT(*) as total FROM user WHERE role = 'user'");
    $response['total_users'] = $res ? $res->fetch_assoc()['total'] : 0;

    $res = $conn->query("SELECT COUNT(*) as total FROM course");
    $response['total_courses'] = $res ? $res->fetch_assoc()['total'] : 0;

    $res = $conn->query("SELECT COUNT(*) as total FROM admin_log WHERE DATE(created_at) = CURDATE()");
    $response['today_activity'] = $res ? $res->fetch_assoc()['total'] : 0;

    // B. Hoạt động gần đây
    $logs = [];
    $sqlLog = "SELECT l.action, l.created_at, u.name as admin_name 
               FROM admin_log l 
               LEFT JOIN user u ON l.admin_id = u.user_id 
               ORDER BY l.created_at DESC LIMIT 6";
    $resLog = $conn->query($sqlLog);
    if ($resLog) {
        while ($row = $resLog->fetch_assoc()) $logs[] = $row;
    }
    $response['recent_activities'] = $logs;

    // C. Khóa học phổ biến
    $topCourses = [];
    $sqlTop = "SELECT c.course_name, COUNT(uc.user_id) as student_count 
               FROM course c 
               LEFT JOIN user_course uc ON c.course_id = uc.course_id 
               GROUP BY c.course_id 
               ORDER BY student_count DESC LIMIT 5";
    $resTop = $conn->query($sqlTop);
    if ($resTop) {
        while ($row = $resTop->fetch_assoc()) $topCourses[] = $row;
    }
    $response['popular_courses'] = $topCourses;

    // D. Người dùng mới
    $chartData = [];
    $sqlChart = "SELECT DATE_FORMAT(created_at, '%m/%Y') as month_year, COUNT(*) as count 
                 FROM user 
                 WHERE role = 'user' 
                 GROUP BY month_year 
                 ORDER BY created_at DESC LIMIT 6";
    $resChart = $conn->query($sqlChart);
    if ($resChart) {
        while ($row = $resChart->fetch_assoc()) $chartData[] = $row;
    }
    $response['user_chart'] = array_reverse($chartData);

    echo json_encode(['status' => 'success', 'data' => $response]);

} catch (Exception $e) {
    // Trả về JSON báo lỗi
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

if (isset($conn)) $conn->close();
?>