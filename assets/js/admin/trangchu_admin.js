document.addEventListener('DOMContentLoaded', function() {
    loadDashboardStats();
});

function loadDashboardStats() {
    // Thử gọi API với đường dẫn tương đối chuẩn
    // Giả sử file này được gọi từ /pages/admin/trangchu_admin.php
    const apiUrl = '../../api/dashboard_get_stats.php';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error("Lỗi HTTP: " + response.status);
            return response.json();
        })
        .then(res => {
            if (res.status === 'success') {
                updateUI(res.data);
            } else {
                console.error("API báo lỗi:", res.message);
            }
        })
        .catch(err => {
            console.error("Lỗi kết nối:", err);
            document.getElementById('recent-activity-list').innerHTML = '<p style="color:red; text-align:center">Lỗi kết nối API. Kiểm tra Console (F12).</p>';
        });
}

function updateUI(data) {
    // 1. Cập nhật số liệu thống kê
    safeSetText("total-users", data.total_users);
    safeSetText("total-courses", data.total_courses);
    safeSetText("today-activity", data.today_activity);

    // 2. Render danh sách hoạt động
    const list = document.getElementById('recent-activity-list');
    if (list) {
        if (!data.recent_activities || data.recent_activities.length === 0) {
            list.innerHTML = '<p style="text-align:center; color:#999; padding:10px;">Chưa có hoạt động nào.</p>';
        } else {
            let html = '';
            data.recent_activities.forEach(log => {
                html += `
                <li class="activity-item">
                    <div class="activity-icon icon-edit"><i class="fa-solid fa-info"></i></div>
                    <div class="activity-text">
                        <p><strong>${log.admin_name || 'Admin'}</strong>: ${log.action}</p>
                        <span class="activity-time">${new Date(log.created_at).toLocaleString('vi-VN')}</span>
                    </div>
                </li>`;
            });
            list.innerHTML = html;
        }
    }

    // 3. Vẽ biểu đồ (nếu thư viện Chart.js đã load)
    if (typeof Chart !== 'undefined') {
        // Biểu đồ Top Khóa học (Theo học viên)
        renderChart('courseChart', 'bar', {
            labels: data.popular_courses.map(c => c.course_name),
            datasets: [{
                label: 'Số học viên',
                data: data.popular_courses.map(c => c.student_count),
                backgroundColor: '#36A2EB',
                borderRadius: 4
            }]
        });

        // Biểu đồ User mới
        renderChart('userChart', 'line', {
            labels: data.user_chart.map(u => u.month_year),
            datasets: [{
                label: 'Người dùng mới',
                data: data.user_chart.map(u => u.count),
                borderColor: '#4BC0C0',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.3
            }]
        });
    }
}

// Hàm hỗ trợ vẽ biểu đồ gọn hơn
function renderChart(canvasId, type, dataConfig) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Hủy biểu đồ cũ nếu có để tránh lỗi đè hình
    if (ctx.chartInstance) {
        ctx.chartInstance.destroy();
    }

    ctx.chartInstance = new Chart(ctx, {
        type: type,
        data: dataConfig,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

function safeSetText(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
}