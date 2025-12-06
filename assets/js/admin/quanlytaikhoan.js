/**
 * Tệp: js/admin/quanlytaikhoan.js
 * Phiên bản: Updated (Loading Effect giống Lịch sử thao tác)
 */

document.addEventListener("DOMContentLoaded", function() {
    fetchUsers();
    setupEventListeners();
});

// --- 1. QUẢN LÝ TRẠNG THÁI (STATE) ---
let currentPage = 1;
let currentSort = { col: 'created_at', order: 'DESC' };
let searchTimer = null;
const apiCache = new Map(); // Cache API

// --- 2. HÀM GỌI API (FETCH DATA) ---
async function fetchUsers(forceReload = false) {
    const tableBody = document.getElementById('user_table_body');
    const searchEl = document.getElementById('searchUserBox');

    // Lấy giá trị thực tế tại thời điểm gọi hàm
    const currentSearchVal = searchEl ? searchEl.value.trim() : '';

    // Tạo tham số gửi lên Server
    const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        sort_by: currentSort.col,
        order: currentSort.order,
        search: currentSearchVal
    });

    const cacheKey = params.toString();

    // 1. Kiểm tra Cache
    if (!forceReload && apiCache.has(cacheKey)) {
        const cachedData = apiCache.get(cacheKey);
        // Kiểm tra lại xem ô tìm kiếm có bị thay đổi trong lúc lấy cache không
        if (searchEl && searchEl.value.trim() !== currentSearchVal) return;

        renderUserTable(cachedData.data, (currentPage - 1) * 10);
        renderPagination(cachedData.pagination);
        updateSortIcons();
        return;
    }

    // 2. Hiển thị Loading (GIỐNG TRANG LỊCH SỬ THAO TÁC)
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
                    <div style="margin-top: 10px;">Đang tải dữ liệu...</div>
                </td>
            </tr>`;
    }

    try {
        const response = await fetch(`../../api/admin/user_get_list.php?${params.toString()}`);

        // Xử lý khi hết phiên đăng nhập (Lỗi 403)
        if (response.status === 403) {
            showToast("Phiên đăng nhập hết hạn", "error");
            setTimeout(() => window.location.href = '../../pages/login.html', 1500);
            return;
        }

        if (!response.ok) throw new Error(`Lỗi kết nối (${response.status})`);

        const result = await response.json();

        // Kiểm tra xem lúc dữ liệu tải xong, người dùng có xóa/sửa ô tìm kiếm chưa?
        const nowSearchVal = searchEl ? searchEl.value.trim() : '';
        if (nowSearchVal !== currentSearchVal) {
            return; // Bỏ qua kết quả cũ
        }

        if (result.status === 'success') {
            apiCache.set(cacheKey, result);
            renderUserTable(result.data, (currentPage - 1) * 10);
            renderPagination(result.pagination);
            updateSortIcons();
        } else {
            throw new Error(result.message || "Lỗi server");
        }

    } catch (error) {
        // Chỉ hiện lỗi nếu không phải do người dùng đang gõ tiếp
        if (searchEl && searchEl.value.trim() === currentSearchVal) {
            console.error("Fetch Error:", error);
            if (tableBody) {
                tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red; padding:20px;">Lỗi: ${error.message}</td></tr>`;
            }
            showToast("Lỗi kết nối server", "error");
        }
    }
}

