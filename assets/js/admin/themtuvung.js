document.addEventListener('DOMContentLoaded', function() {

    const API_BASE_URL = 'http://localhost/VOCAB/api';
    const urlParams = new URLSearchParams(window.location.search);
    const COURSE_ID = urlParams.get('id');

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

    // --- [MỚI] HÀM LOAD TỪ VỰNG CŨ TỪ SERVER ---
    async function loadExistingWords() {
        try {
            // Gọi API get-words.php (API này bạn đã cung cấp trước đó)
            const response = await fetch(`${API_BASE_URL}/get-words.php?course_id=${COURSE_ID}`);
            const result = await response.json();

            // Kiểm tra cấu trúc dữ liệu trả về từ get-words.php
            if (result.success && result.data && result.data.words) {
                const wordsFromDB = result.data.words;
                
                // Map dữ liệu từ API (theo key của get-words.php) sang format của JS hiện tại
                // API keys: word, meaning, ipa, part_of_speech, audio, definition
                const mappedWords = wordsFromDB.map(w => ({
                    tiengAnh: w.word,
                    nghia: w.meaning,
                    phienAm: w.ipa || '',
                    tuLoai: w.part_of_speech || 'noun',
                    linkAm: w.audio || '',
                    moTa: w.definition || '',
                    isExisting: true // Đánh dấu là từ đã có (để xử lý UI nếu cần)
                }));

                // Gộp vào danh sách hiện tại
                danhSachTu = [...danhSachTu, ...mappedWords];
                
                console.log(`Đã tải ${mappedWords.length} từ có sẵn.`);
                renderDanhSach(); // Vẽ lại giao diện
            }
        } catch (error) {
            console.error("Lỗi tải từ vựng cũ:", error);
            // Không chặn, vẫn cho người dùng nhập từ mới
        }
    }

    // --- RENDER FUNCTION (CÓ CHECK 3 TỪ) ---
    function renderDanhSach() {
        danhSachContainer.innerHTML = '';

        if (danhSachTu.length === 0) {
            danhSachContainer.innerHTML = '<p class="thong-bao-rong">Chưa có từ vựng nào.</p>';
        } else {
            danhSachTu.forEach((tu, index) => {
                const theTuVung = document.createElement('div');
                theTuVung.className = 'the-tu-vung';
                // Nếu là từ cũ, thêm class để có thể style riêng (tuỳ chọn)
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
        
        // [THÊM] Logic kiểm tra số lượng >= 3
        const count = danhSachTu.length;
        if (count < 3) {
            // Hiện cảnh báo và khóa nút Lưu
            soLuongTuSpan.innerHTML = `${count} <span style="color:red; font-size:0.8em; margin-left:5px">(Cần tối thiểu 3 từ)</span>`;
            btnLuuVaThoat.disabled = true;
            btnLuuVaThoat.style.opacity = '0.5';
            btnLuuVaThoat.style.cursor = 'not-allowed';
        } else {
            // Đủ điều kiện: Mở nút Lưu
            soLuongTuSpan.textContent = count;
            btnLuuVaThoat.disabled = false;
            btnLuuVaThoat.style.opacity = '1';
            btnLuuVaThoat.style.cursor = 'pointer';
        }
    }

    // --- UPLOAD AUDIO (GIỮ NGUYÊN) ---
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
                alert("Đã tải file lên thành công!");
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

    // --- HANDLERS (GIỮ NGUYÊN) ---
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

        // Check trùng lặp ở frontend
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
            isExisting: false // Từ mới
        };

        danhSachTu.push(tuMoi);
        renderDanhSach();
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
                // Lưu ý: Xóa ở đây chỉ là xóa khỏi danh sách hiển thị
                // Nếu muốn xóa DB thật sự thì cần API delete-word.php riêng
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

    // --- SAVE TO SERVER (CÓ CHECK 3 TỪ) ---
    async function handleLuuVaThoat() {
        if (danhSachTu.length === 0) {
            alert('Danh sách trống.');
            return;
        }

        // [THÊM] Logic chặn nếu người dùng cố tình bypass nút disabled
        if (danhSachTu.length < 3) {
            alert(`Bạn mới nhập ${danhSachTu.length} từ. Cần nhập tối thiểu 3 từ.`);
            return;
        }

        if (!confirm(`Bạn sắp lưu ${danhSachTu.length} từ vựng. Tiếp tục?`)) return;

        btnLuuVaThoat.textContent = "Đang lưu...";
        btnLuuVaThoat.disabled = true;

        try {
            // Gửi toàn bộ danh sách (cũ + mới) lên server
            // Server sẽ tự lọc trùng
            const response = await fetch(`${API_BASE_URL}/add-words.php`, {
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
                renderDanhSach(); // Reset nút
                btnLuuVaThoat.textContent = "Lưu & Thoát";
            }

        } catch (error) {
            console.error(error);
            alert("Lỗi: " + error.message);
            renderDanhSach(); // Reset nút
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

    // [MỚI] GỌI HÀM LOAD KHI TRANG SẴN SÀNG
    loadExistingWords();
});