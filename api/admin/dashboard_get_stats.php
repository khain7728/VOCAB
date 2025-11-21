<?php
// Tắt báo lỗi để tránh hỏng JSON
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');

try {
    // 1. Kết nối Database (Đường dẫn tuyệt đối)
    $rootPath = dirname(__DIR__);
    require_once $rootPath .  '/../../config/database.php';

    $response = [];

    // --- A. THỐNG KÊ SỐ LƯỢNG ---
    
    // Tổng người dùng
    $res = $conn->query("SELECT COUNT(*) as total FROM user WHERE role = 'user'");
    $response['total_users'] = $res ? $res->fetch_assoc()['total'] : 0;

    // Tổng khóa học
    $res = $conn->query("SELECT COUNT(*) as total FROM course");
    $response['total_courses'] = $res ? $res->fetch_assoc()['total'] : 0;

    // Hoạt động hôm nay (Lưu ý: Dữ liệu mẫu của bạn là năm 2025, nếu máy bạn đang 2024 thì số này sẽ là 0)
    $res = $conn->query("SELECT COUNT(*) as total FROM admin_log WHERE DATE(created_at) = CURDATE()");
    $response['today_activity'] = $res ? $res->fetch_assoc()['total'] : 0;


    // --- B. HOẠT ĐỘNG GẦN ĐÂY ---
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


    // --- C. KHÓA HỌC PHỔ BIẾN (Theo số lượng học viên đăng ký) ---
    // Dùng bảng user_course để đếm
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


    // --- D. NGƯỜI DÙNG MỚI THEO THÁNG ---
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
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
$conn->close();
?>