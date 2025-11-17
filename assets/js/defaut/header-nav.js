// JavaScript xử lý navigation cho header
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        // Lấy tất cả các link navigation
        const navLinks = document.querySelectorAll('#dieu_huong .nav-link');
        
        navLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Nếu link bắt đầu bằng /, xử lý relative path
                if (href && href.startsWith('/')) {
                    e.preventDefault();
                    
                    // Kiểm tra xem đang ở folder nào
                    const currentPath = window.location.pathname;
                    const isInPagesFolder = currentPath.includes('/pages/');
                    
                    let newPath;
                    if (isInPagesFolder) {
                        // Đang ở trong /pages/, cần lùi về root
                        newPath = '..' + href;
                    } else {
                        // Đang ở root, bỏ / đầu tiên
                        newPath = href.substring(1);
                    }
                    
                    window.location.href = newPath;
                }
            });
        });
    });
})();
