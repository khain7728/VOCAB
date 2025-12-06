<?php
// FILE: includes/log_helper.php

if (!function_exists('writeAdminLog')) {
    /**
     * Hàm ghi lịch sử hoạt động Admin (Đã nâng cấp IP & Browser)
     * * @param mysqli $conn      Biến kết nối CSDL
     * @param int    $admin_id  ID của admin thực hiện
     * @param string $action    Nội dung hành động
     * @param int    $target_id ID đối tượng bị tác động (Ví dụ: ID user bị khóa)
     * @return bool             True nếu thành công, False nếu thất bại
     */
    function writeAdminLog($conn, $admin_id, $action, $target_id = null) {
        try {
            if (!$conn || $conn->connect_error) return false;

            // 1. Lấy thông tin môi trường
            $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
            $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

            // 2. Chuẩn bị câu lệnh SQL
            // Lưu ý: Cột ip_address và user_agent phải tồn tại trong bảng admin_log
            // Nếu bạn chưa chạy lệnh ALTER TABLE thêm cột, hãy xóa 2 cột này khỏi câu lệnh dưới
            $sql = "INSERT INTO admin_log (admin_id, action, target_id, ip_address, user_agent, created_at) 
                    VALUES (?, ?, ?, ?, ?, NOW())";
            
            $stmt = $conn->prepare($sql);
            if ($stmt) {
                // Bind tham số: 
                // i (int), s (string), i (int), s (string), s (string)
                $stmt->bind_param("isiss", $admin_id, $action, $target_id, $ip, $ua);
                $stmt->execute();
                $stmt->close();
                return true;
            }
        } catch (Exception $e) {
            // Ghi lỗi vào error log của server nếu cần debug
            // error_log("Log Error: " . $e->getMessage());
            return false;
        }
        return false;
    }
}
?>