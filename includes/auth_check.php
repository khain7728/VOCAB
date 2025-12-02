<?php
/**
 * AUTHENTICATION CHECK MIDDLEWARE
 * Include file này ở đầu mỗi trang user/admin để bảo vệ
 */

// Load config nếu chưa load
if (!defined('ROOT_PATH')) {
    require_once __DIR__ . '/../config/config.php';
}

/**
 * Kiểm tra đăng nhập cho trang User
 */
function check_user_auth() {
    if (!is_logged_in()) {
        // Chuyển về trang đăng nhập
        header('Location: /VOCAB/pages/dangnhap.html');
        exit();
    }
    
    // Nếu là admin nhưng truy cập trang user, cho phép
    // Nếu không phải user hoặc admin, từ chối
    if (!is_user() && !is_admin()) {
        header('Location: /VOCAB/pages/dangnhap.html');
        exit();
    }
}

/**
 * Kiểm tra quyền Admin
 */
function check_admin_auth() {
    if (!is_logged_in()) {
        header('Location: /VOCAB/pages/dangnhap.html');
        exit();
    }
    
    if (!is_admin()) {
        // Nếu là user thường, chuyển về dashboard user
        header('Location: /VOCAB/pages/user/user_Dashboard.html');
        exit();
    }
}
?>
