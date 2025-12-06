/**
 * MENU STATE MANAGER - Quản lý trạng thái menu (đóng/mở)
 * Script này chạy TRƯỚC KHI render menu để tránh animation
 */
(function() {
    'use strict';
    
    const MENU_STATE_KEY = 'vocab_menu_state';
    const MENU_OPEN = 'open';
    
    // Restore menu state từ localStorage NGAY LẬP TỨC
    const savedState = localStorage.getItem(MENU_STATE_KEY);
    if (savedState === MENU_OPEN) {
        document.body.classList.add('menu-open');
    }
    
    // Toggle menu khi click nút
    document.addEventListener('click', function(e) {
        if (e.target.closest('#menu-toggle')) {
            document.body.classList.toggle('menu-open');
            const isOpen = document.body.classList.contains('menu-open');
            localStorage.setItem(MENU_STATE_KEY, isOpen ? MENU_OPEN : 'closed');
            
            // Bật transition sau lần click đầu tiên
            document.body.classList.add('menu-allow-transition');
        }
    });
    
    // Active menu item dựa vào trang hiện tại
    document.addEventListener('DOMContentLoaded', function() {
        const currentPage = window.location.pathname.split('/').pop();
        const menuLinks = document.querySelectorAll('#frame_menu a');
        
        menuLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPage.includes(href)) {
                link.classList.add('active');
            }
        });
    });
})();
