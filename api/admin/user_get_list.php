<?php
session_start();
header('Content-Type: application/json');

// 1. Check quyền Admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Bạn chưa đăng nhập Admin!"]);
    exit();
}

// 2. Kết nối Database
require_once __DIR__ . '/../../config/database.php';

try {
    // Lấy tham số
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = 10;
    $offset = ($page - 1) * $limit;
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    
    // Sort
    $sort_by = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'created_at';
    $order = isset($_GET['order']) && strtoupper($_GET['order']) === 'ASC' ? 'ASC' : 'DESC';

    // Xử lý cột sort: Nếu user sort theo 'fullname' ở frontend cũ thì đổi thành 'name'
    if ($sort_by === 'fullname') $sort_by = 'name';

    $where = "WHERE 1=1";
    $params = [];
    $types = "";

    // --- TÌM KIẾM TẠI ĐÂY ---
    if (!empty($search)) {
        // Tìm trong tên HOẶC email
        $where .= " AND (name LIKE ? OR email LIKE ?)"; 
        
        // --- SỬA TẠI ĐÂY: Bỏ dấu % ở đầu ---
        $params[] = "$search%"; // Chỉ tìm những từ BẮT ĐẦU bằng "us..."
        $params[] = "$search%";
        
        $types .= "ss"; 
    }

    // A. Đếm tổng số bản ghi
    $sqlCount = "SELECT COUNT(*) as total FROM user $where";
    $stmtCount = $conn->prepare($sqlCount);
    if (!empty($params)) $stmtCount->bind_param($types, ...$params);
    $stmtCount->execute();
    $total_records = $stmtCount->get_result()->fetch_assoc()['total'];
    $total_pages = ceil($total_records / $limit);

    // B. Lấy dữ liệu chi tiết
    $sql = "SELECT user_id, name, email, avatar, status, created_at
            FROM user $where 
            ORDER BY $sort_by $order 
            LIMIT ? OFFSET ?";
            
    $stmt = $conn->prepare($sql);
    
    // Thêm tham số limit, offset vào mảng params
    $params[] = $limit;
    $params[] = $offset;
    $types .= "ii";
    
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode([
        'status' => 'success',
        'data' => $data,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $total_pages
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => "Lỗi Server: " . $e->getMessage()]);
}
?>