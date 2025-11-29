document.addEventListener("DOMContentLoaded", function() {
    // 1. Gọi API lấy danh sách người dùng
    fetchUsers();

    // 2. Lắng nghe tìm kiếm
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        searchBox.addEventListener('keyup', searchTable);
    }
});

let allUsersData = [];

// --- HÀM 1: LẤY DỮ LIỆU ---
async function fetchUsers() {
    const apiUrl = '../../api/admin/user_get_list.php';
    const tableBody = document.getElementById('user_table_body');
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">Đang tải dữ liệu...</td></tr>`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const result = await response.json();

        if (result.status === 'success') {
            allUsersData = result.data;
            renderTable(allUsersData);
        } else {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">${result.message || 'Lỗi tải dữ liệu'}</td></tr>`;
        }
    } catch (error) {
        console.error("Lỗi API:", error);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Lỗi kết nối server</td></tr>`;
    }
}

// --- HÀM 2: VẼ BẢNG ---
function renderTable(users) {
    const tableBody = document.getElementById('user_table_body');
    if (!users || users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: #666;">Không tìm thấy người dùng nào.</td></tr>`;
        return;
    }

    let html = '';
    users.forEach((user, index) => {
        // Map dữ liệu từ PHP trả về
        const userId = user.id;
        const userName = user.fullname || "No Name";
        const userEmail = user.email || "";
        const userJoined = user.created_at || "";
        const isActive = (user.status === 'active'); // PHP trả về 'active' hoặc 'locked'

        const firstLetter = userName.charAt(0).toUpperCase();

        const statusBadge = isActive ?
            `<span class="status-badge active">Hoạt động</span>` :
            `<span class="status-badge locked">Đã khóa</span>`;

        // Logic nút bấm: Nếu đang active -> Nút Khóa (gửi 'active'), ngược lại nút Mở
        const actionBtn = isActive ?
            `<button class="btn-action btn-lock" onclick="toggleUserStatus(${userId}, 'active')" title="Khóa tài khoản"><i class="fa-solid fa-lock-open"></i></button>` :
            `<button class="btn-action btn-unlock" onclick="toggleUserStatus(${userId}, 'locked')" title="Mở khóa tài khoản"><i class="fa-solid fa-lock"></i></button>`;

        html += `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td>
                    <div class="user-info-cell">
                        <div class="user-avatar">${firstLetter}</div>
                        <div class="user-details">
                            <div>${userName}</div>
                            <span>${userEmail}</span>
                        </div>
                    </div>
                </td>
                <td style="text-align: center;">${formatDate(userJoined)}</td>
                <td style="text-align: center;">${statusBadge}</td>
                <td style="text-align: center;">
                    <button class="btn-action btn-view" onclick="viewUserDetail(${userId})" title="Xem chi tiết"><i class="fa-solid fa-eye"></i></button>
                    ${actionBtn}
                </td>
            </tr>
        `;
    });
    tableBody.innerHTML = html;
}

// --- HÀM 3: TÌM KIẾM ---
function searchTable() {
    const input = document.getElementById('searchBox');
    const filter = input.value.toLowerCase();

    const filteredData = allUsersData.filter(user => {
        const uName = (user.fullname || "").toLowerCase();
        const uEmail = (user.email || "").toLowerCase();
        return uName.includes(filter) || uEmail.includes(filter);
    });
    renderTable(filteredData);
}

// --- HÀM 4: KHÓA/MỞ KHÓA USER ---
async function toggleUserStatus(userId, currentStatusStr) {
    const actionName = (currentStatusStr === 'locked') ? "Mở khóa" : "Khóa";
    if (!confirm(`Bạn có chắc muốn ${actionName} tài khoản này?`)) return;

    try {
        const response = await fetch('../../api/admin/user_update_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, status: currentStatusStr })
        });
        const result = await response.json();

        if (result.status === 'success') {
            alert(`Đã ${actionName} thành công!`);
            // Cập nhật lại dữ liệu local (đảo trạng thái)
            const userIndex = allUsersData.findIndex(u => u.id == userId);
            if (userIndex > -1) {
                allUsersData[userIndex].status = (currentStatusStr === 'active') ? 'locked' : 'active';
                // Render lại theo tìm kiếm hiện tại
                document.getElementById('searchBox').value ? searchTable() : renderTable(allUsersData);
            }
        } else {
            alert(`Lỗi: ${result.message}`);
        }
    } catch (error) {
        console.error("Lỗi update:", error);
        alert("Lỗi kết nối server!");
    }
}

// --- HÀM 5: HIỂN THỊ MODAL CHI TIẾT (MỚI) ---
function viewUserDetail(id) {
    // Tìm user trong mảng data đã tải
    const user = allUsersData.find(u => u.id == id);
    if (!user) { alert("Không tìm thấy dữ liệu!"); return; }

    const userName = user.fullname || "No Name";

    // Gán dữ liệu vào Modal
    document.getElementById('modal_fullname').innerText = userName;
    document.getElementById('modal_email').innerText = user.email;
    document.getElementById('modal_id').innerText = user.id;
    document.getElementById('modal_joined').innerText = formatDate(user.created_at);
    document.getElementById('modal_avatar').innerText = userName.charAt(0).toUpperCase();

    // Badge trạng thái trong modal
    const badgeEl = document.getElementById('modal_status');
    if (user.status === 'active') {
        badgeEl.className = 'status-badge active';
        badgeEl.innerText = 'Đang hoạt động';
    } else {
        badgeEl.className = 'status-badge locked';
        badgeEl.innerText = 'Đã bị khóa';
    }

    // Hiển thị modal
    document.getElementById('modalUserDetail').classList.add('show');
}

// --- HÀM 6: ĐÓNG MODAL ---
function closeModal() {
    document.getElementById('modalUserDetail').classList.remove('show');
}

// Đóng khi click ra ngoài popup
window.onclick = function(event) {
    const modal = document.getElementById('modalUserDetail');
    if (event.target == modal) closeModal();
}

// Hàm format ngày
function formatDate(dateString) {
    if (!dateString) return "";
    try {
        return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (e) { return dateString; }
}