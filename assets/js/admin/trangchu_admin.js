document.addEventListener("DOMContentLoaded", function() {
    // 1. Hiển thị ngày hiện tại
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        dateEl.innerText = new Date().toLocaleDateString('vi-VN');
    }

    // 2. GỌI API LẤY DỮ LIỆU
    fetchDashboardStatistics();
});

async function fetchDashboardStatistics() {
    // ĐƯỜNG DẪN API (Dựa theo ảnh bạn chụp là dashboard_get_stats.php)
    const apiUrl = '../../api/admin/dashboard_get_stats.php';

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();

        // Kiểm tra dữ liệu trả về từ PHP
        if (result.status === 'success') {
            updateDashboardUI(result.data);
        } else {
            console.error("API báo lỗi:", result.message);
        }

    } catch (error) {
        console.error("Lỗi kết nối API:", error);
    }
}

/**
 * Hàm cập nhật giao diện tổng điều phối
 */
function updateDashboardUI(data) {
    // 1. Cập nhật số liệu thống kê
    setTextContent('stats-total-users', data.total_users);
    setTextContent('stats-total-courses', data.total_courses);
    setTextContent('stats-today-activity', data.today_activity);

    // 2. Render danh sách hoạt động (Hàm này bạn đang thiếu)
    renderActivityList(data.recent_activities);

    // 3. Vẽ biểu đồ (Hàm này có thể bạn cũng thiếu)
    renderCharts(data);
}

/**
 * --- CÁC HÀM PHỤ TRỢ (BẮT BUỘC PHẢI CÓ) ---
 */

// 1. Hàm vẽ danh sách hoạt động
function renderActivityList(activities) {
    const listContainer = document.getElementById('list-recent-activities');
    // Nếu không tìm thấy thẻ ul thì dừng lại tránh lỗi
    if (!listContainer) return;

    // Nếu không có hoạt động
    if (!activities || activities.length === 0) {
        listContainer.innerHTML = '<li class="activity-item" style="padding:10px; color:#999">Chưa có hoạt động nào.</li>';
        return;
    }

    let html = '';
    activities.forEach(item => {
        // Xử lý ngày giờ hiển thị cho đẹp
        let timeDisplay = item.created_at;
        try {
            const dateObj = new Date(item.created_at);
            const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            const dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            timeDisplay = `${timeStr} - ${dateStr}`;
        } catch (e) {}

        html += `
            <li class="activity-item">
                <div class="icon-box-small"><i class="fa-solid fa-info"></i></div>
                <div class="activity-text">
                    <p>
                        <strong>${item.admin_name || 'Admin'}</strong> 
                        ${item.action}
                    </p>
                    <span>${timeDisplay}</span>
                </div>
            </li>
        `;
    });
    listContainer.innerHTML = html;
}

// 2. Hàm vẽ biểu đồ Chart.js
function renderCharts(data) {
    if (typeof Chart === 'undefined') return;

    // --- BIỂU ĐỒ CỘT (Khóa học) ---
    const courseLabels = data.popular_courses ? data.popular_courses.map(item => item.course_name) : [];
    const courseValues = data.popular_courses ? data.popular_courses.map(item => item.student_count) : [];

    const ctxCourse = document.getElementById('chart-popular-courses');
    if (ctxCourse) {
        // Hủy biểu đồ cũ nếu có để tránh lỗi đè hình
        if (Chart.getChart(ctxCourse)) {
            Chart.getChart(ctxCourse).destroy();
        }

        new Chart(ctxCourse, {
            type: 'bar',
            data: {
                labels: courseLabels,
                datasets: [{
                    label: 'Số học viên',
                    data: courseValues,
                    backgroundColor: '#FF9F43', // Màu cam giống ảnh
                    borderRadius: 4,
                    barPercentage: 0.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }

    // --- BIỂU ĐỒ ĐƯỜNG (User mới) ---
    const userLabels = data.user_chart ? data.user_chart.map(item => item.month_year) : [];
    const userValues = data.user_chart ? data.user_chart.map(item => item.count) : [];

    const ctxUser = document.getElementById('chart-new-users');
    if (ctxUser) {
        if (Chart.getChart(ctxUser)) {
            Chart.getChart(ctxUser).destroy();
        }

        new Chart(ctxUser, {
            type: 'line',
            data: {
                labels: userLabels,
                datasets: [{
                    label: 'Thành viên mới',
                    data: userValues,
                    borderColor: '#7367F0', // Màu tím
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#7367F0',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }
}

// 3. Hàm gán text an toàn (tránh lỗi nếu ID không tồn tại)
function setTextContent(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val !== undefined ? val : 0;
}