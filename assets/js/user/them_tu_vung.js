document.addEventListener('DOMContentLoaded', function() {

    //1. Dữ liệu (State)
    let danhSachTu = []; // Mảng chứa các đối tượng từ vựng

    const formThemTu = document.getElementById('form-them-tu');
    const danhSachContainer = document.getElementById('danh-sach-tu-vung-container');
    const soLuongTuSpan = document.getElementById('so-luong-tu');
    
    // Nút điều hướng
    const btnTroVe = document.getElementById('btn-tro-ve');
    const btnHuyBo = document.getElementById('btn-huy-bo');
    const btnLuuVaThoat = document.getElementById('btn-luu-va-thoat');
    
    // Các input
    const inputTuTiengAnh = document.getElementById('input-tu-tieng-anh');
    const inputPhienAm = document.getElementById('input-phien-am');
    const inputNghiaTiengViet = document.getElementById('input-nghia-tieng-viet');
    const inputTuLoai = document.getElementById('input-tu-loai');
    const inputLinkPhatAm = document.getElementById('input-link-phat-am');
    const inputMoTa = document.getElementById('input-mo-ta');
    
    // Audio player
    const audioPlayer = document.getElementById('audio-player-an');

    //Hàm chức năng
    function renderDanhSach() {
        // Xóa nội dung cũ
        danhSachContainer.innerHTML = '';

        if (danhSachTu.length === 0) {
            danhSachContainer.innerHTML = '<p class="thong-bao-rong">Chưa có từ vựng nào.</p>';
        } else {
            danhSachTu.forEach((tu, index) => {
                const theTuVung = document.createElement('div');
                theTuVung.className = 'the-tu-vung';
                //Dùng data-index để biết xóa/phát âm từ nào
                theTuVung.setAttribute('data-index', index); 

                theTuVung.innerHTML = `
                    <div class="thong-tin-tu">
                        <p class="tu-vung-chinh">${tu.tiengAnh} (${tu.tuLoai})</p>
                        <p class="phien-am-tu">${tu.phienAm}</p>
                        <p class="nghia-tu">${tu.nghia}</p>
                        <p class="link-am-tu">${tu.linkAm}</p>
                    </div>
                    <div class="hanh-dong-tu">
                        <button class="nut-icon nut-phat-am" data-action="phat-am">
                            <i class="fa-solid fa-volume-high"></i>
                        </button>
                        <button class="nut-icon nut-xoa-tu" data-action="xoa-tu">
                            <i class="fa-solid fa-times"></i>
                        </button>
                    </div>
                `;
                danhSachContainer.appendChild(theTuVung);
            });
        }
        
        // Cập nhật số lượng
        soLuongTuSpan.textContent = danhSachTu.length;
    }

    /**
     * Xử lý khi người dùng nhấn "Thêm từ"
     */
    function handleThemTu(event) {

        event.preventDefault(); 

        // Lấy dữ liệu từ form
        const tuTiengAnh = inputTuTiengAnh.value.trim();
        const phienAm = inputPhienAm.value.trim();
        const nghia = inputNghiaTiengViet.value.trim();
        const tuLoai = inputTuLoai.value.trim() || 'n/a'; // (n)
        const linkAm = inputLinkPhatAm.value.trim();
        const moTa = inputMoTa.value.trim();
        
        // Kiểm tra
        if (!tuTiengAnh || !nghia) {
            alert('Vui lòng nhập ít nhất "Từ tiếng Anh" và "Nghĩa tiếng Việt".');
            return;
        }

        // Tạo đối tượng từ vựng mới
        const tuMoi = {
            tiengAnh: tuTiengAnh,
            phienAm: phienAm,
            nghia: nghia,
            tuLoai: tuLoai,
            linkAm: linkAm,
            moTa: moTa
        };
        
        // Thêm vào mảng dữ liệu
        danhSachTu.push(tuMoi);
        
        // Cập nhật lại danh sách
        renderDanhSach();
        
        // Reset form
        formThemTu.reset();
        // Focus lại vào input đầu tiên
        inputTuTiengAnh.focus();
    }

    /**
     * Xử lý các click trong danh sách (Phát âm, Xóa)
     */
    function handleDanhSachClick(event) {
        const nut = event.target.closest('.nut-icon');
        if (!nut) return;

        const theTuVung = nut.closest('.the-tu-vung');
        const index = parseInt(theTuVung.getAttribute('data-index'), 10);
        const tu = danhSachTu[index];
        const hanhDong = nut.getAttribute('data-action');

        if (hanhDong === 'phat-am') {
            // Hành động phát âm
            handlePhatAm(tu);
        }
        
        if (hanhDong === 'xoa-tu') {
            //Hành động xóa
            if (confirm(`Bạn có chắc muốn xóa từ "${tu.tiengAnh}" không?`)) {
                danhSachTu.splice(index, 1); // Xóa 1 phần tử tại vị trí index
                renderDanhSach(); // Tải lại danh sách
            }
        }
    }
    
    // Hàm phát âm
    function handlePhatAm(tu) {
        // Ưu tiên 1: Dùng link .mp3 nếu có
        if (tu.linkAm) {
            audioPlayer.src = tu.linkAm;
            audioPlayer.play()
                .catch(e => {
                    console.error("Lỗi phát audio từ link:", e);
                    // Nếu link lỗi, thử phát bằng API
                    phatAmBangAPI(tu.tiengAnh);
                });
        } 
        // Ưu tiên 2: Dùng API của trình duyệt
        else if (tu.tiengAnh && 'speechSynthesis' in window) {
            phatAmBangAPI(tu.tiengAnh);
        }
        // Trường hợp 3: Không có cả 2
        else {
            alert('Không có link âm thanh hoặc trình duyệt không hỗ trợ phát âm.');
        }
    }
    
    function phatAmBangAPI(text) {
        window.speechSynthesis.cancel(); // Dừng âm thanh cũ (nếu có)
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; // Luôn là tiếng Anh
        window.speechSynthesis.speak(utterance);
    }
    
    function handleTroVe() {
        // Quay lại trang trước đó
        history.back();
    }

    function handleHuyBo() {
        if (danhSachTu.length > 0) {
            if (confirm('Bạn có chắc muốn hủy bỏ? Mọi từ vựng vừa thêm sẽ bị mất.')) {
                danhSachTu = [];
                // Chuyển về trang khóa học
                window.location.href = 'khoa_hoc_cua_toi.html';
            }
        } else {
            window.location.href = 'khoa_hoc_cua_toi.html';
        }
    }
    
    function handleLuuVaThoat() {
        if (danhSachTu.length === 0) {
            alert('Bạn chưa thêm từ vựng nào.');
            return;
        }
        
        
        console.log("Đang lưu dữ liệu (giả lập):", danhSachTu);
        alert(`Đã lưu ${danhSachTu.length} từ vựng! Đang quay lại...`);
        
        // Chuyển về trang khóa học
        window.location.href = 'khoa_hoc_cua_toi.html';
    }


    // Nút chính
    if (formThemTu) {
        formThemTu.addEventListener('submit', handleThemTu);
    }
    
    // Nút trong danh sách (dùng Event Delegation)
    if (danhSachContainer) {
        danhSachContainer.addEventListener('click', handleDanhSachClick);
    }
    
    // Nút điều hướng
    if (btnTroVe) {
        btnTroVe.addEventListener('click', handleTroVe);
    }
    if (btnHuyBo) {
        btnHuyBo.addEventListener('click', handleHuyBo);
    }
    if (btnLuuVaThoat) {
        btnLuuVaThoat.addEventListener('click', handleLuuVaThoat);
    }

    renderDanhSach();
    
    console.log("Trang Thêm từ vựng (them_tu_vung.js) đã tải thành công.");
});