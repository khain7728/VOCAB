// quanlykhoahoc.js
// File này hiện để trống// quanlykhoahoc_admin.js

document.addEventListener('DOMContentLoaded', function() {

    // 1. Nút "Thêm khóa học"
    const addCourseBtn = document.getElementById('add-course-btn');
    if (addCourseBtn) {
        addCourseBtn.onclick = function() {
            alert('Chức năng "Thêm khóa học" đang được phát triển!');
            // (Code mở modal thêm khóa học sẽ ở đây)
        }
    }

    // 2. Nút "Sửa"
    const editButtons = document.querySelectorAll('.js-edit-course');
    editButtons.forEach(button => {
        button.onclick = function() {
            alert('Chức năng "Sửa" đang được phát triển!');
            // (Code mở modal sửa khóa học sẽ ở đây)
        }
    });

    // 3. Nút "Xóa"
    const deleteButtons = document.querySelectorAll('.js-delete-course');
    deleteButtons.forEach(button => {
        button.onclick = function() {
            if (confirm('Bạn có chắc muốn XÓA VĨNH VIỄN khóa học này?')) {
                alert('Đã xóa (demo)!');
                // Code xóa thật:
                // button.closest('tr').remove(); // Xóa hàng khỏi bảng
            }
        }
    });

    // 4. Các nút khóa/mở khóa khóa học
    const lockButtons = document.querySelectorAll('.js-lock-course');
    lockButtons.forEach(button => {
        button.onclick = function() {
            toggleCourseLockState(button);
        }
    });

});

/**
 * Hàm để xử lý logic khóa/mở khóa KHÓA HỌC
 * @param {HTMLElement} button - Nút icon (fa-lock hoặc fa-lock-open) đã được click
 */
function toggleCourseLockState(button) {
    const row = button.closest('tr');
    if (!row) return;

    const statusPill = row.querySelector('.status-pill');
    if (!statusPill) return;

    // *** ĐÂY LÀ DÒNG ĐÃ SỬA LỖI (bỏ .contents) ***
    const isCurrentlyLocked = button.classList.contains('fa-lock-open');

    const confirmMessage = isCurrentlyLocked ?
        "Bạn có chắc muốn MỞ KHÓA (công khai) khóa học này?" :
        "Bạn có chắc muốn KHÓA (riêng tư) khóa học này?";

    if (confirm(confirmMessage)) {
        if (isCurrentlyLocked) {
            // --- Logic MỞ KHÓA ---
            statusPill.textContent = 'Công khai';
            statusPill.classList.remove('status-red');
            statusPill.classList.add('status-green');

            button.classList.remove('fa-lock-open');
            button.classList.add('fa-lock');
            button.title = 'Khóa (Riêng tư)';

        } else {
            // --- Logic KHÓA ---
            statusPill.textContent = 'Riêng tư';
            statusPill.classList.remove('status-green');
            statusPill.classList.add('status-red');

            button.classList.remove('fa-lock');
            button.classList.add('fa-lock-open');
            button.title = 'Mở khóa (Công khai)';
        }
    }
}