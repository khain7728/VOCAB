
document.addEventListener('DOMContentLoaded', function() {
// Data user mẫu
    const mockUserData = {
        name: "Nguyễn Văn A",
        email: "nguyenvana123@gmail.com",
        bio: "Đang học tiếng anh để phát triển sự nghiệp",
        language: "Tiếng anh",
        level: "Trung cấp",
        joinDate: "16/10/2025"
    };
//Data thành tích mẫu 
    const mockAchievementData = [
        { title: 'Người mới bắt đầu', description: 'Hoàn thành khóa học đầu tiên' },
        { title: 'Học viên chăm chỉ', description: 'Học 7 ngày liên tiếp' },
        { title: 'Chuyên gia từ vựng', description: 'Học 500 từ vựng' },
        { title: 'Bậc thầy Ngữ pháp', description: 'Hoàn thành 10 bài test ngữ pháp' }
    ];


    // --- 2. Khởi tạo các phần tử DOM
    
    const btnChinhSua = document.getElementById('btn-chinhsua')
    // Cache các trường dữ liệu
    const userNameField = document.getElementById('ten-user');
    const userBioField = document.getElementById('tieu-su-user');
    const userLanguageField = document.getElementById('ngonngu');
    const userLevelField = document.getElementById('trinhdo');
    const userEmail = document.getElementById('email-user');
    const userJoinDate = document.getElementById('ngay-tham-gia');
    const achievementGrid = document.getElementById('noidung-thanhtich');

    // Mảng các trường có thể sửa
    const editableFields = [
        userNameField,
        userBioField,
        userLanguageField,
        userLevelField
    ];

    // Biến trạng thái (giữ nguyên)
    let isEditing = false; 

    //Hàm chức năng (Cập nhật class .save-mode

    function toggleEditMode() {
        isEditing = !isEditing;

        if (isEditing) {
            btnChinhSua.textContent = 'Lưu thay đổi';
            btnChinhSua.classList.add('che-do-luu'); 

            editableFields.forEach(field => {
                if (field) {
                    field.setAttribute('contenteditable', 'true');
                }
            });

            if (userNameField) {
                userNameField.focus();
            }

        } else {
            btnChinhSua.textContent = 'Chỉnh sửa';
            btnChinhSua.classList.remove('che-do-luu');

            editableFields.forEach(field => {
                if (field) {
                    field.setAttribute('contenteditable', 'false');
                    field.textContent = field.textContent.trim(); 
                }
            });

            const updatedData = {
                name: userNameField.textContent,
                bio: userBioField.textContent,
                language: userLanguageField.textContent,
                level: userLevelField.textContent
            };
            
            console.log('Đang gửi dữ liệu lên server:', updatedData);
            alert('Đã lưu thông tin!');
        }
    }
    
    // (Cập nhật các ID để load data)
    function loadUserData() {
        if(userNameField) userNameField.textContent = mockUserData.name;
        if(userBioField) userBioField.textContent = mockUserData.bio;
        if(userLanguageField) userLanguageField.textContent = mockUserData.language;
        if(userLevelField) userLevelField.textContent = mockUserData.level;
        if(userEmail) userEmail.textContent = mockUserData.email;
        if(userJoinDate) userJoinDate.textContent = mockUserData.joinDate;
    }

    // (Cập nhật các class do JS tạo ra)
    function renderAchievements() {
        if (!achievementGrid) return; 

        achievementGrid.innerHTML = ''; 

        mockAchievementData.forEach(ach => {
            // 1. Tạo thẻ cha
            const card = document.createElement('div');
            card.className = 'the-thanh-tich'; 

            // 2. Tạo icon
            const badge = document.createElement('div');
            badge.className = 'icon-huy-hieu';
            badge.innerHTML = '<i class="fa-solid fa-medal"></i>'; 

            // 3. Tạo tiêu đề
            const title = document.createElement('p');
            title.className = 'tieu-de-thanh-tich';
            title.textContent = ach.title;

            // 4. Tạo mô tả
            const desc = document.createElement('p');
            desc.className = 'mota-thanh-tich';
            desc.textContent = ach.description;

            // 5. Gắn các phần tử con vào thẻ cha
            card.appendChild(badge);
            card.appendChild(title);
            card.appendChild(desc);

            // 6. Gắn thẻ cha vào grid
            achievementGrid.appendChild(card);
        });
    }


    // Event Listeners 
    if (btnChinhSua) {
        btnChinhSua.addEventListener('click', toggleEditMode);
    }

    //Khởi tạo
    loadUserData(); 
    renderAchievements();
    
    console.log("Trang hồ sơ người dùng (ho_so_user.js) đã tải thành công.");
});