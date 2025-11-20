let usersList = [];

document.addEventListener('DOMContentLoaded', function() {
    loadData();
});

// 1. Tải danh sách người dùng
function loadData() {
    const tbody = document.getElementById('user_table_body');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Đang tải dữ liệu...</td></tr>';

    fetch('../../api/admin/user_get_list.php')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                usersList = data.data;
                renderTable(usersList);
            } else {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Không có dữ liệu.</td></tr>';
            }
        })
        .catch(err => {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red">Lỗi kết nối server!</td></tr>';
        });
}

// 2. Hiển thị bảng
function renderTable(data) {
    const tbody = document.getElementById('user_table_body');
    let html = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Chưa có người dùng nào.</td></tr>';
        return;
    }

    data.forEach((user, index) => {
        // Kiểm tra trạng thái: active (hoạt động) hay locked (bị khóa)
        const isLocked = user.status === 'locked';
        const statusClass = isLocked ? 'status-red' : 'status-green';
        const statusText = isLocked ? 'Đã khóa' : 'Hoạt động';

        // Icon nút bấm: Nếu đang khóa -> Hiện icon mở. Nếu đang mở -> Hiện icon khóa
        const toggleIcon = isLocked ? 'fa-lock' : 'fa-unlock';
        const toggleTitle = isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản';
        const toggleBtnColor = isLocked ? '#28a745' : '#dc3545'; // Xanh lá (để mở) hoặc Đỏ (để khóa)

        html += `
            <tr>
                <td style="text-align:center">${index + 1}</td>
                <td><strong>${user.fullname}</strong></td>
                <td>${user.email}</td>
                <td>${user.created_at}</td>
                <td><span class="status-pill ${statusClass}">${statusText}</span></td>
                <td class="table-actions" style="text-align:center">
                    <i class="fa-solid ${toggleIcon}" 
                       style="color: ${toggleBtnColor}; cursor: pointer;" 
                       title="${toggleTitle}" 
                       onclick="toggleUserStatus(${user.id}, '${user.status}')">
                    </i>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// 3. Chức năng Khóa / Mở khóa (Toggle)
function toggleUserStatus(id, currentStatus) {
    const action = currentStatus === 'active' ? 'KHÓA' : 'MỞ KHÓA';

    if (confirm(`Bạn có chắc muốn ${action} tài khoản người dùng này?`)) {
        fetch('../../api/admin/user_update_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: id,
                    status: currentStatus
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    alert(data.message);
                    loadData(); // Tải lại bảng sau khi cập nhật xong
                } else {
                    alert('Lỗi: ' + data.message);
                }
            })
            .catch(err => {
                console.error(err);
                alert('Lỗi kết nối server!');
            });
    }
}

// 4. Tìm kiếm
function searchTable() {
    const val = document.getElementById('searchBox').value.toLowerCase();
    const filtered = usersList.filter(u =>
        u.fullname.toLowerCase().includes(val) ||
        u.email.toLowerCase().includes(val)
    );
    renderTable(filtered);
}