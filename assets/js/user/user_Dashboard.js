/**
 * USER DASHBOARD - JavaScript
 * Xử lý tải dữ liệu và hiển thị dashboard cho người dùng
 */

// API Base URL
const API_BASE = '../../api';

// Lấy user_id từ session
let currentUserId = null;

/**
 * Khởi tạo user_id từ session
 */
async function initializeUser() {
    try {
        const response = await fetch(`${API_BASE}/get-session-user.php`);
        const result = await response.json();
        
        if (result.success) {
            currentUserId = result.user_id;
            console.log('✅ Loaded user_id from session:', currentUserId);
            
            // Lưu vào localStorage để dùng cho các request tiếp theo
            localStorage.setItem('user_id', currentUserId);
            localStorage.setItem('user_name', result.name);
            localStorage.setItem('user_role', result.role);
        } else {
            console.error('❌ Not logged in');
            alert('Vui lòng đăng nhập');
            window.location.href = '../dangnhap.html';
        }
    } catch (error) {
        console.error('❌ Error getting session:', error);
        // Fallback to localStorage
        currentUserId = localStorage.getItem('user_id');
        if (!currentUserId) {
            alert('Vui lòng đăng nhập lại');
            window.location.href = '../dangnhap.html';
        }
    }
}

/**
 * Load thống kê dashboard
 */
