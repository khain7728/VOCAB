<?php


if (!function_exists('writeAdminLog')) {
    function writeAdminLog($conn, $admin_id, $action, $target_id = null) {
        try {

            $stmt = $conn->prepare("INSERT INTO admin_log (admin_id, action, target_id, created_at) VALUES (?, ?, ?, NOW())");
            
            if ($stmt) {
                $stmt->bind_param("isi", $admin_id, $action, $target_id);
                $stmt->execute();
                $stmt->close();
            }
        } catch (Exception $e) {
           
        }
    }
}
?>