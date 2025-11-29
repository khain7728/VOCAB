document.addEventListener("DOMContentLoaded", function() {
    fetchLogs();

    const searchBox = document.getElementById('searchLogBox');
    if (searchBox) {
        searchBox.addEventListener('keyup', searchLogs);
    }
});

let allLogsData = [];

// --- HÀM 1: LẤY DANH SÁCH LOGS ---
async function fetchLogs() {
    const apiUrl = '../../api/admin/log_get_list.php';
    const tableBody = document.getElementById('log_table_body');
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">Đang tải lịch sử...</td></tr>`;

    try {
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.status === 'success') {
            allLogsData = result.data;
            renderLogTable(allLogsData);
        } else {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Lỗi API: ${result.message || 'Không có dữ liệu'}</td></tr>`;
        }
    } catch (error) {
        console.error("Lỗi Fetch Logs:", error);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Lỗi kết nối server</td></tr>`;
    }
}

// --- HÀM 2: VẼ BẢNG LOGS ---
function renderLogTable(logs) {
    const tableBody = document.getElementById('log_table_body');
    if (!logs || logs.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: #666;">Không tìm thấy lịch sử thao tác nào.</td></tr>`;
        return;
    }

    let html = '';
    logs.forEach((item, index) => {
        const adminName = item.admin_name || `Admin (ID: ${item.admin_id})`;
        const target = item.target_id || 'N/A';
        const formattedDate = new Date(item.created_at).toLocaleString('vi-VN');

        html += `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td>${item.action}</td>
                <td style="text-align: center;">${target}</td>
                <td>${adminName}</td>
                <td>${formattedDate}</td>
            </tr>
        `;
    });
    tableBody.innerHTML = html;
}

// --- HÀM 3: TÌM KIẾM LOGS ---
function searchLogs() {
    const input = document.getElementById('searchLogBox');
    const filter = input.value.toLowerCase();

    const filteredData = allLogsData.filter(item => {
        const action = (item.action || "").toLowerCase();
        const targetId = (item.target_id || "").toString();
        return action.includes(filter) || targetId.includes(filter);
    });
    renderLogTable(filteredData);
}