<?php
/**
 * API: api/admin/log_export.php
 * Phiên bản: FORCE EXCEL FORMAT
 */

// 1. Xóa sạch bộ nhớ đệm
while (ob_get_level()) ob_end_clean();

// 2. Cài đặt múi giờ
date_default_timezone_set('Asia/Ho_Chi_Minh');

// 3. Kết nối Database
$config_path = dirname(__DIR__, 2) . '/config/database.php';
if (!file_exists($config_path)) {
    $config_path = $_SERVER['DOCUMENT_ROOT'] . '/VOCAB/config/database.php';
}

if (file_exists($config_path)) {
    require_once $config_path;
} else {
    die("Lỗi config.");
}

if (!isset($conn)) die("Lỗi kết nối.");
$conn->set_charset("utf8mb4");

// 4. Thiết lập Header
$filename = "Lich_su_" . date('Y-m-d_H-i-s') . ".csv"; // Thêm giây vào tên file để tránh trùng cache
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Pragma: no-cache');
header('Expires: 0');

$output = fopen('php://output', 'w');
// Thêm BOM để hiện Tiếng Việt
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

// Tiêu đề
fputcsv($output, ['ID Log', 'Admin ID', 'Hành động', 'Đối tượng', 'Thời gian']);

// 5. Xử lý lọc
$where = " WHERE 1=1 ";
if (!empty($_GET['search'])) {
    $s = $conn->real_escape_string(trim($_GET['search']));
    $where .= " AND (action LIKE '%$s%' OR admin_id LIKE '%$s%' OR target_id LIKE '%$s%') ";
}
if (!empty($_GET['start_date'])) {
    $where .= " AND DATE(created_at) >= '" . $conn->real_escape_string($_GET['start_date']) . "' ";
}
if (!empty($_GET['end_date'])) {
    $where .= " AND DATE(created_at) <= '" . $conn->real_escape_string($_GET['end_date']) . "' ";
}

$sql = "SELECT log_id, admin_id, action, target_id, created_at FROM admin_log $where ORDER BY created_at DESC";
$result = $conn->query($sql);

if ($result) {
    while ($row = $result->fetch_assoc()) {
        
        // [CÁCH FIX MỚI]
        // Cách 1: Chuẩn Quốc Tế (Excel thích nhất cái này)
        $cleanDate = date('Y-m-d H:i:s', strtotime($row['created_at']));
        
        // Cách 2: Nếu Cách 1 vẫn lỗi, hãy dùng dòng dưới đây (Bỏ comment):
        // $cleanDate = "\t" . date('d/m/Y H:i:s', strtotime($row['created_at'])); 
        // (Dấu \t giúp ép kiểu Text, nhưng sẽ khó sort hơn)

        $row['created_at'] = $cleanDate;
        
        fputcsv($output, $row);
    }
}

fclose($output);
exit();
?>