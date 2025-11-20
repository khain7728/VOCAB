<?php
function writeAdminLog($conn, $admin_id, $action, $target_id) {
    if (!$conn) return;
    $sql = "INSERT INTO admin_log (admin_id, action, target_id, created_at) VALUES (?, ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $stmt->bind_param("isi", $admin_id, $action, $target_id);
        $stmt->execute();
        $stmt->close();
    }
}
?>