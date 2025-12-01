<?php
// FILE: api/admin/user_update_status.php

// BẮT ĐẦU OUTPUT BUFFERING (Chống lỗi JSON)
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0); // Tắt lỗi hiển thị
header('Content-Type: application/json; charset=utf-8');

// 1. Nạp file kết nối và file Log
require_once __DIR__ . '/../../config/database.php';

// Kiểm tra và nạp file log
$logPath = __DIR__ . '/../../includes/log_helper.php';
if (file_exists($logPath)) {
    require_once $logPath;
}

try {
    if (!$conn) throw new Exception("Mất kết nối Database.");

    $input = json_decode(file_get_contents("php://input"), true);
    $admin_id = 2; // ID Admin cố định (như đã thống nhất)

    if (isset($input['user_id']) && isset($input['status'])) {
        $userId = (int)$input['user_id'];
        $currentStatusStr = $input['status']; // 'active' hoặc 'locked'

        // Logic đảo ngược trạng thái: 
        // Nếu đang active (1) -> Muốn khóa -> Thành 0
        // Nếu đang locked (0) -> Muốn mở -> Thành 1
        // (Dựa theo logic trong user_get_list: status == 1 là active)
        $newStatusInt = ($currentStatusStr === 'active') ? 0 : 1; 
        
        $stmt = $conn->prepare("UPDATE user SET status = ? WHERE user_id = ?");
        $stmt->bind_param("ii", $newStatusInt, $userId);
        
        if ($stmt->execute()) {
            
            // --- GHI LOG ---
            if (function_exists('writeAdminLog')) {
                // Xác định tên hành động cho rõ ràng
                $actionName = ($newStatusInt === 0) ? "Khóa tài khoản" : "Mở khóa tài khoản";
                
                // Lấy thêm tên người bị khóa để log đẹp hơn (tùy chọn)
                $userName = "ID " . $userId;
                $uCheck = $conn->query("SELECT name FROM user WHERE user_id = $userId");
                if($uCheck && $row = $uCheck->fetch_assoc()) $userName = $row['name'];

                writeAdminLog($conn, $admin_id, "$actionName: $userName", $userId);
            }
            // ---------------

            ob_clean();
            echo json_encode(['status' => 'success', 'message' => 'Cập nhật thành công!']);
        } else {
            throw new Exception("Lỗi SQL: " . $stmt->error);
        }
    } else {
        throw new Exception("Thiếu dữ liệu user_id hoặc status.");
    }

} catch (Exception $e) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
ob_end_flush();
?>