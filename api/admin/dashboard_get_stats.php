<?php
// FILE: api/admin/dashboard_get_stats.php
// Bật báo lỗi để debug
ini_set('display_errors', 0); // Tắt khi chạy thật
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

try {
    // 1. KẾT NỐI DATABASE
    require_once __DIR__ . '/../../config/database.php';
    if (!$conn) throw new Exception("Lỗi kết nối CSDL.");

    $response = [];

    // --- A. THỐNG KÊ SỐ LƯỢNG TỔNG ---
    $res = $conn->query("SELECT COUNT(*) as total FROM user WHERE role = 'user'");
    $response['total_users'] = $res ? $res->fetch_assoc()['total'] : 0;

    $res = $conn->query("SELECT COUNT(*) as total FROM course");
    $response['total_courses'] = $res ? $res->fetch_assoc()['total'] : 0;

    // Đếm log hôm nay
    $res = $conn->query("SELECT COUNT(*) as total FROM admin_log WHERE DATE(created_at) = CURDATE()");
    $response['today_activity'] = $res ? $res->fetch_assoc()['total'] : 0;

    // --- B. HOẠT ĐỘNG GẦN ĐÂY (Sửa lại admin_id thành user_id cho đúng bảng log) ---
$logs = [];
    $sqlLog = "SELECT l.action, l.created_at, u.name as admin_name 
               FROM admin_log l 
               LEFT JOIN user u ON l.admin_id = u.user_id  -- SỬA Ở ĐÂY: l.admin_id
               ORDER BY l.created_at DESC LIMIT 6";
    
    $resLog = $conn->query($sqlLog);
    // Kiểm tra lỗi SQL nếu có
    if (!$resLog) {
        // Log lỗi vào file error_log của server nếu cần
    } else {
        while ($row = $resLog->fetch_assoc()) $logs[] = $row;
    }
    $response['recent_activities'] = $logs;

    // --- C. KHÓA HỌC PHỔ BIẾN (Dựa trên lượt tham gia thực tế) ---
    // Đếm số lượng user_id trong bảng user_course (bảng đăng ký học)
    $topCourses = [];
    $sqlTop = "SELECT c.course_name, COUNT(uc.user_id) as learning_count 
               FROM course c 
               LEFT JOIN user_course uc ON c.course_id = uc.course_id 
               GROUP BY c.course_id 
               ORDER BY learning_count DESC LIMIT 5";
    $resTop = $conn->query($sqlTop);
    if ($resTop) while ($row = $resTop->fetch_assoc()) $topCourses[] = $row;
    $response['popular_courses'] = $topCourses;

    // --- D. BIỂU ĐỒ NGƯỜI DÙNG THEO THÁNG ---
    $chartData = [];
    // Nhóm theo Tháng/Năm (VD: 12/2023)
    $sqlChart = "SELECT DATE_FORMAT(created_at, '%m/%Y') as month_year, COUNT(*) as count 
                 FROM user 
                 WHERE role = 'user' 
                 GROUP BY month_year 
                 ORDER BY created_at DESC LIMIT 6"; // Lấy 6 tháng gần nhất
    $resChart = $conn->query($sqlChart);
    if ($resChart) while ($row = $resChart->fetch_assoc()) $chartData[] = $row;
    
    // Đảo ngược mảng để tháng cũ bên trái, tháng mới bên phải
    $response['user_chart'] = array_reverse($chartData);

    echo json_encode(['status' => 'success', 'data' => $response]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

if (isset($conn)) $conn->close();
?>