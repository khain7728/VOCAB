// =====================================================
// TRANG KẾT QUẢ ÔN TẬP - CẬP NHẬT NỘI DUNG TEXT
// =====================================================

// Lấy tham số từ URL
const urlParams = new URLSearchParams(window.location.search);
const COURSE_ID = urlParams.get('course_id') || 1;
const USER_ID = urlParams.get('user_id') || 1;

/**
 * Lấy kết quả từ sessionStorage
 */
function getResults() {
    const resultsJson = sessionStorage.getItem('review_results');
    
    if (!resultsJson) {
        // Nếu không có kết quả, chuyển về trang chọn hình thức
        window.location.href = `user_hinh_thuc_on_tap.html?course_id=${COURSE_ID}&user_id=${USER_ID}`;
        return null;
    }
    
    return JSON.parse(resultsJson);
}

/**
 * Hiển thị kết quả - CHỈ CẬP NHẬT TEXT, KHÔNG THAY ĐỔI HTML/CSS
 */
function displayResults() {
    const results = getResults();
    if (!results) return;
    
    // const { type, total, correct, score } = results;
    
    // // Tên hình thức ôn tập
    // const typeNames = {
    //     'multiple-choice': 'Trắc nghiệm',
    //     'fill-in': 'Điền từ',
    //     'flashcard': 'Flashcard'
    // };
    
    // // Lời khen dựa vào điểm
    // let congratsMessage = '';
    // let encouragement = '';
    
    // if (score >= 90) {
    //     congratsMessage = 'Xuất sắc!';
    //     encouragement = '🌟 Bạn thật tuyệt vời!';
    // } else if (score >= 75) {
    //     congratsMessage = 'Làm tốt lắm!';
    //     encouragement = '👍 Tiếp tục phát huy nhé!';
    // } else if (score >= 60) {
    //     congratsMessage = 'Khá đấy!';
    //     encouragement = '😊 Cố gắng hơn nữa!';
    // } else if (score >= 40) {
    //     congratsMessage = 'Cần cố gắng hơn!';
    //     encouragement = '💪 Đừng bỏ cuộc!';
    // } else {
    //     congratsMessage = 'Hãy ôn lại nhé!';
    //     encouragement = '📚 Luyện tập nhiều hơn sẽ tiến bộ!';
    // }
    
    // Cập nhật các phần tử có sẵn trong HTML
    const thongbaoHoanThanh = document.getElementById('thongbaohoanthanh');
    const khenNgoi = document.getElementById('khen');
    
    if (thongbaoHoanThanh) {
        thongbaoHoanThanh.textContent = `${congratsMessage} - Hoàn thành ôn tập ${typeNames[type]}`;
    }
    
    if (khenNgoi) {
        khenNgoi.textContent = encouragement;
    }
    
    // Thêm thông tin chi tiết (không thay đổi cấu trúc HTML)
    // const hoanthanhDiv = document.getElementById('hoanthanhontap');
    // if (hoanthanhDiv) {
    //     hoanthanhDiv.innerHTML = `
    //         <div style="text-align: center; padding: 1rem;">
    //             <div style="font-size: 3rem; margin: 1rem 0;">
    //                 ${score >= 80 ? '🏆' : score >= 60 ? '⭐' : '📖'}
    //             </div>
    //             <div style="display: flex; justify-content: center; gap: 2rem; margin-top: 1.5rem;">
    //                 <div>
    //                     <div style="font-size: 2rem; font-weight: bold; color: #2F80ED;">${score}%</div>
    //                     <div style="color: #666; font-size: 0.9rem;">Điểm số</div>
    //                 </div>
    //                 <div>
    //                     <div style="font-size: 2rem; font-weight: bold; color: #27AE60;">${correct}/${total}</div>
    //                     <div style="color: #666; font-size: 0.9rem;">Đúng</div>
    //                 </div>
    //                 <div>
    //                     <div style="font-size: 2rem; font-weight: bold; color: #FF0404;">${total - correct}</div>
    //                     <div style="color: #666; font-size: 0.9rem;">Sai</div>
    //                 </div>
    //             </div>
    //         </div>
    //     `;
    // }
    
    // Cập nhật các link hành động
    updateActionLinks();
}

/**
 * Cập nhật các link hành động
 */
function updateActionLinks() {
    const actionLinks = document.querySelectorAll('.hanhdong');
    
    if (actionLinks[0]) {
        // Trang chủ
        actionLinks[0].href = `user_Dashboard.html?user_id=${USER_ID}`;
    }
    
    if (actionLinks[1]) {
        // Khóa học
        actionLinks[1].href = `khoa_hoc_cua_toi.html?user_id=${USER_ID}`;
    }
    
    if (actionLinks[2]) {
        // Luyện tập lại
        actionLinks[2].href = `user_hinh_thuc_on_tap.html?course_id=${COURSE_ID}&user_id=${USER_ID}`;
    }
}

/**
 * Hiệu ứng confetti đơn giản (không cần thư viện)
 */
function showConfetti() {
    const results = getResults();
    if (!results) return;
    
    // Chỉ hiển thị cho điểm cao
    if (results.score >= 80) {
        console.log('🎉 Xuất sắc!');
        // Có thể thêm hiệu ứng đơn giản bằng CSS animations
    }
}

// =====================================================
// INITIALIZATION
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    displayResults();
    showConfetti();
});