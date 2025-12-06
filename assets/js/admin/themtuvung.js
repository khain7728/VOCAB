document.addEventListener('DOMContentLoaded', function() {

    const API_BASE_URL = 'http://localhost/VOCAB/api';
    const urlParams = new URLSearchParams(window.location.search);
    const COURSE_ID = urlParams.get('id');


    // Tạo container chứa các thông báo nếu chưa có
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // --- [MỚI] 2. HÀM HIỂN THỊ THÔNG BÁO ---
    function showToast(message, duration = 2000) {
        const toast = document.createElement('div');
        toast.className = 'toast-msg';
        toast.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${message}`;
        
        toastContainer.appendChild(toast);

        // Hiệu ứng hiện ra
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Tự động ẩn sau 2s (hoặc thời gian tùy chỉnh)
        setTimeout(() => {
            toast.classList.remove('show');
            // Xóa khỏi DOM sau khi hiệu ứng mờ kết thúc
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }
    // -----------------------------------------------------------

    if (!COURSE_ID) {
        alert("Không tìm thấy ID khóa học.");
        window.location.href = 'quanlykhoahoc.html';
        return;
    }

    let danhSachTu = [];

    // DOM ELEMENTS
    const formThemTu = document.getElementById('form-them-tu');
    const btnThemTu = formThemTu.querySelector('button[type="submit"]'); 
    const danhSachContainer = document.getElementById('danh-sach-tu-vung-container');
    const soLuongTuSpan = document.getElementById('so-luong-tu');

    const btnTroVe = document.getElementById('btn-tro-ve');
    const btnHuyBo = document.getElementById('btn-huy-bo');
    const btnLuuVaThoat = document.getElementById('btn-luu-va-thoat');

    const inputTuTiengAnh = document.getElementById('input-tu-tieng-anh');
    const inputPhienAm = document.getElementById('input-phien-am');
    const inputNghiaTiengViet = document.getElementById('input-nghia-tieng-viet');
    const inputTuLoai = document.getElementById('input-tu-loai');
    const inputLinkPhatAm = document.getElementById('input-link-phat-am');
    const inputMoTa = document.getElementById('input-mo-ta');
    const audioPlayer = document.getElementById('audio-player-an');
    
    // Upload Elements
    const linkTaiFileAm = document.getElementById('link-tai-file-am');
    const inputFileAn = document.getElementById('input-file-an');

    // --- HÀM LOAD TỪ VỰNG CŨ TỪ SERVER ---
    async function loadExistingWords() {
        try {
            const response = await fetch(`${API_BASE_URL}/get-words.php?course_id=${COURSE_ID}`);
            const result = await response.json();

            if (result.success && result.data && result.data.words) {
                const wordsFromDB = result.data.words;
                
                const mappedWords = wordsFromDB.map(w => ({
                    tiengAnh: w.word,
                    nghia: w.meaning,
                    phienAm: w.ipa || '',
                    tuLoai: w.part_of_speech || 'noun',
                    linkAm: w.audio || '',
                    moTa: w.definition || '',
                    isExisting: true
                }));

                danhSachTu = [...danhSachTu, ...mappedWords];
                renderDanhSach();
            }
        } catch (error) {
            console.error("Lỗi tải từ vựng cũ:", error);
        }
    }

    // --- RENDER FUNCTION ---
    function renderDanhSach() {
        danhSachContainer.innerHTML = '';

        if (danhSachTu.length === 0) {
            danhSachContainer.innerHTML = '<p class="thong-bao-rong">Chưa có từ vựng nào.</p>';
        } else {
            danhSachTu.forEach((tu, index) => {
                const theTuVung = document.createElement('div');
                theTuVung.className = 'the-tu-vung';
                if (tu.isExisting) theTuVung.classList.add('tu-cu');
                
                theTuVung.setAttribute('data-index', index);

                theTuVung.innerHTML = `
                    <div class="thong-tin-tu">
                        <p class="tu-vung-chinh">
                            ${tu.tiengAnh} 
                            <span style="font-weight:normal; font-size:0.9em">(${tu.tuLoai})</span>
                            ${tu.isExisting ? '<span style="font-size:0.7em; color:green; margin-left:5px">✔ Đã có</span>' : ''}
                        </p>
                        <p class="phien-am-tu">${tu.phienAm}</p>
                        <p class="nghia-tu">${tu.nghia}</p>
                        ${tu.linkAm ? '<i class="fa-solid fa-link" style="font-size:0.8em; color:#888" title="Có link audio"></i>' : ''}
                    </div>
                    <div class="hanh-dong-tu">
                        <button class="nut-icon nut-phat-am" data-action="phat-am" title="Nghe thử">
                            <i class="fa-solid fa-volume-high"></i>
                        </button>
                        <button class="nut-icon nut-xoa-tu" data-action="xoa-tu" title="Xóa">
                            <i class="fa-solid fa-times"></i>
                        </button>
                    </div>
                `;
                danhSachContainer.appendChild(theTuVung);
            });
        }
        
        const count = danhSachTu.length;
        if (count < 3) {
            soLuongTuSpan.innerHTML = `${count} <span style="color:red; font-size:0.8em; margin-left:5px">(Cần tối thiểu 3 từ)</span>`;
            btnLuuVaThoat.disabled = true;
            btnLuuVaThoat.style.opacity = '0.5';
            btnLuuVaThoat.style.cursor = 'not-allowed';
        } else {
            soLuongTuSpan.textContent = count;
            btnLuuVaThoat.disabled = false;
            btnLuuVaThoat.style.opacity = '1';
            btnLuuVaThoat.style.cursor = 'pointer';
        }
    }

    // --- UPLOAD AUDIO ---
    if (linkTaiFileAm && inputFileAn) {
        linkTaiFileAm.addEventListener('click', function(e) {
            e.preventDefault();
            inputFileAn.click();
        });

        inputFileAn.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                uploadAudioFile(this.files[0]);
            }
        });
    }

    async function uploadAudioFile(file) {
        if (file.type !== 'audio/mpeg' && file.type !== 'audio/mp3' && !file.name.endsWith('.mp3')) {
            alert('Vui lòng chỉ chọn file .mp3');
            return;
        }

        const oldText = linkTaiFileAm.textContent;
        linkTaiFileAm.textContent = "Đang tải lên...";
        linkTaiFileAm.style.pointerEvents = "none";
        
        const formData = new FormData();
        formData.append('audio_file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/upload_audio.php`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                inputLinkPhatAm.value = result.url; 
                showToast("Đã tải file lên thành công!"); // Dùng showToast thay alert
            } else {
                alert("Lỗi upload: " + (result.error || "Không xác định"));
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối server khi upload file.");
        } finally {
            linkTaiFileAm.textContent = oldText;
            linkTaiFileAm.style.pointerEvents = "auto";
            inputFileAn.value = '';
        }
    }

    // --- HANDLERS (ĐÃ CẬP NHẬT SHOWTOAST) ---
    function handleThemTu(event) {
        event.preventDefault();

        if (btnThemTu.disabled) return;
        btnThemTu.disabled = true;

        const tuTiengAnh = inputTuTiengAnh.value.trim();
        const phienAm = inputPhienAm.value.trim();
        const nghia = inputNghiaTiengViet.value.trim();
        const tuLoai = inputTuLoai.value.trim() || 'n';
        const linkAm = inputLinkPhatAm.value.trim();
        const moTa = inputMoTa.value.trim();

        if (!tuTiengAnh || !nghia) {
            alert('Vui lòng nhập đầy đủ "Từ tiếng Anh" và "Nghĩa tiếng Việt".');
            btnThemTu.disabled = false;
            return;
        }

        if (linkAm && linkAm.startsWith('http') && !isValidUrl(linkAm)) {
            alert('Link phát âm không hợp lệ.');
            btnThemTu.disabled = false;
            return;
        }

        if (danhSachTu.some(t => t.tiengAnh.toLowerCase() === tuTiengAnh.toLowerCase())) {
            alert('Từ này đã có trong danh sách!');
            btnThemTu.disabled = false;
            return;
        }

        const tuMoi = {
            tiengAnh: tuTiengAnh,
            phienAm: phienAm,
            nghia: nghia,
            tuLoai: tuLoai,
            linkAm: linkAm,
            moTa: moTa,
            isExisting: false 
        };

        danhSachTu.push(tuMoi);
        renderDanhSach();

        showToast(`Đã thêm: <b>${tuTiengAnh}</b>`);
        // ------------------------------------------

        formThemTu.reset();
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        inputTuTiengAnh.focus();

        setTimeout(() => { btnThemTu.disabled = false; }, 300);
    }

    function handleDanhSachClick(event) {
        const nut = event.target.closest('.nut-icon');
        if (!nut) return;

        const theTuVung = nut.closest('.the-tu-vung');
        const index = parseInt(theTuVung.getAttribute('data-index'), 10);
        const tu = danhSachTu[index];
        const hanhDong = nut.getAttribute('data-action');

        if (hanhDong === 'phat-am') handlePhatAm(tu);
        if (hanhDong === 'xoa-tu') {
            if (confirm(`Bạn có chắc muốn xóa từ "${tu.tiengAnh}" không?`)) {
                danhSachTu.splice(index, 1);
                renderDanhSach();
            }
        }
    }

    function handlePhatAm(tu) {
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
        }
        window.speechSynthesis.cancel(); 

        if (tu.linkAm) {
            audioPlayer.src = tu.linkAm; 
            audioPlayer.play().catch(e => {
                phatAmBangAPI(tu.tiengAnh);
            });
        } else if (tu.tiengAnh) {
            phatAmBangAPI(tu.tiengAnh);
        }
    }

    function phatAmBangAPI(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Trình duyệt không hỗ trợ phát âm.");
        }
    }

    function isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch (_) {
            return false;
        }
    }

    // --- SAVE TO SERVER ---
    async function handleLuuVaThoat() {
        if (danhSachTu.length === 0) {
            alert('Danh sách trống.');
            return;
        }

        if (danhSachTu.length < 3) {
            alert(`Bạn mới nhập ${danhSachTu.length} từ. Cần nhập tối thiểu 3 từ.`);
            return;
        }

        if (!confirm(`Bạn sắp lưu ${danhSachTu.length} từ vựng. Tiếp tục?`)) return;

        btnLuuVaThoat.textContent = "Đang lưu...";
        btnLuuVaThoat.disabled = true;

        try {
            // Lưu ý: Đã đổi tên API thành add-word.php như hướng dẫn trước
            const response = await fetch(`${API_BASE_URL}/add-word.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    course_id: COURSE_ID,
                    words: danhSachTu
                })
            });

            const textResult = await response.text();
            let result;
            try {
                result = JSON.parse(textResult);
            } catch (e) {
                console.error("Server error:", textResult);
                throw new Error("Phản hồi server lỗi (không phải JSON).");
            }

            if (result.success) {
                alert(result.message || "Lưu thành công!");
                window.location.href = `quanlykhoahoc.html`;
            } else {
                alert(result.error || "Có lỗi xảy ra.");
                renderDanhSach(); 
                btnLuuVaThoat.textContent = "Lưu & Thoát";
            }

        } catch (error) {
            console.error(error);
            alert("Lỗi: " + error.message);
            renderDanhSach(); 
            btnLuuVaThoat.textContent = "Lưu & Thoát";
        }
    }

    function handleHuyBo() {
        if (danhSachTu.length > 0) {
            if (confirm('Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ mất.')) history.back();
        } else {
            history.back();
        }
    }

    if (formThemTu) formThemTu.addEventListener('submit', handleThemTu);
    if (danhSachContainer) danhSachContainer.addEventListener('click', handleDanhSachClick);
    if (btnTroVe) btnTroVe.addEventListener('click', () => history.back());
    if (btnHuyBo) btnHuyBo.addEventListener('click', handleHuyBo);
    if (btnLuuVaThoat) btnLuuVaThoat.addEventListener('click', handleLuuVaThoat);

    // GỌI HÀM LOAD KHI TRANG SẴN SÀNG
    loadExistingWords();
});