document.addEventListener('DOMContentLoaded', function() {

    // ============================================================
    // 1. CẤU HÌNH & KHỞI TẠO
    // ============================================================
    
    // ⚠️ Đảm bảo đường dẫn API đúng với project của bạn
    const API_BASE_URL = 'http://localhost/VOCAB/api'; 
    
    const urlParams = new URLSearchParams(window.location.search);
    const COURSE_ID = urlParams.get('id');
    const USER_ID = urlParams.get('user_id') || 1;

    if (!COURSE_ID) {
        alert("Không tìm thấy ID khóa học!");
        window.location.href = 'khoa_hoc_cua_toi.html';
        return;
    }

    // --- DOM ELEMENTS ---
    const btnTroVe = document.getElementById('btn-tro-ve');
    const tieuDeChinh = document.getElementById('tieu-de-khoa-hoc-chinh');
    
    // Thông số
    const giatriTacGia = document.getElementById('giatri-tac-gia');
    
    // [QUAN TRỌNG] Đã sửa ID từ 'giatri-tien-bo' thành 'giatri-tien-do' cho khớp với HTML
    const giatriTienBo = document.getElementById('giatri-tien-do'); 
    
    const giatriTongTu = document.getElementById('giatri-so-lan-on'); 
    
    // Nút hành động
    const btnThemTuVung = document.getElementById('btn-them-tu-vung');
    const btnThemKhoaHoc = document.getElementById('btn-them-khoa-hoc'); // Nút Tham gia
    const btnXoaKhoaHoc = document.getElementById('btn-xoa-khoa-hoc');   // Nút Xóa/Rời

    // Container
    const danhSachContainer = document.getElementById('danh-sach-tu-vung-container');
    const khungNutHoc = document.getElementById('khung-nut-hoc');
    
    const btnHoc = document.getElementById('btn-hoc');
    const btnOnTap = document.getElementById('btn-on-tap');
    const btnKiemTra = document.getElementById('btn-kiem-tra');

    const audioPlayer = document.getElementById('audio-player-an');

    let courseData = null;

    // ============================================================
    // 2. GỌI API LẤY DỮ LIỆU
    // ============================================================

    async function fetchCourseDetails() {
        try {
            console.log(`Đang tải chi tiết khóa học ID: ${COURSE_ID}...`);
            const response = await fetch(`${API_BASE_URL}/get-course-details.php?course_id=${COURSE_ID}&user_id=${USER_ID}`);
            const text = await response.text();
            
            try {
                const result = JSON.parse(text);
                if (result.success) {
                    courseData = result.data;
                    renderPage(courseData);
                } else {
                    alert("Lỗi API: " + result.error);
                    danhSachContainer.innerHTML = `<p class="thong-bao-rong">Lỗi: ${result.error}</p>`;
                }
            } catch (e) {
                console.error("Lỗi JSON:", e);
                console.log("Raw Response:", text);
            }
        } catch (error) {
            console.error("Lỗi mạng:", error);
            danhSachContainer.innerHTML = '<p class="thong-bao-rong">Lỗi kết nối server.</p>';
        }
    }

    // ============================================================
    // 3. HÀM HIỂN THỊ (RENDER)
    // ============================================================

    function renderPage(data) {
        const info = data.info;
        const words = data.words;

        // A. Hiển thị thông tin chung
        if(tieuDeChinh) tieuDeChinh.textContent = info.tieuDe;
        if(giatriTacGia) giatriTacGia.textContent = info.nguoiTao;
        
        // Cập nhật Tiến độ (Nếu biến giatriTienBo tìm thấy element)
        if(giatriTienBo) {
            giatriTienBo.textContent = info.tienDo + '%';
        }
        
        if(giatriTongTu) giatriTongTu.textContent = info.soTu;

        // B. Xử lý ẩn/hiện nút bấm dựa trên quyền hạn
        if(btnThemTuVung) btnThemTuVung.classList.add('an');
        if(btnThemKhoaHoc) btnThemKhoaHoc.classList.add('an');
        if(btnXoaKhoaHoc) btnXoaKhoaHoc.classList.add('an');
        if(khungNutHoc) khungNutHoc.classList.add('an'); 

        if (info.isOwner) {
            // --- LÀ CHỦ SỞ HỮU ---
            if(btnThemTuVung) btnThemTuVung.classList.remove('an');
            if(btnXoaKhoaHoc) {
                btnXoaKhoaHoc.classList.remove('an');
                btnXoaKhoaHoc.innerHTML = '<i class="fa-solid fa-trash-can"></i> Xóa khóa học';
            }
            if(khungNutHoc) khungNutHoc.classList.remove('an'); 
        } else {
            // --- LÀ NGƯỜI KHÁC ---
            if (info.isJoined) {
                // Đã tham gia
                if(btnXoaKhoaHoc) {
                    btnXoaKhoaHoc.classList.remove('an');
                    btnXoaKhoaHoc.innerHTML = '<i class="fa-solid fa-sign-out-alt"></i> Rời khóa học';
                }
                if(khungNutHoc) khungNutHoc.classList.remove('an'); 
            } else {
                // Chưa tham gia
                if(btnThemKhoaHoc) btnThemKhoaHoc.classList.remove('an');
            }
        }

        // C. Logic hiển thị nút Ôn tập / Kiểm tra
        // Luôn hiện nút, nhưng sẽ check điều kiện khi click
        if (info.tienDo >= 100) {
            // Nếu học 100% -> chỉ hiện nút Kiểm tra
            if(btnOnTap) btnOnTap.style.display = 'none';
            if(btnKiemTra) btnKiemTra.style.display = 'inline-block';
        } else {
            // Nếu chưa 100% -> hiện nút Ôn tập
            if(btnOnTap) btnOnTap.style.display = 'inline-block';
            if(btnKiemTra) btnKiemTra.style.display = 'none';
        }

        // D. Hiển thị danh sách từ vựng
        renderWordList(words, info.isOwner);
    }

    function renderWordList(words, canEdit) {
        if(!danhSachContainer) return;
        danhSachContainer.innerHTML = '';
        
        if (words.length === 0) {
            danhSachContainer.innerHTML = '<p class="thong-bao-rong" style="text-align:center; padding:20px; color:#666">Chưa có từ vựng nào trong khóa học này.</p>';
            return;
        }

        words.forEach(word => {
            const div = document.createElement('div');
            div.className = 'the-tu-vung-chi-tiet';
            
            const audioSrc = word.audio_file ? word.audio_file : '';
            
            const btnXoaHtml = canEdit 
                ? `<button class="nut-icon nut-xoa-tu" title="Xóa từ" onclick="deleteWord(${word.word_id})"><i class="fa-solid fa-times"></i></button>` 
                : '';

            div.innerHTML = `
                <div class="thong-tin-tu-chi-tiet">
                    <p class="tu-vung-chinh">${word.word_en} <span style="font-size:0.8em; font-weight:normal; color:#666">(${word.part_of_speech || ''})</span></p>
                    <p class="phien-am-tu" style="font-size:0.9em; color:#888">${word.pronunciation || ''}</p>
                    <p class="nghia-tu">${word.word_vi}</p>
                    <p class="mota-tu">${word.definition || ''}</p>
                </div>
                <div class="hanh-dong-tu-chi-tiet">
                    <button class="nut-icon nut-phat-am" onclick="playAudio('${word.word_en}', '${audioSrc}')" title="Phát âm">
                        <i class="fa-solid fa-volume-high"></i>
                    </button>
                    ${btnXoaHtml}
                </div>
            `;
            danhSachContainer.appendChild(div);
        });
    }

    // ============================================================
    // 4. CÁC HÀM XỬ LÝ (Global)
    // ============================================================
    
    window.playAudio = function(text, fileSrc) {
        if (fileSrc && fileSrc.trim() !== '') {
            audioPlayer.src = fileSrc;
            audioPlayer.play().catch(e => {
                console.warn("File lỗi, dùng TTS thay thế");
                speakTTS(text);
            });
        } else {
            speakTTS(text);
        }
    };

    function speakTTS(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Trình duyệt không hỗ trợ phát âm.");
        }
    }

    window.deleteWord = async function(wordId) {
        if (!confirm("Bạn có chắc chắn muốn xóa từ này?")) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/delete-word.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: USER_ID, word_id: wordId })
            });

            const result = await response.json();

            if (result.success) {
                alert("Đã xóa từ vựng!");
                fetchCourseDetails(); 
            } else {
                alert("Lỗi: " + result.error);
            }
        } catch (e) {
            console.error(e);
            alert("Lỗi kết nối server.");
        }
    };

    // ============================================================
    // 5. SỰ KIỆN NÚT BẤM
    // ============================================================

    if (btnTroVe) btnTroVe.addEventListener('click', () => window.location.href = 'khoa_hoc_cua_toi.html');

    if (btnThemTuVung) {
        btnThemTuVung.addEventListener('click', () => {
            window.location.href = `them_tu_vung.html?id=${COURSE_ID}&user_id=${USER_ID}`;
        });
    }

    if (btnXoaKhoaHoc) {
        btnXoaKhoaHoc.addEventListener('click', async () => {
            const isOwner = courseData.info.isOwner;
            const action = isOwner ? 'delete' : 'leave';
            const msg = isOwner ? 'Xóa vĩnh viễn khóa học này?' : 'Rời khỏi khóa học này?';
            
            if (confirm(msg)) {
                try {
                    const response = await fetch(`${API_BASE_URL}/delete-course.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: USER_ID, course_id: COURSE_ID, action: action })
                    });
                    const res = await response.json();
                    if (res.success) {
                        alert(res.message);
                        window.location.href = 'khoa_hoc_cua_toi.html';
                    } else {
                        alert("Lỗi: " + res.error);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        });
    }

    if (btnThemKhoaHoc) {
        btnThemKhoaHoc.addEventListener('click', async () => {
            if (confirm("Bạn có muốn tham gia khóa học này?")) {
                try {
                    const response = await fetch(`${API_BASE_URL}/join-course.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: USER_ID, course_id: COURSE_ID })
                    });
                    const res = await response.json();
                    if (res.success) {
                        alert("Tham gia thành công!");
                        fetchCourseDetails(); 
                    } else {
                        alert(res.error);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        });
    }

    const gotoStudy = (page) => {
        window.location.href = `${page}?course_id=${COURSE_ID}&user_id=${USER_ID}`;
    };
    
    // Hàm kiểm tra điều kiện ôn tập/kiểm tra
    async function checkAndNavigate(page) {
        try {
            const response = await fetch(`${API_BASE_URL}/get-words.php?course_id=${COURSE_ID}&user_id=${USER_ID}`);
            const result = await response.json();
            
            if (result.success) {
                const learnedCount = result.data.statistics.learned;
                
                if (learnedCount < 2) {
                    alert('Bạn cần học ít nhất 2 từ vựng trước khi có thể ôn tập hoặc kiểm tra!\n\nHãy học thêm từ vựng để mở khóa tính năng này.');
                    return;
                }
                
                gotoStudy(page);
            } else {
                alert('Không thể tải thông tin khóa học. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Lỗi kết nối. Vui lòng thử lại!');
        }
    }
    
    if (btnHoc) btnHoc.addEventListener('click', () => gotoStudy('user_hoc_tu_vung.html'));
    if (btnOnTap) btnOnTap.addEventListener('click', () => checkAndNavigate('user_hinh_thuc_on_tap.html'));
    if (btnKiemTra) btnKiemTra.addEventListener('click', () => checkAndNavigate('user_kiem_tra.html'));

    // --- INIT ---
    fetchCourseDetails();
});