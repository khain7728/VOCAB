// quanlytaikhoan_admin.js

document.addEventListener('DOMContentLoaded', function() {

    // Tìm tất cả các nút khóa/mở khóa
    const lockButtons = document.querySelectorAll('.js-lock-toggle');

    // Gán sự kiện click cho từng nút
    lockButtons.forEach(button => {
        button.onclick = function() {
            toggleLockState(button);
        }
    });

});

/**
 * Hàm để xử lý logic khóa/mở khóa
 * @param {HTMLElement} button - Nút icon (fa-lock hoặc fa-lock-open) đã được click
 */
function toggleLockState(button) {
    // 1. Tìm hàng (tr) cha của nút
    const row = button.closest('tr');
    if (!row) return;

    // 2. Tìm status pill trong hàng đó
    const statusPill = row.querySelector('.status-pill');
    if (!statusPill) return;

    // 3. Kiểm tra trạng thái hiện tại (đang bị khóa hay không)
    // *** ĐÂY LÀ DÒNG ĐÃ SỬA LỖI: Bỏ ".contents" bị dư ***
    const isCurrentlyLocked = button.classList.contains('fa-lock-open');

    // 4. Tạo tin nhắn xác nhận
    const confirmMessage = isCurrentlyLocked ?
        "Bạn có chắc muốn MỞ KHÓA tài khoản này?" :
        "Bạn có chắc muốn KHÓA tài khoản này?";

    // 5. Hiển thị hộp thoại confirm
    if (confirm(confirmMessage)) {
        // 6. Nếu người dùng đồng ý, thay đổi trạng thái
        if (isCurrentlyLocked) {
            // --- Logic MỞ KHÓA ---
            statusPill.textContent = 'Hoạt động';
            statusPill.classList.remove('status-red');
            statusPill.classList.add('status-green');

            button.classList.remove('fa-lock-open');
            button.classList.add('fa-lock');
            button.title = 'Khóa tài khoản';

        } else {
            // --- Logic KHÓA ---
            statusPill.textContent = 'Bị khóa';
            statusPill.classList.remove('status-green');
            statusPill.classList.add('status-red');

            button.classList.remove('fa-lock');
            button.classList.add('fa-lock-open');
            button.title = 'Mở khóa';
        }
    }
    // Nếu không đồng ý, không làm gì cả
}