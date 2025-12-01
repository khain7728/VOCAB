document.addEventListener("DOMContentLoaded", function() {
    // 1. Hiển thị ngày hiện tại
    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString('vi-VN');

    // 2. Gọi API
    fetchDashboardStatistics();
});

async function fetchDashboardStatistics() {
    const apiUrl = '../../api/admin/dashboard_get_stats.php';
    try {
        const response = await fetch(apiUrl);
        const result = await response.json();
        if (result.status === 'success') {
            updateDashboardUI(result.data);
        }
    } catch (error) {
        console.error("Lỗi API:", error);
    }
}

function updateDashboardUI(data) {
    // Cập nhật số liệu text
    setTextContent('stats-total-users', data.total_users);
    setTextContent('stats-total-courses', data.total_courses);
    setTextContent('stats-today-activity', data.today_activity);

    // Vẽ danh sách hoạt động
    renderActivityList(data.recent_activities);

    // Vẽ biểu đồ
    renderCharts(data);
}

// Hàm render danh sách log
function renderActivityList(activities) {
    const listContainer = document.getElementById('list-recent-activities');
    if (!listContainer) return;
    if (!activities || activities.length === 0) {
        listContainer.innerHTML = '<li class="activity-item" style="padding:10px;">Chưa có hoạt động nào.</li>';
        return;
    }

    let html = '';
    activities.forEach(item => {
        // Format ngày giờ
        let timeDisplay = item.created_at;
        try {
            const d = new Date(item.created_at);
            timeDisplay = `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')} - ${d.getDate()}/${d.getMonth()+1}`;
        } catch (e) {}

        html += `
            <li class="activity-item">
                <div class="icon-box-small"><i class="fa-solid fa-clock-rotate-left"></i></div>
                <div class="activity-text">
                    <p><strong>${item.admin_name || 'Admin'}</strong> ${item.action}</p>
                    <span>${timeDisplay}</span>
                </div>
            </li>
        `;
    });
    listContainer.innerHTML = html;
}

// --- HÀM VẼ BIỂU ĐỒ (QUAN TRỌNG) ---
function renderCharts(data) {
    if (typeof Chart === 'undefined') return;

    // 1. BIỂU ĐỒ KHÓA HỌC (Bar Chart - Lượt học thực tế)
    const ctxCourse = document.getElementById('chart-popular-courses');
    if (ctxCourse) {
        if (Chart.getChart(ctxCourse)) Chart.getChart(ctxCourse).destroy();

        new Chart(ctxCourse, {
            type: 'bar', // Biểu đồ cột
            data: {
                labels: data.popular_courses.map(i => i.course_name),
                datasets: [{
                    label: 'Lượt tham gia học',
                    data: data.popular_courses.map(i => i.learning_count),
                    backgroundColor: '#FF9F43', // Màu cam
                    borderRadius: 5,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // 2. BIỂU ĐỒ NGƯỜI DÙNG (Line Chart - Tăng trưởng theo tháng)
    const ctxUser = document.getElementById('chart-new-users');
    if (ctxUser) {
        if (Chart.getChart(ctxUser)) Chart.getChart(ctxUser).destroy();

        new Chart(ctxUser, {
            type: 'line', // Biểu đồ đường
            data: {
                labels: data.user_chart.map(i => i.month_year),
                datasets: [{
                    label: 'Thành viên mới',
                    data: data.user_chart.map(i => i.count),
                    borderColor: '#7367F0', // Màu tím
                    backgroundColor: 'rgba(115, 103, 240, 0.1)', // Màu nền mờ dưới đường
                    tension: 0.4, // Đường cong mềm mại
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#7367F0',
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true, position: 'top' } },
                scales: {
                    y: { beginAtZero: true },
                    x: { grid: { display: false } }
                }
            }
        });
    }
}

function setTextContent(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val !== undefined ? val : 0;
}