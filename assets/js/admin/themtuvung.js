document.addEventListener('DOMContentLoaded', function() {

    // --- CẤU HÌNH ---
    // Thay 'VOCAB' bằng tên thư mục dự án của bạn
    const API_BASE_URL = 'http://localhost/VOCAB/api';

    // Lấy ID khóa học từ URL (ví dụ: them_tu_vung.html?id=10)
    const urlParams = new URLSearchParams(window.location.search);
    const COURSE_ID = urlParams.get('id');

    // Kiểm tra nếu không có ID thì cảnh báo và quay về
    if (!COURSE_ID) {
        alert("Không tìm thấy ID khóa học. Vui lòng quay lại trang danh sách.");
        window.location.href = 'khoa_hoc_cua_toi.html';
        return;
    }

    // --- STATE ---
    let danhSachTu = [];

    // --- DOM ---
    const formThemTu = document.getElementById('form-them-tu');
    const danhSachContainer = document.getElementById('danh-sach-tu-vung-container');
    const soLuongTuSpan = document.getElementById('so-luong-tu');

    // Buttons
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
                        <p class="link-am-tu" style="display:none">${tu.linkAm}</p> 
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

        const tuTiengAnh = inputTuTiengAnh.value.trim();
        const phienAm = inputPhienAm.value.trim();
        const nghia = inputNghiaTiengViet.value.trim();
        const tuLoai = inputTuLoai.value.trim() || 'n';
        const linkAm = inputLinkPhatAm.value.trim();
        const moTa = inputMoTa.value.trim();

        if (!tuTiengAnh || !nghia) {
            alert('Vui lòng nhập ít nhất "Từ tiếng Anh" và "Nghĩa tiếng Việt".');
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
        inputTuTiengAnh.focus();
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
        if (tu.linkAm) {
            audioPlayer.src = tu.linkAm;
            audioPlayer.play().catch(e => phatAmBangAPI(tu.tiengAnh));
        } else if (tu.tiengAnh && 'speechSynthesis' in window) {
            phatAmBangAPI(tu.tiengAnh);
        } else {
            alert('Không thể phát âm từ này.');
        }
    }

    function phatAmBangAPI(text) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    }

    // --- SAVE TO SERVER ---
    async function handleLuuVaThoat() {
        if (danhSachTu.length === 0) {
            alert('Danh sách trống. Hãy thêm ít nhất 1 từ vựng.');
            return;
        }

        if (!confirm(`Bạn sắp lưu ${danhSachTu.length} từ vựng vào khóa học. Tiếp tục?`)) return;

        try {
            btnLuuVaThoat.textContent = "Đang lưu...";
            btnLuuVaThoat.disabled = true;

            const response = await fetch(`${API_BASE_URL}/add-words.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    course_id: COURSE_ID,
                    words: danhSachTu
                })
            });

            const result = await response.json();

            if (result.success) {
                alert("Lưu thành công! Đang quay về danh sách khóa học.");
                window.location.href = `khoa_hoc_cua_toi.html?user_id=1`; // Có thể thay user_id động sau này
            } else {
                alert("Lỗi: " + result.error);
            }

        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối server khi lưu từ vựng.");
        } finally {
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

    // Init
    renderDanhSach();
    console.log("Trang Thêm từ vựng đã sẵn sàng.");
});