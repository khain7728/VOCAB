<?php
// Tắt lỗi HTML, chỉ trả JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Hàm bắt lỗi Fatal
function fatalErrorHandler() {
    $error = error_get_last();
    if ($error !== NULL && $error['type'] === E_ERROR) {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'Lỗi PHP: ' . $error['message']]);
        exit;
    }
}
register_shutdown_function('fatalErrorHandler');

header('Content-Type: application/json; charset=utf-8');

try {
    // 1. Kết nối Database
    $config_path = dirname(__DIR__, 2) . '/config/database.php';
    if (!file_exists($config_path)) {
        $config_path = $_SERVER['DOCUMENT_ROOT'] . '/VOCAB/config/database.php';
    }
    
    if (!file_exists($config_path)) throw new Exception("Không tìm thấy file config.");
    require_once $config_path;
    
    if (!isset($conn)) throw new Exception("Lỗi kết nối CSDL.");
    $conn->set_charset("utf8mb4");

    // 2. Nhận tham số
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = ($page - 1) * $limit;
    
    // Nhận từ khóa tìm kiếm
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';

    // 3. XÂY DỰNG QUERY TÌM KIẾM THÔNG MINH
    $where = " WHERE 1=1 ";
    
    if (!empty($search)) {
        $s = $conn->real_escape_string($search);
        
        // [QUAN TRỌNG] Logic tìm kiếm:
        // LIKE '%$s%' nghĩa là: Tìm bất kỳ dòng nào CÓ CHỨA ký tự nhập vào
        // Ví dụ nhập "t" -> Tìm thấy "Thêm", "Tạo", "Cập nhật"...
        $where .= " AND (
            action LIKE '%$s%' OR 
            admin_id LIKE '%$s%' OR 
            target_id LIKE '%$s%'
        ) ";
    }
    
    // Lọc ngày
    if (!empty($_GET['start_date'])) {
        $d = $conn->real_escape_string($_GET['start_date']);
        $where .= " AND DATE(created_at) >= '$d' ";
    }
    if (!empty($_GET['end_date'])) {
        $d = $conn->real_escape_string($_GET['end_date']);
        $where .= " AND DATE(created_at) <= '$d' ";
    }

    // Đếm tổng (Dùng bảng admin_log)
    $count_res = $conn->query("SELECT COUNT(*) as total FROM admin_log $where");
    if (!$count_res) throw new Exception("Lỗi SQL: " . $conn->error);
    $total_records = $count_res->fetch_assoc()['total'];
    $total_pages = ceil($total_records / $limit);

    // Lấy dữ liệu
    $sql = "SELECT log_id as id, admin_id, action, target_id, created_at FROM admin_log $where ORDER BY created_at DESC LIMIT $offset, $limit";
    $result = $conn->query($sql);
    
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = [
            'id' => $row['id'],
            'admin_id' => $row['admin_id'],
            'action' => $row['action'],
            'target_id' => $row['target_id'],
            'created_at' => $row['created_at'],
            // Giả lập các cột thiếu để JS không lỗi
            'ip_address' => null,
            'user_agent' => null,
            'admin_name' => null 
        ];
    }

    echo json_encode([
        'status' => 'success',
        'data' => $data,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $total_pages,
            'total_records' => $total_records
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>