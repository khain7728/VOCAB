/**
 * AUTH CHECK - JavaScript Client-Side
 * Kiểm tra authentication trước khi load page
 * Include file này trong tất cả trang user/admin
 */

(async function checkAuth() {
    try {
        const response = await fetch('/VOCAB/api/get-session-user.php');
        const result = await response.json();
        
        if (!result.success) {
            // Chưa đăng nhập, redirect về login
            alert('Vui lòng đăng nhập để tiếp tục');
            window.location.href = '/VOCAB/pages/dangnhap.html';
            return;
        }
        
        // Lưu thông tin user vào localStorage
        localStorage.setItem('user_id', result.user_id);
        localStorage.setItem('user_name', result.name);
        localStorage.setItem('user_role', result.role);
        
        // Kiểm tra quyền truy cập
        const currentPath = window.location.pathname;
        const isAdminPage = currentPath.includes('/pages/admin/');
        const isUserPage = currentPath.includes('/pages/user/');
        
        if (isAdminPage && result.role !== 'admin') {
            // Không phải admin nhưng truy cập trang admin
            alert('Bạn không có quyền truy cập trang này!');
            window.location.href = '/VOCAB/pages/user/user_Dashboard.html';
            return;
        }
        
        if (isUserPage && result.role !== 'user' && result.role !== 'admin') {
            // Không phải user hoặc admin
            alert('Bạn không có quyền truy cập!');
            window.location.href = '/VOCAB/pages/dangnhap.html';
            return;
        }
        
        console.log('Authentication check passed:', result);
        
    } catch (error) {
        console.error('Auth check failed:', error);
        alert('Không thể xác thực. Vui lòng đăng nhập lại.');
        window.location.href = '/VOCAB/pages/dangnhap.html';
    }
})();
