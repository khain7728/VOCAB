/**
 * QUẢN LÝ TÀI KHOẢN - LOGIC SCRIPT
 */

// --- BIẾN TOÀN CỤC & CẤU HÌNH ---
const API_URL = '../../api/admin/';
let allUsersData = [];

const UI = {
    table: 'user_table_body',
    search: 'searchBox',
    modal: 'modalUserDetail',
    btnCloseHead: 'btnCloseModalHeader',
    btnCloseFoot: 'btnCloseModalFooter',
    // Modal fields
    mName: 'modal_fullname',
    mEmail: 'modal_email',
    mStatus: 'modal_status',
    mId: 'modal_id',
    mJoined: 'modal_joined',
    mAvatar: 'modal_avatar'
};

// --- 1. KHỞI TẠO (DOM READY) ---
document.addEventListener("DOMContentLoaded", function() {
    // 1.1 Load dữ liệu
    fetchUsers();

    // 1.2 Sự kiện tìm kiếm
    const searchBox = document.getElementById(UI.search);
    if (searchBox) searchBox.addEventListener('keyup', searchTable);

    // 1.3 Sự kiện Modal (Đóng)
    const btnHead = document.getElementById(UI.btnCloseHead);
    const btnFoot = document.getElementById(UI.btnCloseFoot);
    if (btnHead) btnHead.addEventListener('click', closeModal);
    if (btnFoot) btnFoot.addEventListener('click', closeModal);

    // Click outside để đóng modal
    window.addEventListener('click', (e) => {
        const modal = document.getElementById(UI.modal);
        if (e.target === modal) closeModal();
    });

    // 1.4 EVENT DELEGATION: Xử lý các nút trong bảng (Xem, Khóa/Mở)
    const tbody = document.getElementById(UI.table);
    if (tbody) {
        tbody.addEventListener('click', handleTableActions);
    }
});

// --- 2. XỬ LÝ API ---

async function fetchUsers() {
    const tableBody = document.getElementById(UI.table);
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding:20px;">Đang tải dữ liệu...</td></tr>`;

    try {
        const response = await fetch(`${API_URL}user_get_list.php`);
        const result = await response.json();

        if (result.status === 'success') {
            allUsersData = result.data;
            renderTable(allUsersData);
        } else {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center" style="color:red;">${result.message || 'Lỗi tải dữ liệu'}</td></tr>`;
        }
    } catch (error) {
        console.error("Lỗi API:", error);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center" style="color:red;">Lỗi kết nối server</td></tr>`;
    }
}

async function toggleUserStatus(userId, currentStatus) {
    const actionName = (currentStatus === 'locked') ? "Mở khóa" : "Khóa";
    if (!confirm(`Bạn có chắc muốn ${actionName} tài khoản này?`)) return;

    try {
        const response = await fetch(`${API_URL}user_update_status.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, status: currentStatus })
        });
        const result = await response.json();

        if (result.status === 'success') {
            alert(`Đã ${actionName} thành công!`);

            // Cập nhật lại data local để không phải load lại API
            const userIndex = allUsersData.findIndex(u => u.id == userId);
            if (userIndex > -1) {
                // Đảo trạng thái: active <-> locked
                allUsersData[userIndex].status = (currentStatus === 'active') ? 'locked' : 'active';
                // Render lại bảng
                searchTable();
            }
        } else {
            alert(`Lỗi: ${result.message}`);
        }
    } catch (error) {
        alert("Lỗi kết nối server!");
    }
}

// --- 3. RENDER UI ---

function renderTable(users) {
    const tableBody = document.getElementById(UI.table);
    if (!users || users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding:20px; color:#666;">Không tìm thấy người dùng nào.</td></tr>`;
        return;
    }

    let html = '';
    users.forEach((user, index) => {
        // Map dữ liệu
        const userId = user.id;
        const userName = user.fullname || "No Name";
        const userEmail = user.email || "";
        const isActive = (user.status === 'active');
        const firstLetter = userName.charAt(0).toUpperCase();

        const statusBadge = isActive ?
            `<span class="status-badge active">Hoạt động</span>` :
            `<span class="status-badge locked">Đã khóa</span>`;

        // Tạo nút hành động: Dùng data-id và class để bắt sự kiện, KHÔNG dùng onclick
        const actionBtn = isActive ?
            `<button class="btn-action btn-lock" data-id="${userId}" data-status="active" title="Khóa tài khoản"><i class="fa-solid fa-lock-open"></i></button>` :
            `<button class="btn-action btn-unlock" data-id="${userId}" data-status="locked" title="Mở khóa tài khoản"><i class="fa-solid fa-lock"></i></button>`;

        html += `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>
                    <div class="user-info-cell">
                        <div class="user-avatar">${firstLetter}</div>
                        <div class="user-details">
                            <div>${userName}</div>
                            <span>${userEmail}</span>
                        </div>
                    </div>
                </td>
                <td class="text-center">${formatDate(user.created_at)}</td>
                <td class="text-center">${statusBadge}</td>
                <td class="text-center">
                    <button class="btn-action btn-view" data-id="${userId}" title="Xem chi tiết"><i class="fa-solid fa-eye"></i></button>
                    ${actionBtn}
                </td>
            </tr>
        `;
    });
    tableBody.innerHTML = html;
}

function searchTable() {
    const term = document.getElementById(UI.search).value.toLowerCase();
    const filtered = allUsersData.filter(user => {
        const uName = (user.fullname || "").toLowerCase();
        const uEmail = (user.email || "").toLowerCase();
        return uName.includes(term) || uEmail.includes(term);
    });
    renderTable(filtered);
}

// --- 4. XỬ LÝ SỰ KIỆN (EVENT DELEGATION) ---

function handleTableActions(e) {
    // Tìm button gần nhất được click (tránh click vào icon i bên trong)
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = btn.dataset.id;

    // Nút Xem chi tiết
    if (btn.classList.contains('btn-view')) {
        viewUserDetail(id);
    }
    // Nút Khóa / Mở khóa
    else if (btn.classList.contains('btn-lock') || btn.classList.contains('btn-unlock')) {
        const currentStatus = btn.dataset.status;
        toggleUserStatus(id, currentStatus);
    }
}

// --- 5. LOGIC MODAL ---

function viewUserDetail(id) {
    const user = allUsersData.find(u => u.id == id);
    if (!user) return;

    const userName = user.fullname || "No Name";

    // Fill data
    document.getElementById(UI.mName).innerText = userName;
    document.getElementById(UI.mEmail).innerText = user.email;
    document.getElementById(UI.mId).innerText = user.id;
    document.getElementById(UI.mJoined).innerText = formatDate(user.created_at);
    document.getElementById(UI.mAvatar).innerText = userName.charAt(0).toUpperCase();

    const badgeEl = document.getElementById(UI.mStatus);
    if (user.status === 'active') {
        badgeEl.className = 'status-badge active';
        badgeEl.innerText = 'Đang hoạt động';
    } else {
        badgeEl.className = 'status-badge locked';
        badgeEl.innerText = 'Đã bị khóa';
    }

    document.getElementById(UI.modal).classList.add('show');
}

function closeModal() {
    document.getElementById(UI.modal).classList.remove('show');
}

// Helper: Format ngày
function formatDate(dateString) {
    if (!dateString) return "";
    try {
        return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (e) { return dateString; }
}