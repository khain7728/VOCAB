document.addEventListener('DOMContentLoaded', function() {

    // --- CẤU HÌNH ---
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

    // --- DOM ---
    const formThemTu = document.getElementById('form-them-tu');
    const btnThemTu = formThemTu.querySelector('button[type="submit"]'); // Nút thêm nhỏ
    const danhSachContainer = document.getElementById('danh-sach-tu-vung-container');
    const soLuongTuSpan = document.getElementById('so-luong-tu');

    // Action Buttons
    const btnTroVe = document.getElementById('btn-tro-ve');
    const btnHuyBo = document.getElementById('btn-huy-bo');
    const btnLuuVaThoat = document.getElementById('btn-luu-va-thoat');

    // Inputs
    const inputTuTiengAnh = document.getElementById('input-tu-tieng-anh');
    const inputPhienAm = document.getElementById('input-phien-am');
    const inputNghiaTiengViet = document.getElementById('input-nghia-tieng-viet');
    const inputTuLoai = document.getElementById('input-tu-loai');
    const inputLinkPhatAm = document.getElementById('input-link-phat-am');
    const inputMoTa = document.getElementById('input-mo-ta');

    const audioPlayer = document.getElementById('audio-player-an');

    // --- RENDER ---
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

    // --- HANDLERS ---
    function handleThemTu(event) {
        event.preventDefault();

        // 1. Chống Double-Submit Form
        if (btnThemTu.disabled) return;
        btnThemTu.disabled = true;

        // 2. Trim Whitespace
        const tuTiengAnh = inputTuTiengAnh.value.trim();
        const phienAm = inputPhienAm.value.trim();
        const nghia = inputNghiaTiengViet.value.trim();
        const tuLoai = inputTuLoai.value.trim() || 'n';
        const linkAm = inputLinkPhatAm.value.trim();
        const moTa = inputMoTa.value.trim();

        // 3. Validation Cơ bản
        if (!tuTiengAnh || !nghia) {
            alert('Vui lòng nhập đầy đủ "Từ tiếng Anh" và "Nghĩa tiếng Việt".');
            btnThemTu.disabled = false;
            return;
        }

        // 4. Validate URL Âm thanh (Regex)
        if (linkAm && !isValidUrl(linkAm)) {
            alert('Link phát âm không hợp lệ (phải bắt đầu bằng http:// hoặc https://).');
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
        
        // 5. Scroll về đầu (Fix #37)
        window.scrollTo({ top: 0, behavior: 'smooth' });
        inputTuTiengAnh.focus();

        // Mở lại nút
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
                // Fix #37: Xóa xong cũng scroll nhẹ về đầu danh sách hoặc đầu trang
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }

    function handlePhatAm(tu) {
        // Fix #40: Dừng audio cũ trước
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
        }
        window.speechSynthesis.cancel(); 

        if (tu.linkAm && isValidUrl(tu.linkAm)) {
            audioPlayer.src = tu.linkAm;
            audioPlayer.play().catch(e => {
                console.warn("Lỗi file audio, fallback sang API speech");
                phatAmBangAPI(tu.tiengAnh);
            });
        } else if (tu.tiengAnh) {
            phatAmBangAPI(tu.tiengAnh);
        }
    }

    function phatAmBangAPI(text) {
        // Kiểm tra trình duyệt hỗ trợ
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.onerror = function(event) {
                console.error('SpeechSynthesis error', event);
            };
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Trình duyệt không hỗ trợ phát âm.");
        }
    }

    // Validate URL helper
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

        // Fix #34: Disable nút Lưu ngay lập tức
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

            // Parse JSON an toàn
            let result;
            try {
                result = await response.json();
            } catch (e) {
                throw new Error("Phản hồi từ server không hợp lệ (không phải JSON).");
            }

            if (result.success) {
                alert("Lưu thành công! Đang quay về danh sách khóa học.");
                window.location.href = `khoa_hoc_cua_toi.html`;
                // Không enable lại nút ở đây
            } else {
                // Fix #28: Thông báo lỗi thân thiện
                alert(result.error || "Có lỗi xảy ra. Vui lòng kiểm tra lại dữ liệu.");
                btnLuuVaThoat.textContent = "Lưu và thoát";
                btnLuuVaThoat.disabled = false;
            }

        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối server: " + error.message);
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