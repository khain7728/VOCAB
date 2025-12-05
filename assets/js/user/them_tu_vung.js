document.addEventListener('DOMContentLoaded', function() {

    // --- CẤU HÌNH ---
    // Thay đổi đường dẫn này nếu cần thiết
    const API_BASE_URL = 'http://localhost/VOCAB/api';

    const urlParams = new URLSearchParams(window.location.search);
    const COURSE_ID = urlParams.get('id');

    if (!COURSE_ID) {
        alert("Không tìm thấy ID khóa học. Vui lòng quay lại trang danh sách.");
        window.location.href = 'khoa_hoc_cua_toi.html';
        return;
    }

    // --- STATE ---
    let danhSachTu = [];

    // --- DOM ELEMENTS ---
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

    // --- RENDER FUNCTION ---
    function renderDanhSach() {
        danhSachContainer.innerHTML = '';

        if (danhSachTu.length === 0) {
            danhSachContainer.innerHTML = '<p class="thong-bao-rong">Chưa có từ vựng nào.</p>';
        } else {
            danhSachTu.forEach((tu, index) => {
                const theTuVung = document.createElement('div');
                theTuVung.className = 'the-tu-vung';
                theTuVung.setAttribute('data-index', index);

                theTuVung.innerHTML = `
                    <div class="thong-tin-tu">
                        <p class="tu-vung-chinh">${tu.tiengAnh} <span style="font-weight:normal; font-size:0.9em">(${tu.tuLoai})</span></p>
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
        soLuongTuSpan.textContent = danhSachTu.length;
    }

    // --- UPLOAD AUDIO LOGIC ---
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

    // --- HANDLERS ---
    function handleThemTu(event) {
        event.preventDefault();

        // Fix #34: Disable button
        if (btnThemTu.disabled) return;
        btnThemTu.disabled = true;

        // Fix #18: Trim whitespace
        const tuTiengAnh = inputTuTiengAnh.value.trim();
        const phienAm = inputPhienAm.value.trim();
        const nghia = inputNghiaTiengViet.value.trim();
        const tuLoai = inputTuLoai.value.trim() || 'n';
        const linkAm = inputLinkPhatAm.value.trim();
        const moTa = inputMoTa.value.trim();

        // Fix #17: Validation
        if (!tuTiengAnh || !nghia) {
            alert('Vui lòng nhập đầy đủ "Từ tiếng Anh" và "Nghĩa tiếng Việt".');
            btnThemTu.disabled = false;
            return;
        }

        // Validate URL chỉ khi nó bắt đầu bằng http (nếu là path nội bộ thì bỏ qua)
        if (linkAm && linkAm.startsWith('http') && !isValidUrl(linkAm)) {
            alert('Link phát âm không hợp lệ.');
            inputLinkPhatAm.focus();
            btnThemTu.disabled = false;
            return;
        }

        const tuMoi = {
            tiengAnh: tuTiengAnh,
            phienAm: phienAm,
            nghia: nghia,
            tuLoai: tuLoai,
            linkAm: linkAm,
            moTa: moTa
        };

        danhSachTu.push(tuMoi);
        renderDanhSach();
        formThemTu.reset();
        
        // Fix #37: Scroll to top
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
        // Fix #40: Stop old audio
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
        }
        window.speechSynthesis.cancel(); 

        // Ưu tiên link file upload hoặc link ngoài
        if (tu.linkAm) {
            // Kiểm tra xem là link http hay link nội bộ
            // Nếu link nội bộ, cần thêm prefix domain nếu file JS đang chạy ở path khác root
            // Nhưng nếu thẻ <base> hoặc path đúng rồi thì gán trực tiếp
            audioPlayer.src = tu.linkAm; 
            audioPlayer.play().catch(e => {
                console.warn("Lỗi file audio, fallback sang API speech", e);
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
            alert('Danh sách trống. Hãy thêm ít nhất 1 từ vựng.');
            return;
        }

        if (!confirm(`Bạn sắp lưu ${danhSachTu.length} từ vựng vào khóa học. Tiếp tục?`)) return;

        btnLuuVaThoat.textContent = "Đang lưu...";
        btnLuuVaThoat.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/add-words.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    course_id: COURSE_ID,
                    words: danhSachTu
                })
            });

            // Parse text trước để debug nếu cần
            const textResult = await response.text();
            let result;
            try {
                result = JSON.parse(textResult);
            } catch (e) {
                console.error("Server response not JSON:", textResult);
                throw new Error("Phản hồi server lỗi (không phải JSON).");
            }

            if (result.success) {
                alert("Lưu thành công! Đang quay về danh sách khóa học.");
                window.location.href = `khoa_hoc_cua_toi.html`;
            } else {
                alert(result.error || "Có lỗi xảy ra.");
                btnLuuVaThoat.textContent = "Lưu và thoát";
                btnLuuVaThoat.disabled = false;
            }

        } catch (error) {
            console.error(error);
            alert("Lỗi: " + error.message);
            btnLuuVaThoat.textContent = "Lưu và thoát";
            btnLuuVaThoat.disabled = false;
        }
    }

    function handleHuyBo() {
        if (danhSachTu.length > 0) {
            if (confirm('Bạn có chắc muốn hủy? Các từ vừa thêm sẽ KHÔNG được lưu.')) {
                history.back();
            }
        } else {
            history.back();
        }
    }

    // --- LISTENERS ---
    if (formThemTu) formThemTu.addEventListener('submit', handleThemTu);
    if (danhSachContainer) danhSachContainer.addEventListener('click', handleDanhSachClick);
    if (btnTroVe) btnTroVe.addEventListener('click', () => history.back());
    if (btnHuyBo) btnHuyBo.addEventListener('click', handleHuyBo);
    if (btnLuuVaThoat) btnLuuVaThoat.addEventListener('click', handleLuuVaThoat);

    renderDanhSach();
});