let logsList = [];

document.addEventListener('DOMContentLoaded', function() {
    loadData();
});

// 1. Load dữ liệu từ API thật
function loadData() {
    const tbody = document.getElementById('log_table_body');

    // Hiển thị loading
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Đang tải dữ liệu...</td></tr>';

    // Gọi API
    fetch('../../api/admin/log_get_list.php')
        .then(response => {
            // Kiểm tra xem phản hồi có OK không
            if (!response.ok) {
                throw new Error('Lỗi kết nối mạng hoặc đường dẫn API sai');
            }
            return response.json();
        })
        .then(res => {
            console.log("Dữ liệu nhận được:", res); // Log để debug kiểm tra

            if (res.status === 'success') {
                logsList = res.data;
                renderTable(logsList);
            } else {
                // Trường hợp API trả về lỗi logic (ví dụ: lỗi truy vấn SQL)
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Lỗi: ${res.message}</td></tr>`;
            }
        })
        .catch(err => {
            console.error("Lỗi fetch:", err);
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: red;">Không thể tải dữ liệu. Vui lòng thử lại sau.</td></tr>';
        });
}

// 2. Render bảng (Hiển thị dữ liệu)
function renderTable(data) {
    const tbody = document.getElementById('log_table_body');
    let html = '';

    // Kiểm tra nếu không có dữ liệu
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Chưa có lịch sử thao tác nào.</td></tr>';
        return;
    }

    data.forEach((log, index) => {
        // Xử lý hiển thị trạng thái (Nếu API trả về status, dùng nó. Nếu không, mặc định là success/thành công)
        let statusClass = 'status-green';
        let statusText = 'Thành công';

        // Logic màu sắc (Tùy chỉnh theo dữ liệu thực tế của bạn)
        if (log.status === 'failed') {
            statusClass = 'status-red';
            statusText = 'Thất bại';
        }

        // Xử lý hiển thị tên Admin (nếu null thì hiện ẩn danh/đã xóa)
        const adminName = log.admin_name ? log.admin_name : 'Admin (Đã xóa)';

        // Xử lý hiển thị Target ID
        const targetDisplay = log.target_id ? log.target_id : '-';

        html += `
            <tr>
                <td style="text-align:center">${index + 1}</td>
                <td><strong>${adminName}</strong></td>
                <td>${log.action}</td>
                <td style="color: #666;">ID: ${targetDisplay}</td>
                <td>${log.created_at}</td>
                <td><span class="status-pill ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// 3. Tìm kiếm (Filter ngay trên máy client)
function searchTable() {
    const val = document.getElementById('searchBox').value.toLowerCase();

    const filtered = logsList.filter(log => {
        const name = log.admin_name ? log.admin_name.toLowerCase() : '';
        const action = log.action ? log.action.toLowerCase() : '';
        const target = log.target_id ? log.target_id.toString() : '';

        return name.includes(val) || action.includes(val) || target.includes(val);
    });

    renderTable(filtered);
}