/**
 * layout_admin.js - Phiên bản mới
 * Chỉ xử lý sự kiện click nút Menu, KHÔNG can thiệp vào giao diện/layout.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Tìm nút 3 gạch trên Header
    const menuIcon = document.querySelector('#header_admin #menu');

    if (menuIcon) {
        menuIcon.addEventListener('click', function(e) {
            // Chỉ bật/tắt class, không chỉnh sửa style trực tiếp
            document.body.classList.toggle('menu-open');
        });
    }
});