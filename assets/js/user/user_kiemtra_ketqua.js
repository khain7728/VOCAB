// ===========================
// LOAD & DISPLAY QUIZ RESULT
// ===========================

console.log('Loading quiz result page...');

// Ngăn người dùng bấm nút Back của trình duyệt
history.pushState(null, null, location.href);
window.addEventListener('popstate', function() {
    history.pushState(null, null, location.href);
    alert('⚠️ Bạn không thể quay lại trang kiểm tra.\n\nVui lòng sử dụng các nút điều hướng trên trang.');
});

// Lấy dữ liệu từ sessionStorage
const resultDataStr = sessionStorage.getItem('quizResult');
console.log('Raw sessionStorage data:', resultDataStr);

if (!resultDataStr) {
    console.error('No quiz result found in sessionStorage');
    alert('Không tìm thấy kết quả kiểm tra!');
    window.location.href = 'chi_tiet_khoa_hoc.html';
} else {
    try {
        const resultData = JSON.parse(resultDataStr);
        console.log('Parsed result data:', resultData);
        displayResult(resultData);
    } catch (error) {
        console.error('Error parsing result data:', error);
        alert('Dữ liệu kết quả không hợp lệ!');
    }
}

function displayResult(data) {
    // Lấy course_id từ data hoặc từ URL nếu không có
    const urlParams = new URLSearchParams(window.location.search);
    const course_id = data.course_id || urlParams.get('course_id') || sessionStorage.getItem('current_course_id');
    const { correct_count, incorrect_count, score } = data;
    
    console.log('Displaying result:', { correct_count, incorrect_count, score, course_id });
    
    // Cập nhật số liệu
    const soCauDungEl = document.getElementById('so_cau_dung');
    const soCauSaiEl = document.getElementById('so_cau_sai');
    const tyLeDungEl = document.getElementById('ty_le_dung');
    
    if (soCauDungEl) soCauDungEl.textContent = correct_count;
    if (soCauSaiEl) soCauSaiEl.textContent = incorrect_count;
    if (tyLeDungEl) tyLeDungEl.textContent = score + '%';
    
    console.log('Updated DOM elements');
    
    // Cập nhật lời khen dựa trên điểm
    const complimentEl = document.getElementById('khen');
    if (complimentEl) {
        if (score >= 90) {
            complimentEl.textContent = '(Xuất sắc!)';
        } else if (score >= 75) {
            complimentEl.textContent = '(Làm tốt lắm!)';
        } else if (score >= 60) {
            complimentEl.textContent = '(Khá đấy!)';
        } else if (score >= 40) {
            complimentEl.textContent = '(Cố gắng lên nhé!)';
        } else {
            complimentEl.textContent = '(Đừng nản! Cùng học lại nhé!)';
        }
    }
    
    // Cập nhật các link
    const quayLaiLink = document.querySelector('#frame_thaotac a[href="!#"]');
    if (quayLaiLink) {
        quayLaiLink.href = `chi_tiet_khoa_hoc.html?id=${course_id}`;
    }
    
    const chiTietLink = document.getElementById('chitietketqua');
    if (chiTietLink) {
        chiTietLink.href = `user_ketquachitiet_kiemtra.html?course_id=${course_id}`;
    }
    
    const hocLaiLink = document.getElementById('quaylaikhoahoc');
    if (hocLaiLink) {
        hocLaiLink.href = `user_hoc_tu_vung.html?course_id=${course_id}`;
    }
    
    console.log('Result display complete');
}

// Script để load menu và header đã có trong HTML