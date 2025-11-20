document.addEventListener('DOMContentLoaded', function() {
    
    // --- CẤU HÌNH ---
    // Đảm bảo đường dẫn này đúng với thư mục dự án của bạn (ví dụ: VOCAB)
    const API_BASE_URL = 'http://localhost/VOCAB/api'; 
    
    // Lấy ID từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const USER_ID = urlParams.get('user_id') || 1; // Mặc định lấy User 1

    // DOM Elements
    const btnChinhSua = document.getElementById('btn-chinhsua');
    const userNameField = document.getElementById('giatri-ten-user');
    const userBioField = document.getElementById('giatri-tieu-su');
    const userLanguageField = document.getElementById('giatri-ngonngu');
    const userLevelField = document.getElementById('giatri-trinhdo');
    const userEmail = document.getElementById('giatri-email-user');
    const userJoinDate = document.getElementById('giatri-ngay-tham-gia');
    const achievementGrid = document.getElementById('noidung-thanhtich');

    const editableFields = [userNameField, userBioField];
    let isEditing = false;

    // 1. Gọi API lấy dữ liệu
    async function fetchUserProfile() {
        const url = `${API_BASE_URL}/get-user-profile.php?user_id=${USER_ID}`;
        console.log("Đang lấy dữ liệu từ:", url);

        try {
            const response = await fetch(url);
            const text = await response.text();
            
            try {
                const result = JSON.parse(text);
                
                if (result.success) {
                    renderUserProfile(result.data);
                } else {
                    console.error("API lỗi:", result.error);
                    if (userNameField) userNameField.textContent = "Không tìm thấy User";
                }
            } catch (e) {
                console.error("Lỗi JSON:", e);
                console.log("Response text:", text); // Xem lỗi PHP nếu có
            }

        } catch (error) {
            console.error("Lỗi mạng:", error);
        }
    }

    // 2. Hiển thị dữ liệu
    function renderUserProfile(data) {
        const user = data.user;
        const stats = data.statistics;

        if(userNameField) userNameField.textContent = user.fullname;
        if(userBioField) userBioField.textContent = user.bio;
        if(userEmail) userEmail.textContent = user.email;
        if(userJoinDate) userJoinDate.textContent = user.joined_date;
        if(userLanguageField) userLanguageField.textContent = user.language;
        if(userLevelField) userLevelField.textContent = user.level;

        // Render Thành tích từ bảng Statistic
        if (achievementGrid) {
            achievementGrid.innerHTML = '';
            const achievements = [
                { 
                    title: 'Khóa học tham gia', 
                    value: stats.courses_joined, // Lấy từ total_courses
                    desc: 'Tổng số khóa đang học', 
                    icon: 'fa-book-open' 
                },
                { 
                    title: 'Từ vựng đã học', 
                    value: stats.words_learned, // Lấy từ total_words_learned
                    desc: 'Tổng số từ đã thuộc', 
                    icon: 'fa-font' 
                },
                { 
                    title: 'Độ chính xác', 
                    value: stats.accuracy + '%', // Lấy từ accuracy_rate
                    desc: 'Kết quả làm bài kiểm tra', 
                    icon: 'fa-bullseye' 
                },
                { 
                    title: 'Chuỗi ngày học', 
                    value: stats.streak_days + ' ngày', // Lấy từ streak_days
                    desc: 'Học liên tục không nghỉ', 
                    icon: 'fa-fire' 
                },
                { 
                    title: 'Bài Quiz đã làm', 
                    value: stats.quizzes_done, // Lấy từ total_quizzes_done
                    desc: 'Tổng số bài kiểm tra', 
                    icon: 'fa-clipboard-check' 
                }
            ];

            achievements.forEach(ach => {
                const card = document.createElement('div');
                card.className = 'the-thanh-tich';
                card.innerHTML = `
                    <div class="icon-huy-hieu"><i class="fa-solid ${ach.icon}"></i></div>
                    <p class="tieu-de-thanh-tich">${ach.value}</p>
                    <p class="mota-thanh-tich"><strong>${ach.title}</strong><br>${ach.desc}</p>
                `;
                achievementGrid.appendChild(card);
            });
        }
    }

    // 3. Chức năng chỉnh sửa
    async function toggleEditMode() {
        isEditing = !isEditing;
        if (isEditing) {
            btnChinhSua.textContent = 'Lưu thay đổi';
            btnChinhSua.classList.add('che-do-luu');
            editableFields.forEach(f => { if(f) f.setAttribute('contenteditable', 'true'); });
            if(userNameField) userNameField.focus();
        } else {
            btnChinhSua.textContent = 'Chỉnh sửa';
            btnChinhSua.classList.remove('che-do-luu');
            editableFields.forEach(f => { if(f) f.setAttribute('contenteditable', 'false'); });
            
            const newName = userNameField.textContent.trim();
            const newBio = userBioField.textContent.trim();

            try {
                const response = await fetch(`${API_BASE_URL}/update-user-profile.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: USER_ID, fullname: newName, bio: newBio })
                });
                const result = await response.json();
                if(result.success) alert("Cập nhật thành công!");
                else alert("Lỗi: " + result.error);
            } catch (e) {
                console.error(e);
                alert("Lỗi kết nối khi lưu.");
            }
        }
    }

    if (btnChinhSua) {
        btnChinhSua.addEventListener('click', toggleEditMode);
    }

    fetchUserProfile();
});