<?php
// FILE: api/admin/course_get_list.php
error_reporting(E_ALL);
ini_set('display_errors', 0); // Tắt lỗi HTML
ob_start(); // Bắt đầu buffer

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

require_once '../../config/config.php';
require_once '../../includes/auth_check.php'; 

try {
    // --- AUTHENTICATION (JSON STYLE) ---
    if (session_status() === PHP_SESSION_NONE) session_start();

    // Dùng hàm từ auth_check.php của bạn nhưng tự xử lý lỗi
    if (!check_session_timeout() || !validate_session_security()) {
        throw new Exception("Phiên làm việc hết hạn. Vui lòng F5.");
    }
    if (!isset($_SESSION['user_id']) || (isset($_SESSION['role']) && $_SESSION['role'] !== 'admin')) {
        throw new Exception("Không có quyền truy cập.");
    }

    if (!$conn) throw new Exception("Mất kết nối Database.");

    // --- PARAMETERS ---
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $status = isset($_GET['status']) ? trim($_GET['status']) : '';
    $sort_by = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'created_at';
    $order = isset($_GET['order']) && strtoupper($_GET['order']) === 'ASC' ? 'ASC' : 'DESC';

    // Whitelist sort column
    $allowed_sort = ['course_code', 'course_name', 'created_at', 'visibility'];
    if (!in_array($sort_by, $allowed_sort)) $sort_by = 'created_at';

    $offset = ($page - 1) * $limit;

    // --- QUERY BUILDER ---
    $where = "WHERE 1=1";
    $params = [];
    $types = "";

    if (!empty($search)) {
        $where .= " AND (c.course_name LIKE ? OR c.course_code LIKE ?)";
        $term = "%$search%";
        $params[] = $term; $params[] = $term;
        $types .= "ss";
    }

    if (!empty($status)) {
        // Map status front-end (active/hidden) -> DB (public/private)
        $dbStatus = ($status === 'active') ? 'public' : (($status === 'hidden') ? 'private' : $status);
        $where .= " AND c.visibility = ?";
        $params[] = $dbStatus;
        $types .= "s";
    }

    // COUNT
    $sqlCount = "SELECT COUNT(*) as total FROM course c $where";
    $stmtCount = $conn->prepare($sqlCount);
    if (!empty($params)) $stmtCount->bind_param($types, ...$params);
    $stmtCount->execute();
    $totalRecords = $stmtCount->get_result()->fetch_assoc()['total'];
    $totalPages = ceil($totalRecords / $limit);

    // SELECT DATA
    $sqlData = "SELECT 
                    c.course_id, c.course_code, c.course_name, c.visibility, c.created_at, c.description,
                    IFNULL(u.name, 'Admin') as author_name,
                    GROUP_CONCAT(t.tag_name SEPARATOR ', ') as tags
                FROM course c
                LEFT JOIN user u ON c.create_by = u.user_id
                LEFT JOIN course_tag ct ON c.course_id = ct.course_id
                LEFT JOIN tag t ON ct.tag_id = t.tag_id
                $where
                GROUP BY c.course_id
                ORDER BY c.$sort_by $order
                LIMIT ?, ?";
    
    $params[] = $offset; $params[] = $limit;
    $types .= "ii";

    $stmt = $conn->prepare($sqlData);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);

    ob_clean(); // Xóa buffer rác
    echo json_encode([
        'status' => 'success',
        'data' => $data,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $totalPages,
            'total_records' => $totalRecords
        ]
    ]);

} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>