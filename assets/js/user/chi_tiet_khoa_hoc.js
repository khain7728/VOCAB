document.addEventListener('DOMContentLoaded', function() {

    //DỮ LIỆU MẪU

    const CURRENT_USER_NAME = "User";

    const ALL_COURSES_DB = {
        // Trạng thái 1: Chủ sở hữu (ID 1)
        "1": {
            id: 1,
            tieuDe: 'Tiếng Anh cơ bản',
            nguoiTao: 'User',
            soLanOn: 2,
            tienDo: 100, //100%
            words: [
                { id: 101, tiengAnh: 'Hello', nghia: 'Xin chào', mota: 'Mô tả cho từ Hello', linkAm: '' },
                { id: 102, tiengAnh: 'Goodbye', nghia: 'Tạm biệt', mota: 'Mô tả cho từ Goodbye', linkAm: '' },
                { id: 103, tiengAnh: 'Thank you', nghia: 'Cảm ơn', mota: 'Mô tả cho từ Thank you', linkAm: '' }
            ]
        },
        // Trạng thái 2: Người lạ (ID 2)
        "2": {
            id: 2,
            tieuDe: 'Khóa của Mino (Chưa tham gia)',
            nguoiTao: 'Mino',
            soLanOn: 0,
            tienDo: 0, // <-- Tiến độ 0
            words: [
                { id: 201, tiengAnh: 'Apple', nghia: 'Quả táo', mota: '', linkAm: '' },
                { id: 202, tiengAnh: 'Banana', nghia: 'Quả chuối', mota: '', linkAm: '' }
            ],
            // Giả lập user chưa tham gia khóa này
            daThamGia: false 
        },
        // Trạng thái 3: Thành viên (ID 4)
        "4": {
            id: 4,
            tieuDe: 'Khóa của Singer (Đã tham gia)',
            nguoiTao: 'Singer',
            soLanOn: 3,
            tienDo: 60, 
            words: [
                { id: 401, tiengAnh: 'Dog', nghia: 'Con chó', mota: '', linkAm: '' },
                { id: 402, tiengAnh: 'Fish', nghia: 'Con cá', mota: '', linkAm: '' }
            ],
            // Giả lập user ĐÃ tham gia khóa này
            daThamGia: true 
        }
    };

    let currentCourseData; // Dữ liệu khóa học sẽ được tìm
    let currentWordList; // Danh sách từ của khóa học đó
    let currentViewState; // Trạng thái (owner, member, non-member)

    const btnTroVe = document.getElementById('btn-tro-ve');
    const btnThemTuVung = document.getElementById('btn-them-tu-vung');
    const btnThemKhoaHoc = document.getElementById('btn-them-khoa-hoc');
    const btnXoaKhoaHoc = document.getElementById('btn-xoa-khoa-hoc');
    const tieuDeChinh = document.getElementById('tieu-de-khoa-hoc-chinh');
    const giatriTacGia = document.getElementById('giatri-tac-gia');
    const giatriTienBo = document.getElementById('giatri-tien-bo');
    const giatriSoLanOn = document.getElementById('giatri-so-lan-on');
    const danhSachContainer = document.getElementById('danh-sach-tu-vung-container');
    const audioPlayer = document.getElementById('audio-player-an');
    const btnHoc = document.getElementById('btn-hoc');
    const btnOnTap = document.getElementById('btn-on-tap');
    const btnKiemTra = document.getElementById('btn-kiem-tra');
    const khungCheMo = document.getElementById('khung-che-mo');
    const modalHoanThanhHoc = document.getElementById('modal-hoan-thanh-hoc');
    const btnModalTiepTuc = document.getElementById('btn-modal-tiep-tuc');
    const btnModalHocLai = document.getElementById('btn-modal-hoc-lai');


    //Hàm chức năng

    function initializePage() {
        // 1. Đọc ID từ URL
        // (Ví dụ: ...chi_tiet_khoa_hoc.html?id=2)
        const urlParams = new URLSearchParams(window.location.search);
        const khoaHocIdFromUrl = urlParams.get('id');

        if (!khoaHocIdFromUrl) {
            alert('Không tìm thấy ID khóa học.');
            window.location.href = 'khoa_hoc_cua_toi.html';
            return;
        }

        // 2. Tìm dữ liệu trong "database"
        currentCourseData = ALL_COURSES_DB[khoaHocIdFromUrl];
        
        if (!currentCourseData) {
            alert('Khóa học không tồn tại!');
            window.location.href = 'khoa_hoc_cua_toi.html';
            return;
        }
        
        currentWordList = currentCourseData.words;

        // 3. Xác định trạng thái
        if (currentCourseData.nguoiTao === CURRENT_USER_NAME) {
            currentViewState = 'owner';
        } else if (currentCourseData.daThamGia) {
            currentViewState = 'member';
        } else {
            currentViewState = 'non-member';
        }

        // 4. Tải dữ liệu lên UI
        loadCourseDetails(currentCourseData, currentViewState);
        renderWordList(currentWordList, currentViewState === 'owner');
    }

    function loadCourseDetails(course, viewState) {
        tieuDeChinh.textContent = course.tieuDe;
        giatriTacGia.textContent = course.tacGia;
        giatriTienBo.textContent = `${course.tienDo}%`;
        giatriSoLanOn.textContent = course.soLanOn;

        // Reset
        btnThemTuVung.classList.add('an');
        btnThemKhoaHoc.classList.add('an');
        btnXoaKhoaHoc.classList.add('an');

        // Hiển thị nút dựa trên viewState
        switch (viewState) {
            case 'owner':
                btnThemTuVung.classList.remove('an');
                btnXoaKhoaHoc.classList.remove('an');
                btnXoaKhoaHoc.innerHTML = '<i class="fa-solid fa-trash-can"></i> Xóa khóa học';
                break;
            case 'non-member':
                btnThemKhoaHoc.classList.remove('an');
                break;
            case 'member':
                btnXoaKhoaHoc.classList.remove('an');
                btnXoaKhoaHoc.innerHTML = '<i class="fa-solid fa-sign-out-alt"></i> Rời khóa học';
                break;
        }
        
        //Ẩn/hiện nút học tập
        if (course.tienDo === 100) {
            //Hiện Học, Kiểm tra. Ẩn Ôn tập.
            btnHoc.classList.remove('an');
            btnKiemTra.classList.remove('an');
            btnOnTap.classList.add('an');
        } else {
            // Chưa hoàn thành: Hiện cả 3 nút
            btnHoc.classList.remove('an');
            btnKiemTra.classList.remove('an');
            btnOnTap.classList.remove('an');
        }
    }

    function renderWordList(wordList, canDeleteWords) {
        danhSachContainer.innerHTML = '';
        if (!wordList || wordList.length === 0) {
            danhSachContainer.innerHTML = '<p class="thong-bao-rong">Chưa có từ vựng nào.</p>';
            return;
        }

        wordList.forEach((tu, index) => {
            const theTuVung = document.createElement('div');
            theTuVung.className = 'the-tu-vung-chi-tiet';
            theTuVung.setAttribute('data-index', index);

            const nutXoaHtml = canDeleteWords
                ? `<button class="nut-icon nut-xoa-tu" data-action="xoa-tu" title="Xóa từ">
                       <i class="fa-solid fa-times"></i>
                   </button>`
                : ''; 

            theTuVung.innerHTML = `
                <div class="thong-tin-tu-chi-tiet">
                    <p class="tu-vung-chinh">${tu.tiengAnh}</p>
                    <p class="nghia-tu">${tu.nghia}</p>
                    <p class="mota-tu">${tu.mota}</p>
                </div>
                <div class="hanh-dong-tu-chi-tiet">
                    <button class="nut-icon nut-phat-am" data-action="phat-am" title="Phát âm">
                        <i class="fa-solid fa-volume-high"></i>
                    </button>
                    ${nutXoaHtml}
                </div>
            `;
            danhSachContainer.appendChild(theTuVung);
        });
    }

    /**
     * Xử lý click trong danh sách (Phát âm, Xóa)
     */
    function handleDanhSachClick(event) {
        const nut = event.target.closest('.nut-icon');
        if (!nut) return;

        const theTuVung = nut.closest('.the-tu-vung-chi-tiet');
        const index = parseInt(theTuVung.getAttribute('data-index'), 10);
        const tu = currentWordList[index]; // Lấy từ 'currentWordList'
        const hanhDong = nut.getAttribute('data-action');

        if (hanhDong === 'phat-am') {
            handlePhatAm(tu);
        }
        
        if (hanhDong === 'xoa-tu') {
            if (confirm(`Bạn có chắc muốn xóa từ "${tu.tiengAnh}" không?`)) {
                currentWordList.splice(index, 1);
                renderWordList(currentWordList, true); 
            }
        }
    }

    function handlePhatAm(tu) {
        if (tu.linkAm) {
            audioPlayer.src = tu.linkAm;
            audioPlayer.play().catch(e => phatAmBangAPI(tu.tiengAnh));
        } else if (tu.tiengAnh && 'speechSynthesis' in window) {
            phatAmBangAPI(tu.tiengAnh);
        } else {
            alert('Không có dữ liệu âm thanh.');
        }
    }
    
    function phatAmBangAPI(text) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    }
    
    function moModalHoanThanh() {
        if (khungCheMo) khungCheMo.classList.remove('an');
        if (modalHoanThanhHoc) modalHoanThanhHoc.classList.remove('an');
    }
    
    function dongModalHoanThanh() {
        if (khungCheMo) khungCheMo.classList.add('an');
        if (modalHoanThanhHoc) modalHoanThanhHoc.classList.add('an');
    }
    //Hành động
    if (btnTroVe) {
        btnTroVe.addEventListener('click', () => {
            window.location.href = 'khoa_hoc_cua_toi.html';
        });
    }

    if (btnHoc) {
        btnHoc.addEventListener('click', () => {
            // Logic nút Học
            if (currentCourseData.tienDo === 100) {
                moModalHoanThanh();
            } else {
                alert(`Chuyển đến trang Học (Flashcard) cho ID: ${currentCourseData.id}...`);
                // window.location.href = `user_hoc_tu_vung.html?id=${currentCourseData.id}`;
            }
        });
    }
    if (btnOnTap) {
        btnOnTap.addEventListener('click', () => alert('Chức năng Ôn tập đang phát triển...'));
    }
    if (btnKiemTra) {
        btnKiemTra.addEventListener('click', () => alert('Chức năng Kiểm tra đang phát triển...'));
    }
    
    if (btnThemTuVung) {
        btnThemTuVung.addEventListener('click', () => {
            // Gửi ID đi
            window.location.href = `them_tu_vung.html?id=${currentCourseData.id}`;
        });
    }
    if (btnThemKhoaHoc) {
        btnThemKhoaHoc.addEventListener('click', () => {
            alert('Đã thêm khóa học vào danh sách của bạn!');
            // Giả lập chuyển sang trạng thái "Thành viên"
            currentViewState = 'member';
            currentCourseData.daThamGia = true; // Cập nhật CSDL giả
            loadCourseDetails(currentCourseData, currentViewState);
        });
    }
    if (btnXoaKhoaHoc) {
        btnXoaKhoaHoc.addEventListener('click', () => {
            let message = (currentViewState === 'owner') 
                ? 'Bạn có chắc muốn XÓA VĨNH VIỄN khóa học này không?'
                : 'Bạn có chắc muốn RỜI KHỎI khóa học này không?';
            
            if (confirm(message)) {
                alert('Đã thực hiện (giả lập)!');
                window.location.href = 'khoa_hoc_cua_toi.html';
            }
        });
    }

    if (danhSachContainer) {
        danhSachContainer.addEventListener('click', handleDanhSachClick);
    }
    
    if (khungCheMo) {
        khungCheMo.addEventListener('click', (e) => {
            if (e.target === khungCheMo) {
                dongModalHoanThanh();
            }
        });
    }
    if (btnModalTiepTuc) {
        // "Tiếp tục học" = "Ôn tập"
        btnModalTiepTuc.addEventListener('click', () => {
            alert('Chuyển đến chức năng Ôn tập...');
            dongModalHoanThanh();
        });
    }
    if (btnModalHocLai) {
        // "Học lại" = Reset tiến độ và đi học
        btnModalHocLai.addEventListener('click', () => {
            alert('Đã reset tiến độ (giả lập)! Bắt đầu học lại...');
            // Logic reset (giả lập):
            currentCourseData.tienDo = 0;
            loadCourseDetails(currentCourseData, currentViewState);
            dongModalHoanThanh();
        });
    }

    // --- 6. Khởi tạo ban đầu ---
    // (CẬP NHẬT) Chạy hàm khởi tạo chính
    initializePage(); 
    
    console.log("Trang Chi tiết khóa học (chi_tiet_khoa_hoc.js) đã tải thành công.");
});