document.addEventListener("DOMContentLoaded", async function() {
    // 1. Định nghĩa đường dẫn
    const basePath = "../../includes/";

    try {
        // 2. Tải Header và Menu song song
        await Promise.all([
            loadComponent("placeholder-menu", basePath + "menu_admin.html"),
            loadComponent("placeholder-header", basePath + "header_admin.html")
        ]);

        // 3. Sau khi tải xong HTML -> Active menu hiện tại
        activeCurrentMenu();

    } catch (error) {
        console.error("Lỗi tải giao diện:", error);
    }
});

/**
 * Hàm hỗ trợ tải file HTML và nhúng vào ID chỉ định
 */
async function loadComponent(elementId, filePath) {
    const element = document.getElementById(elementId);
    if (!element) return;
    try {
        const response = await fetch(filePath);
        if (response.ok) element.innerHTML = await response.text();
    } catch (e) { console.error(`Lỗi tải ${filePath}:`, e); }
}

/**
 * XỬ LÝ SỰ KIỆN GLOBAL (MENU TOGGLE & LOGOUT)
 * Dùng Event Delegation (lắng nghe từ document) để bắt sự kiện cho các element được load động
 */
document.addEventListener('click', function(e) {
    // 1. Xử lý Toggle Menu (Thu nhỏ/Mở rộng)
    const menuBtn = e.target.closest('#menu');
    if (menuBtn) {
        document.body.classList.toggle('menu-collapsed');
    }

    // 2. Xử lý nút Logout
    const logoutBtn = e.target.closest('#btn_logout');
    if (logoutBtn) {
        if (!confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            e.preventDefault();
        }
    }
});

/**
 * Hàm tô đậm menu đang truy cập dựa trên URL
 */
function activeCurrentMenu() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll(".menu-item a");
    links.forEach(link => {
        if (link.getAttribute("href") && currentPath.includes(link.getAttribute("href"))) {
            link.classList.add("active");
        }
    });
}