// --- 3. HÀM VẼ BẢNG ---
function renderUserTable(users, startIndex) {
    const tableBody = document.getElementById('user_table_body');
    if (!tableBody) return;

    if (!users || users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 40px; color: #999;">
                    <i class="fa-regular fa-folder-open fa-3x" style="margin-bottom:10px; opacity: 0.5;"></i>
                    <div>Không tìm thấy tài khoản nào.</div>
                </td>
            </tr>`;
        return;
    }

    let html = '';
    users.forEach((u, index) => {
        const isActive = u.status == 1;

        // Nút Action (Giữ nguyên logic Khóa/Mở khóa)
        const btnAction = isActive ?
            `<button class="btn-action btn-lock" onclick="toggleStatus(this, ${u.user_id}, 'locked')" title="Khóa tài khoản"><i class="fa-solid fa-lock"></i></button>` :
            `<button class="btn-action btn-unlock" onclick="toggleStatus(this, ${u.user_id}, 'active')" title="Mở khóa tài khoản"><i class="fa-solid fa-lock-open"></i></button>`;

        // Badge trạng thái
        const statusBadge = isActive ?
            `<span class="status-badge active">Hoạt động</span>` :
            `<span class="status-badge locked">Đã khóa</span>`;

        // Avatar
        const initial = u.name ? u.name.charAt(0).toUpperCase() : '?';
        const avatarHtml = u.avatar ?
            `<img src="${escapeHtml(u.avatar)}" class="user-avatar" alt="A">` :
            `<div class="user-avatar placeholder">${initial}</div>`;

        html += `
            <tr>
                <td class="col-stt">${startIndex + index + 1}</td>
                <td>
                    <div class="user-info-wrapper">
                        ${avatarHtml}
                        <div class="user-text">
                            <div class="user-name">${escapeHtml(u.name)}</div>
                            <small class="user-email">${escapeHtml(u.email)}</small>
                        </div>
                    </div>
                </td>
                <td class="col-date">${new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                <td class="col-status">${statusBadge}</td>
                <td class="col-action">
                    ${btnAction}
                </td>
            </tr>
        `;
    });
    tableBody.innerHTML = html;
}

// --- 4. CÁC HÀM HÀNH ĐỘNG ---

window.toggleStatus = async(btnElement, userId, targetStatus) => {
    const actionText = targetStatus === 'active' ? 'MỞ KHÓA' : 'KHÓA';
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này không?`)) return;

    // Loading effect trên nút
    const originalContent = btnElement.innerHTML;
    btnElement.disabled = true;
    btnElement.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`;

    try {
        const res = await fetch('../../api/admin/user_update_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, status: targetStatus })
        });
        const data = await res.json();

        if (data.status === 'success') {
            showToast(data.message, 'success');
            apiCache.clear(); // Xóa cache
            fetchUsers(true); // Force reload
        } else {
            showToast(data.message, 'error');
            btnElement.disabled = false;
            btnElement.innerHTML = originalContent;
        }
    } catch (e) {
        showToast('Lỗi hệ thống', 'error');
        btnElement.disabled = false;
        btnElement.innerHTML = originalContent;
    }
};

// --- 5. PHÂN TRANG (GIỐNG LỊCH SỬ THAO TÁC) ---
function renderPagination(paging) {
    const container = document.getElementById('pagination');
    if (!container) return;

    if (paging.total_pages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    // Prev
    html += `<button class="page-btn" onclick="changePage(${paging.current_page - 1})" ${paging.current_page === 1 ? 'disabled' : ''}>
                <i class="fa-solid fa-chevron-left"></i>
             </button>`;

    // Pages
    for (let i = 1; i <= paging.total_pages; i++) {
        if (i === 1 || i === paging.total_pages || (i >= paging.current_page - 1 && i <= paging.current_page + 1)) {
            const activeClass = i === paging.current_page ? 'active' : '';
            html += `<button class="page-btn ${activeClass}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === paging.current_page - 2 || i === paging.current_page + 2) {
            html += `<span style="padding: 0 6px; color: #999;">...</span>`;
        }
    }

    // Next
    html += `<button class="page-btn" onclick="changePage(${paging.current_page + 1})" ${paging.current_page === paging.total_pages ? 'disabled' : ''}>
                <i class="fa-solid fa-chevron-right"></i>
             </button>`;

    container.innerHTML = html;
}

window.changePage = (page) => {
    if (page < 1) return;
    currentPage = page;
    fetchUsers();
};

// --- 6. UTILS & EVENTS ---

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    return text.toString().replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}

function updateSortIcons() {
    document.querySelectorAll('th.sortable i').forEach(i => i.className = 'fa-solid fa-sort text-muted');
    const activeTh = document.querySelector(`th[data-sort="${currentSort.col}"]`);
    if (activeTh) {
        const icon = activeTh.querySelector('i');
        icon.className = currentSort.order === 'ASC' ? 'fa-solid fa-sort-up text-dark' : 'fa-solid fa-sort-down text-dark';
    }
}

function setupEventListeners() {
    const searchBox = document.getElementById('searchUserBox');
    if (searchBox) {
        searchBox.addEventListener('input', (e) => {
            const keyword = e.target.value;
            clearTimeout(searchTimer);

            if (keyword.length === 0) {
                currentPage = 1;
                fetchUsers();
                return;
            }

            searchTimer = setTimeout(() => {
                currentPage = 1;
                fetchUsers();
            }, 300);
        });
    }

    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.getAttribute('data-sort');
            if (currentSort.col === col) {
                currentSort.order = currentSort.order === 'ASC' ? 'DESC' : 'ASC';
            } else {
                currentSort.col = col;
                currentSort.order = 'DESC';
            }
            fetchUsers();
        });
    });
}