async function loadDashboardStats() {
    try {
        console.log('Fetching dashboard stats for user:', currentUserId);
        const response = await fetch(`${API_BASE}/get-dashboard-stats.php?user_id=${currentUserId}`);
        
        // Kiểm tra response status
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Lấy raw text trước để debug
        const text = await response.text();
        console.log('Raw response:', text);
        
        // Parse JSON
        let result;
        try {
            result = JSON.parse(text);
        } catch (parseError) {
            console.error('❌ JSON Parse Error. Raw response:', text);
            alert('Server trả về dữ liệu không hợp lệ. Kiểm tra console để xem chi tiết.');
            return;
        }
        
        console.log('Dashboard stats result:', result);

        if (result.success) {
            const data = result.data;
            
            // Kiểm tra các element tồn tại trước khi cập nhật
            const welcomeEl = document.getElementById('welcome-message');
            const coursesEl = document.getElementById('total-courses');
            const wordsEl = document.getElementById('total-words');
            const scoreEl = document.getElementById('avg-score');
            
            if (welcomeEl) welcomeEl.textContent = `Chào mừng bạn trở lại, ${data.user_name}`;
            if (coursesEl) coursesEl.textContent = data.total_courses;
            if (wordsEl) wordsEl.textContent = data.total_words_learned;
            if (scoreEl) scoreEl.textContent = `${data.average_score}/10`;
            
            console.log('✅ Dashboard stats loaded successfully');
        } else {
            console.error('❌ Lỗi API:', result.error);
            alert('Lỗi khi tải thống kê: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('❌ Lỗi kết nối API get-dashboard-stats:', error);
        console.error('Error details:', error.message);
        alert('Không thể kết nối đến server. Vui lòng kiểm tra console.');
    }
}

/**
 * Load khóa học của người dùng
 */
async function loadMyCourses() {
    try {
        const response = await fetch(`${API_BASE}/get-my-courses.php?user_id=${currentUserId}`);
        const result = await response.json();

        if (result.success) {
            const courses = result.data || [];
            const coursesGrid = document.getElementById('courses-grid');
            
            if (courses.length === 0) {
                coursesGrid.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #999; grid-column: 1 / -1;">
                        <i class="fa-solid fa-book-open" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;"></i>
                        <p>Bạn chưa có khóa học nào. Hãy tạo hoặc tham gia khóa học!</p>
                    </div>
                `;
                return;
            }
            
            // Hiển thị tối đa 3 khóa học
            const displayCourses = courses.slice(0, 3);
            let html = '';
            
            displayCourses.forEach(course => {
                html += `
                    <div class="course-card">
                        <h3 class="course-title">${escapeHtml(course.tieuDe)}</h3>
                        <p class="course-description">${escapeHtml(course.mota || 'Chưa có mô tả')}</p>
                        <div style="font-size: 12px; color: #666; margin: 8px 0;">
                            <i class="fa-solid fa-book"></i> ${course.soTu} từ &nbsp;|&nbsp; 
                            <i class="fa-solid fa-users"></i> ${course.hocVien} học viên
                        </div>
                        <div class="progress-section">
                            <div class="progress-label">
                                <span>Hoàn thành</span>
                                <span>${course.tienDo}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${course.tienDo}%"></div>
                            </div>
                        </div>
                        <button class="btn-continue" onclick="goToCourse(${course.id})">
                            ${course.tienDo === 0 ? 'Bắt đầu học' : 'Tiếp tục học'}
                        </button>
                    </div>
                `;
            });
            
            // Thêm nút xem tất cả nếu có nhiều hơn 3 khóa học
            if (courses.length > 3) {
                html += `
                    <div class="more-card" onclick="window.location.href='khoa_hoc_cua_toi.html'" style="cursor: pointer;">
                        <i class="fa-solid fa-arrow-right"></i>
                        <p>Xem tất cả ${courses.length} khóa học</p>
                    </div>
                `;
            }
            
            coursesGrid.innerHTML = html;
        } else {
            console.error('Lỗi khi tải khóa học:', result.error);
        }
    } catch (error) {
        console.error('Lỗi kết nối API:', error);
    }
}

/**
 * Load mục tiêu hàng ngày
 */
async function loadDailyGoal() {
    try {
        console.log('Fetching daily goal for user:', currentUserId);
        const response = await fetch(`${API_BASE}/get-daily-goal.php?user_id=${currentUserId}`);
        
        // Kiểm tra response status
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Lấy raw text trước để debug
        const text = await response.text();
        console.log('Raw response:', text);
        
        // Parse JSON
        let result;
        try {
            result = JSON.parse(text);
        } catch (parseError) {
            console.error('❌ JSON Parse Error. Raw response:', text);
            alert('Server trả về dữ liệu không hợp lệ cho daily goal. Kiểm tra console.');
            return;
        }
        
        console.log('Daily goal result:', result);

        if (result.success) {
            const data = result.data;
            
            const noGoalCard = document.getElementById('no-goal-card');
            const hasGoalCard = document.getElementById('has-goal-card');
            const streakBadge = document.getElementById('streak-badge');
            const streakDaysEl = document.getElementById('streak-days');
            
            // Kiểm tra elements tồn tại
            if (!noGoalCard || !hasGoalCard) {
                console.error('❌ Goal card elements not found in DOM');
                return;
            }
            
            // Hiển thị streak nếu có
            if (data.streak_days && data.streak_days > 0) {
                if (streakBadge) streakBadge.style.display = 'flex';
                if (streakDaysEl) streakDaysEl.textContent = data.streak_days;
            }
            
            if (data.has_goal) {
                // Hiển thị mục tiêu hiện tại
                noGoalCard.style.display = 'none';
                hasGoalCard.style.display = 'block';
                
                // Cập nhật tiêu đề
                const goalTitle = `Học ${data.daily_target} từ hôm nay${data.is_recurring ? ' (Lặp lại hàng ngày)' : ''}`;
                const goalSubtitle = `Đã học ${data.words_learned_today}/${data.daily_target} từ hôm nay`;
                
                const goalTitleEl = document.getElementById('goal-title');
                const goalSubtitleEl = document.getElementById('goal-subtitle');
                const goalPercentEl = document.getElementById('goal-progress-percent');
                const goalBarEl = document.getElementById('goal-progress-bar');
                
                if (goalTitleEl) goalTitleEl.textContent = goalTitle;
                if (goalSubtitleEl) goalSubtitleEl.textContent = goalSubtitle;
                if (goalPercentEl) goalPercentEl.textContent = `${data.progress_percent}%`;
                if (goalBarEl) goalBarEl.style.width = `${data.progress_percent}%`;
                
                console.log('✅ Daily goal loaded:', data);
            } else {
                // Chưa có mục tiêu
                noGoalCard.style.display = 'block';
                hasGoalCard.style.display = 'none';
                console.log('ℹ️ User has no goal set');
            }
        } else {
            console.error('❌ Lỗi API:', result.error);
            alert('Lỗi khi tải mục tiêu: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('❌ Lỗi kết nối API get-daily-goal:', error);
        console.error('Error details:', error.message);
        alert('Không thể tải mục tiêu. Vui lòng kiểm tra console.');
    }
}

/**
 * Hiển thị modal thiết lập mục tiêu
 */
function showGoalModal() {
    const modal = document.getElementById('goal-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * Ẩn modal thiết lập mục tiêu
 */
function hideGoalModal() {
    const modal = document.getElementById('goal-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Lưu mục tiêu học hàng ngày
 */
async function saveGoal() {
    const dailyTarget = parseInt(document.getElementById('goal-input').value);
    const isRecurring = document.getElementById('recurring-checkbox').checked ? 1 : 0;
    
    // Validate
    if (!dailyTarget || dailyTarget < 1 || dailyTarget > 1000) {
        alert('Vui lòng nhập số từ từ 1 đến 1000');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/save-daily-goal.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: currentUserId,
                daily_words_target: dailyTarget,
                is_recurring: isRecurring
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đã lưu mục tiêu thành công!');
            hideGoalModal();
            // Reload mục tiêu
            loadDailyGoal();
        } else {
            alert('Lỗi: ' + result.error);
        }
    } catch (error) {
        console.error('Lỗi khi lưu mục tiêu:', error);
        alert('Không thể kết nối đến server');
    }
}

/**
 * Chuyển đến trang chi tiết khóa học
 */
function goToCourse(courseId) {
    localStorage.setItem('selected_course_id', courseId);
    window.location.href = `chi_tiet_khoa_hoc.html?id=${courseId}`;
}

/**
 * Escape HTML để tránh XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Load thống kê quiz theo tuần và vẽ chart
 */
async function loadWeeklyQuizStats() {
    try {
        const response = await fetch(`${API_BASE}/get-weekly-quiz-stats.php?user_id=${currentUserId}`);
        const text = await response.text();
        
        let result;
        try {
            result = JSON.parse(text);
        } catch (parseError) {
            console.error('❌ JSON Parse Error for weekly stats:', text);
            return;
        }
        
        if (result.success && result.data) {
            drawWeeklyChart(result.data);
            console.log('✅ Weekly quiz stats loaded:', result.data);
        }
    } catch (error) {
        console.error('❌ Error loading weekly quiz stats:', error);
    }
}

/**
 * Vẽ biểu đồ tuần
 */
function drawWeeklyChart(weekData) {
    const svgNS = "http://www.w3.org/2000/svg";
    const chartSVG = document.querySelector('.chart');
    
    if (!chartSVG || weekData.length === 0) return;
    
    // Clear existing chart data (keep grid)
    const existingPolyline = chartSVG.querySelector('polyline');
    const existingCircles = chartSVG.querySelectorAll('circle');
    const existingLabels = chartSVG.querySelectorAll('.data-label, .x-label');
    
    if (existingPolyline) existingPolyline.remove();
    existingCircles.forEach(c => c.remove());
    existingLabels.forEach(l => l.remove());
    
    // Calculate positions
    const startX = 70;
    const spacing = 95;
    const maxY = 250;
    const minY = 50;
    const maxScore = 10; // Điểm tối đa là 10
    
    let points = [];
    
    weekData.forEach((day, index) => {
        const x = startX + (index * spacing);
        const score = day.avg_score || 0;
        const y = maxY - ((score / maxScore) * (maxY - minY));
        
        points.push(`${x},${y}`);
        
        // Draw circle
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '5');
        circle.setAttribute('fill', '#4A90E2');
        chartSVG.appendChild(circle);
        
        // Draw score label above point
        if (score > 0) {
            const label = document.createElementNS(svgNS, 'text');
            label.setAttribute('x', x);
            label.setAttribute('y', y - 10);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', '12');
            label.setAttribute('fill', '#4A90E2');
            label.setAttribute('class', 'data-label');
            label.textContent = score.toFixed(1);
            chartSVG.appendChild(label);
        }
        
        // Draw x-axis label (day name)
        const xLabel = document.createElementNS(svgNS, 'text');
        xLabel.setAttribute('x', x);
        xLabel.setAttribute('y', '270');
        xLabel.setAttribute('text-anchor', 'middle');
        xLabel.setAttribute('font-size', '12');
        xLabel.setAttribute('fill', '#666');
        xLabel.setAttribute('class', 'x-label');
        xLabel.textContent = day.day_name;
        chartSVG.appendChild(xLabel);
    });
    
    // Draw polyline
    const polyline = document.createElementNS(svgNS, 'polyline');
    polyline.setAttribute('points', points.join(' '));
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', '#4A90E2');
    polyline.setAttribute('stroke-width', '3');
    polyline.setAttribute('stroke-linecap', 'round');
    polyline.setAttribute('stroke-linejoin', 'round');
    chartSVG.appendChild(polyline);
}

/**
 * Khởi tạo khi trang load
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Khởi tạo user từ session trước
    await initializeUser();
    
    // Sau đó load tất cả dữ liệu
    loadDashboardStats();
    loadMyCourses();
    loadDailyGoal();
    loadWeeklyQuizStats();
    
    // Đóng modal khi click bên ngoài
    const modal = document.getElementById('goal-modal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideGoalModal();
        }
    });
});
