<?php
// Xóa bộ nhớ đệm đầu ra để tránh file bị lẫn text lạ
ob_end_clean(); 

// Kết nối CSDL
$conn = new mysqli("localhost", "root", "", "ten_database_cua_ban");
$conn->set_charset("utf8");

// Lấy tham số lọc (giống hệt phần log_get_list nhưng KHÔNG CÓ LIMIT)
$search = isset($_GET['search']) ? $_GET['search'] : '';
$where = " WHERE 1=1 ";

if (!empty($search)) {
    $s = $conn->real_escape_string($search);
    $where .= " AND (action LIKE '%$s%' OR admin_id LIKE '%$s%') ";
}
if (!empty($_GET['start_date'])) {
    $where .= " AND DATE(created_at) >= '" . $conn->real_escape_string($_GET['start_date']) . "'";
}
if (!empty($_GET['end_date'])) {
    $where .= " AND DATE(created_at) <= '" . $conn->real_escape_string($_GET['end_date']) . "'";
}

// Query lấy toàn bộ dữ liệu
$sql = "SELECT id, action, target_id, admin_id, ip_address, created_at FROM system_logs $where ORDER BY created_at DESC";
$result = $conn->query($sql);

// --- PHẦN QUAN TRỌNG ĐỂ XUẤT FILE ---

// 1. Thiết lập Header để trình duyệt hiểu đây là file tải về
$filename = "Lich_su_thao_tac_" . date('Y-m-d') . ".csv";
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');

// 2. Mở output stream
$output = fopen('php://output', 'w');

// 3. [QUAN TRỌNG] Thêm BOM để Excel đọc được tiếng Việt không bị lỗi font
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

// 4. Ghi dòng tiêu đề
fputcsv($output, ['ID', 'Hành động', 'ID Đối tượng', 'Admin ID', 'IP Address', 'Thời gian']);

// 5. Ghi dữ liệu
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        fputcsv($output, $row);
    }
}

// 6. Đóng file
fclose($output);
exit();
?>