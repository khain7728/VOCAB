<?php
// FILE: includes/log_helper.php

if (!function_exists('writeAdminLog')) {
    // Lưu ý: Đổi tham số đầu tiên thành $admin_id cho rõ nghĩa
    function writeAdminLog($conn, $admin_id, $action, $target_id = null) {
        try {
            if (!$conn || $conn->connect_error) return false;

            // SỬA CÂU LỆNH INSERT: Dùng cột admin_id
            $sql = "INSERT INTO admin_log (admin_id, action, target_id, created_at) VALUES (?, ?, ?, NOW())";
            
            $stmt = $conn->prepare($sql);
            if ($stmt) {
                // Bind tham số: i (integer), s (string), i (integer)
                $stmt->bind_param("isi", $admin_id, $action, $target_id);
                $stmt->execute();
                $stmt->close();
                return true;
            }
        } catch (Exception $e) {
            return false;
        }
        return false;
    }
}
?>