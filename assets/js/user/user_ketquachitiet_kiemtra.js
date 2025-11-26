// ===========================
// LOAD & DISPLAY DETAILED RESULT
// ===========================

// Lấy dữ liệu từ sessionStorage
const resultData = JSON.parse(sessionStorage.getItem('quizResult'));

if (!resultData) {
    alert('Không tìm thấy kết quả kiểm tra!');
    window.location.href = 'chi_tiet_khoa_hoc.html';
} else {
    displayDetailedResult(resultData);
}

function displayDetailedResult(data) {
    const { userAnswers, score, course_id } = data;
    
    // Cập nhật tỷ lệ đúng ở header
    document.getElementById('tyledung').textContent = score + '%';
    
    // Lấy container main
    const mainContainer = document.getElementById('main');
    
    // Xóa nội dung cũ (giữ lại phần thaotac)
    const thaotacDiv = document.getElementById('thaotac');
    mainContainer.innerHTML = '';
    
    // Render từng câu hỏi
    userAnswers.forEach(answer => {
        const div = document.createElement('div');
        div.className = `frame_chitiet ${answer.is_correct ? 'correct' : 'false'}`;
        
        const word = answer.word;
        
        let html = `
            <div class="frame_tuvung">
                <span class="tuvung">${word.word_en}</span>
                <div class="frame_ipa">
                    <i class="fa-solid fa-volume-high"></i>
                    <span class="ipa">${word.ipa || ''}</span>
                </div>
            </div>
            <p class="tieude_ynghia">Ý nghĩa</p>
            <span class="ynghia">${word.word_vi}</span>
        `;
        
        // Nếu sai, hiển thị đáp án của user
        if (!answer.is_correct) {
            html += `
                <div class="dapancuaban">
                    <p class="tieude_dapan">Đáp án của bạn:</p>
                    <span class="dapan">${answer.user_answer}</span>
                </div>
            `;
        }
        
        div.innerHTML = html;
        mainContainer.appendChild(div);
    });
    
    // Thêm lại phần thaotac
    if (thaotacDiv) {
        mainContainer.appendChild(thaotacDiv);
        
        // Cập nhật link
        const quayLaiLink = document.getElementById('quaylaikhoahoc');
        if (quayLaiLink) {
            quayLaiLink.href = `chi_tiet_khoa_hoc.html?course_id=${course_id}`;
        }
        
        const hocLaiLink = document.getElementById('hoclai');
        if (hocLaiLink) {
            hocLaiLink.href = `user_hoc_tu_vung.html?course_id=${course_id}`;
        }
    } else {
        // Tạo mới phần thaotac nếu không có
        const thaotacHTML = `
            <div id="thaotac">
                <a href="chi_tiet_khoa_hoc.html?course_id=${course_id}" id="quaylaikhoahoc">Quay lại khóa học</a>
                <a href="user_hoc_tu_vung.html?course_id=${course_id}" id="hoclai">Học lại với flashcard</a>
            </div>
        `;
        mainContainer.insertAdjacentHTML('beforeend', thaotacHTML);
    }
}

// Thêm event listener cho icon speaker (phát âm thanh)
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('fa-volume-high')) {
        const word = e.target.closest('.frame_tuvung').querySelector('.tuvung').textContent;
        speakWord(word);
    }
});

function speakWord(word) {
    // Sử dụng Web Speech API để phát âm
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8; // Tốc độ chậm hơn một chút
        window.speechSynthesis.speak(utterance);
    } else {
        console.log('Trình duyệt không hỗ trợ phát âm');
    }
}