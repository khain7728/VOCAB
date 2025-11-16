document.addEventListener('DOMContentLoaded', function() {

    // --- 1. Dữ liệu (Giữ nguyên) ---
    const mockKhoaHocData = [
        { id: 1, tieuDe: 'Tiếng Anh cơ bản', mota: 'Tiếng Anh cho người mới bắt đầu', nguoiTao: 'User', soTu: 20, trangThaiChiaSe: 'Công khai', hocVien: 10, trangThai: 'Hoàn thành', tienDo: 100, tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4'], isOwner: true },
        { id: 2, tieuDe: 'Khóa số 1', mota: 'Tiếng Anh cho người mới bắt đầu', nguoiTao: 'Mino', soTu: 20, trangThaiChiaSe: 'Công khai', hocVien: 10, trangThai: 'Hoàn thành', tienDo: 100, tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4'], isOwner: false },
        { id: 3, tieuDe: 'Khóa số 2', mota: 'Tiếng Anh cho người mới bắt đầu', nguoiTao: 'User', soTu: 20, trangThaiChiaSe: 'Riêng tư', hocVien: 3, trangThai: 'Đang học', tienDo: 60, tags: ['Tag1', 'Tag2'], isOwner: true },
        { id: 4, tieuDe: 'Khóa số 3', mota: 'Tiếng Anh cho người mới bắt đầu', nguoiTao: 'Singer', soTu: 20, hocVien: 30, trangThaiChiaSe: 'Công khai', trangThai: 'Đang học', tienDo: 60, tags: ['Tag1', 'Tag2', 'Tag3'], isOwner: false },
        { id: 5, tieuDe: 'Khóa số 4', mota: 'Tiếng Anh cho người mới bắt đầu', nguoiTao: 'User', soTu: 20, hocVien: 20, trangThaiChiaSe: 'Công khai', trangThai: 'Chưa học', tienDo: 0, tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4'], isOwner: true },
        { id: 6, tieuDe: 'Khóa số 5 (Trang 2)', mota: 'Khóa học này nằm ở trang 2', nguoiTao: 'Admin', soTu: 50, hocVien: 2, trangThaiChiaSe: 'Công khai', trangThai: 'Chưa học', tienDo: 0, tags: ['Test', 'Pagination'], isOwner: false }
    ];

    const mockTagData = ['Tiếng Anh', 'N5', 'Giao tiếp', 'TOEIC', 'IELTS', 'Cơ bản', 'Nâng cao'];

    // --- 2. DOM (Giữ nguyên) ---
    const tabKhoaHocCuaToi = document.getElementById('tab-khoa-hoc-cua-toi');
    const tabKhoaHocCongDong = document.getElementById('tab-khoa-hoc-cong-dong');
    const boLocHienTaiBtn = document.getElementById('bo-loc-hien-tai');
    const tieuDeLoc = document.getElementById('tieu-de-loc');
    const menuLocDropdown = document.getElementById('menu-loc-dropdown');
    const cacLuaChonLoc = document.querySelectorAll('.lua-chon-loc');
    const thanhTimKiem = document.getElementById('thanh-tim-kiem');
    const danhSachContainer = document.getElementById('danh-sach-khoa-hoc');
    const khungPhanTrang = document.getElementById('khung-phan-trang');
    const khungCheMo = document.getElementById('khung-che-mo');
    const btnTaoKhoaHoc = document.getElementById('btn-tao-khoa-hoc');
    const modalTaoKhoaHoc = document.getElementById('modal-tao-khoa-hoc');
    const btnHuyModalTaoKhoaHoc = document.getElementById('btn-huy-modal-taokhoahoc');
    const btnThemTuVung = document.getElementById('btn-them-tu-vung');
    const btnChonTag = document.getElementById('btn-chon-tag');
    const tagInput = document.getElementById('tag-input');
    const modalThemTag = document.getElementById('modal-them-tag');
    const btnDongModalTag = document.getElementById('btn-dong-modal-tag');
    const btnXacNhanTag = document.getElementById('btn-xac-nhan-tag');
    const khungTagDaChon = document.getElementById('khung-tag-da-chon');
    const khungTagGoiY = document.getElementById('khung-tag-goi-y');

    // --- 3. Biến trạng thái (Giữ nguyên) ---
    let boLocHienTai = 'tat-ca';
    let tuKhoaTimKiem = '';
    let trangHienTai = 1;
    const soMucTrenTrang = 5;
    let dsTagDaChon = [];

    // --- 4. Hàm chức năng ---
    function renderDanhSach() {
        if (!danhSachContainer) return;
        let dataToRender = mockKhoaHocData;
        if (boLocHienTai === 'da-tao') {
            dataToRender = dataToRender.filter(kh => kh.isOwner);
        } else if (boLocHienTai === 'da-tham-gia') {
            dataToRender = dataToRender.filter(kh => !kh.isOwner);
        }
        if (tuKhoaTimKiem) {
            dataToRender = dataToRender.filter(kh => 
                kh.tieuDe.toLowerCase().includes(tuKhoaTimKiem) ||
                kh.mota.toLowerCase().includes(tuKhoaTimKiem)
            );
        }
        const tongSoMuc = dataToRender.length;
        const tongSoTrang = Math.ceil(tongSoMuc / soMucTrenTrang);
        const batDau = (trangHienTai - 1) * soMucTrenTrang;
        const ketThuc = batDau + soMucTrenTrang;
        const dataTrenTrang = dataToRender.slice(batDau, ketThuc);
        danhSachContainer.innerHTML = '';
        if (dataTrenTrang.length === 0) {
            danhSachContainer.innerHTML = '<p class="thong-bao-rong">Không có khóa học nào để hiển thị.</p>';
        } else {
            dataTrenTrang.forEach(kh => {
                danhSachContainer.appendChild(taoTheKhoaHoc(kh));
            });
        }
        renderPhanTrang(tongSoTrang);
    }
    
    // (ĐÃ THAY ĐỔI)
    function taoTheKhoaHoc(kh) {
        const theDiv = document.createElement('div');
        theDiv.className = 'the-khoa-hoc';
        theDiv.setAttribute('data-id', kh.id);
        let classTrangThai = 'trang-thai-chua-hoc';
        if (kh.trangThai === 'Hoàn thành') classTrangThai = 'trang-thai-hoan-thanh';
        if (kh.trangThai === 'Đang học') classTrangThai = 'trang-thai-dang-hoc';
        
        // (THAY ĐỔI LỚN)
        // Xác định cả Text và data-action
        let nutHocText = 'Học';
        let nutHocAction = 'hoc'; // Mặc định là 'hoc'
        
        if (kh.tienDo === 100) {
            nutHocText = 'Kiểm tra';
            nutHocAction = 'kiem-tra'; // Đổi action
        } else if (kh.tienDo > 0) {
            nutHocText = 'Ôn tập';
            nutHocAction = 'on-tap'; // Đổi action
        }
        // Nếu tiến độ 0%, giữ nguyên 'Học' và 'hoc'

        const nutSuaHtml = kh.isOwner ? `<button class="nut-hanh-dong" data-action="sua"><i class="fa-solid fa-pencil"></i></button>` : '';
        const nutXoaTooltip = kh.isOwner ? 'Xóa khóa học' : 'Rời khỏi khóa học';
        
        // (THAY ĐỔI LỚN)
        // Gán data-action động
        theDiv.innerHTML = `
            <div class="dau-the">
                <div class="thong-tin-tieu-de"><h3 class="tieu-de-khoa-hoc">${kh.tieuDe}</h3><p class="mota-khoa-hoc">${kh.mota}</p></div>
                <span class="trang-thai-the ${classTrangThai}">${kh.trangThai}</span>
            </div>
            <div class="noi-dung-the">
                <div class="khoi-thong-tin"><span class="tieu-de-khoi">Người tạo</span><span class="giatri-khoi">${kh.nguoiTao}</span></div>
                <div class="khoi-thong-tin"><span class="tieu-de-khoi">Số từ</span><span class="giatri-khoi" id="so-tu-${kh.id}">${kh.soTu} từ</span></div>
                <div class="khoi-thong-tin"><span class="tieu-de-khoi">Trạng thái</span><span class="giatri-khoi">${kh.trangThaiChiaSe}</span></div>
            </div>
            <div class="khung-tags">${kh.tags.map(tag => `<span class="the-tag">${tag}</span>`).join('')}</div>
            <div class="khung-tien-do">
                <span class="nhan-tien-do">Tiến độ :</span>
                <div class="thanh-tien-do-tong"><div class="thanh-tien-do-hien-tai" style="width: ${kh.tienDo}%;"></div></div>
                <span class="phan-tram-tien-do" id="phan-tram-${kh.id}">${kh.tienDo}%</span>
            </div>
            <div class="khung-nut-bam">
                <button class="nut-bam nut-xanh" data-action="chi-tiet">Xem chi tiết</button>
                <button class="nut-bam nut-xanh" data-action="${nutHocAction}">${nutHocText}</button>
                <div class="nhom-nut-hanh-dong">
                    ${nutSuaHtml}
                    <button class="nut-hanh-dong nut-xoa" data-action="xoa" title="${nutXoaTooltip}"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
        return theDiv;
    }

    // (Các hàm renderPhanTrang, moModalTaoKhoaHoc, moModalThemTag, renderTagsTrongModal, dongTatCaModal không thay đổi)
    function renderPhanTrang(tongSoTrang) {
        if (!khungPhanTrang) return;
        khungPhanTrang.innerHTML = '';
        if (tongSoTrang <= 1) return; 
        const nutTruoc = document.createElement('button');
        nutTruoc.className = 'nut-phan-trang';
        nutTruoc.innerHTML = '<i class="fa-solid fa-chevron-left"></i> Trang trước';
        nutTruoc.disabled = (trangHienTai === 1);
        nutTruoc.addEventListener('click', () => { if (trangHienTai > 1) { trangHienTai--; renderDanhSach(); } });
        khungPhanTrang.appendChild(nutTruoc);
        for (let i = 1; i <= tongSoTrang; i++) {
            const nutTrang = document.createElement('button');
            nutTrang.className = 'nut-phan-trang';
            nutTrang.textContent = i;
            if (i === trangHienTai) { nutTrang.classList.add('trang-hien-tai'); }
            nutTrang.addEventListener('click', () => { trangHienTai = i; renderDanhSach(); });
            khungPhanTrang.appendChild(nutTrang);
        }
        const nutSau = document.createElement('button');
        nutSau.className = 'nut-phan-trang';
        nutSau.innerHTML = 'Trang sau <i class="fa-solid fa-chevron-right"></i>';
        nutSau.disabled = (trangHienTai === tongSoTrang);
        nutSau.addEventListener('click', () => { if (trangHienTai < tongSoTrang) { trangHienTai++; renderDanhSach(); } });
        khungPhanTrang.appendChild(nutSau);
    }
    function moModalTaoKhoaHoc() {
        if (khungCheMo) khungCheMo.classList.remove('an');
        if (modalTaoKhoaHoc) modalTaoKhoaHoc.classList.remove('an');
        if (modalThemTag) modalThemTag.classList.add('an');
        document.getElementById('form-tao-khoa-hoc').reset();
        dsTagDaChon = [];
    }
    function moModalThemTag() {
        if (modalTaoKhoaHoc) modalTaoKhoaHoc.classList.add('an');
        if (modalThemTag) modalThemTag.classList.remove('an');
        const tagsTuInput = tagInput.value.split(',').map(t => t.trim()).filter(t => t.length > 0);
        dsTagDaChon = [...new Set(tagsTuInput)];
        renderTagsTrongModal();
    }
    function renderTagsTrongModal() {
        khungTagGoiY.innerHTML = '';
        mockTagData.forEach(tag => {
            if (!dsTagDaChon.includes(tag)) {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'the-tag-modal';
                tagSpan.textContent = tag;
                tagSpan.setAttribute('data-tag', tag);
                khungTagGoiY.appendChild(tagSpan);
            }
        });
        khungTagDaChon.innerHTML = '';
        dsTagDaChon.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'the-tag-modal da-chon';
            tagSpan.innerHTML = `${tag} <i class="fa-solid fa-times"></i>`;
            tagSpan.setAttribute('data-tag', tag);
            khungTagDaChon.appendChild(tagSpan);
        });
    }
    function dongTatCaModal() {
        if (khungCheMo) khungCheMo.classList.add('an');
        if (modalTaoKhoaHoc) modalTaoKhoaHoc.classList.add('an');
        if (modalThemTag) modalThemTag.classList.add('an');
    }

    // --- 5. Gán Event Listeners ---

    // (Các hàm tab, modal không thay đổi)
    if (tabKhoaHocCongDong) {
        tabKhoaHocCongDong.addEventListener('click', () => {
            window.location.href = 'khoa_hoc_cong_dong.html';
        });
    }
    if (btnTaoKhoaHoc) {
        btnTaoKhoaHoc.addEventListener('click', moModalTaoKhoaHoc);
    }
    if (khungCheMo) {
        khungCheMo.addEventListener('click', (e) => {
            if (e.target === khungCheMo) {
                dongTatCaModal();
            }
        });
    }
    if (btnHuyModalTaoKhoaHoc) {
        btnHuyModalTaoKhoaHoc.addEventListener('click', dongTatCaModal);
    }
    if (btnDongModalTag) {
        btnDongModalTag.addEventListener('click', dongTatCaModal);
    }
    if (btnChonTag) {
        btnChonTag.addEventListener('click', (e) => {
            e.preventDefault(); 
            moModalThemTag();
        });
    }
    if (khungTagGoiY) {
        khungTagGoiY.addEventListener('click', (e) => {
            const tag = e.target.getAttribute('data-tag');
            if (tag && !dsTagDaChon.includes(tag)) {
                dsTagDaChon.push(tag);
                renderTagsTrongModal();
            }
        });
    }
    if (khungTagDaChon) {
        khungTagDaChon.addEventListener('click', (e) => {
            const tagSpan = e.target.closest('.the-tag-modal');
            if (tagSpan) {
                const tag = tagSpan.getAttribute('data-tag');
                dsTagDaChon = dsTagDaChon.filter(t => t !== tag);
                renderTagsTrongModal();
            }
        });
    }
    if (btnXacNhanTag) {
        btnXacNhanTag.addEventListener('click', () => {
            tagInput.value = dsTagDaChon.join(', ');
            if (modalThemTag) modalThemTag.classList.add('an');
            if (modalTaoKhoaHoc) modalTaoKhoaHoc.classList.remove('an');
        });
    }
    if (btnThemTuVung) {
        btnThemTuVung.addEventListener('click', (e) => {
            e.preventDefault();
            const tenKhoaHoc = document.getElementById('ten-khoa-hoc-input').value;
            if (!tenKhoaHoc) {
                alert('Vui lòng nhập Tên khóa học!');
                return;
            }
            const newCourseId = Math.floor(Math.random() * 1000);
            alert('Đã tạo khóa học! Đang chuyển đến trang Thêm từ vựng...');
            dongTatCaModal();
            window.location.href = `them_tu_vung.html?id=${newCourseId}`;
        });
    }
    if (boLocHienTaiBtn) {
        boLocHienTaiBtn.addEventListener('click', () => {
            menuLocDropdown.classList.toggle('an');
        });
    }
    cacLuaChonLoc.forEach(luaChon => {
        luaChon.addEventListener('click', () => {
            boLocHienTai = luaChon.getAttribute('data-filter');
            trangHienTai = 1; 
            tieuDeLoc.textContent = luaChon.textContent.trim();
            menuLocDropdown.classList.add('an');
            cacLuaChonLoc.forEach(item => item.classList.remove('active'));
            luaChon.classList.add('active');
            renderDanhSach();
        });
    });
    if (thanhTimKiem) {
        thanhTimKiem.addEventListener('input', (e) => {
            tuKhoaTimKiem = e.target.value.toLowerCase();
            trangHienTai = 1;
            renderDanhSach();
        });
    }
    
    // (ĐÃ THAY ĐỔI)
    // Cập nhật Switch Case
    if (danhSachContainer) {
        danhSachContainer.addEventListener('click', (e) => {
            const nut = e.target.closest('.nut-bam, .nut-hanh-dong');
            if (!nut) return;
            
            const the = nut.closest('.the-khoa-hoc');
            const khoaHocId = the.getAttribute('data-id');
            const hanhDong = nut.getAttribute('data-action');
            
            switch (hanhDong) {
                case 'chi-tiet': 
                    // Chuyển sang trang chi tiết
                    window.location.href = `chi_tiet_khoa_hoc.html?id=${khoaHocId}`;
                    break;
                
                // (THAY ĐỔI) Tách các trường hợp
                case 'hoc': 
                    // Chuyển sang trang học (flashcard)
                    window.location.href = `user_hoc_tu_vung.html?id=${khoaHocId}`;
                    break;
                case 'on-tap': 
                    // (ĐÃ THÊM) Chuyển sang trang ôn tập
                    window.location.href = `on_tap.html?id=${khoaHocId}`;
                    break;
                case 'kiem-tra': 
                    // (ĐÃ THÊM) Chuyển sang trang kiểm tra
                    window.location.href = `kiem_tra.html?id=${khoaHocId}`;
                    break;

                case 'sua': 
                    // Chuyển sang trang sửa
                    window.location.href = `sua_khoa_hoc.html?id=${khoaHocId}`;
                    break;
                case 'xoa':
                    const khoaHoc = mockKhoaHocData.find(kh => kh.id == khoaHocId);
                    const hanhDongXoa = khoaHoc.isOwner ? 'xóa vĩnh viễn' : 'rời khỏi';
                    if (confirm(`Bạn có chắc muốn ${hanhDongXoa} khóa học "${khoaHoc.tieuDe}" không?`)) {
                        alert('Đã xóa (giả lập)!');
                        // (Trong app thật, bạn sẽ gọi API xóa và renderDanhSach() lại)
                    }
                    break;
            }
        });
    }
    
    document.addEventListener('click', (e) => {
        if (boLocHienTaiBtn && menuLocDropdown && !boLocHienTaiBtn.contains(e.target) && !menuLocDropdown.contains(e.target)) {
            menuLocDropdown.classList.add('an');
        }
    });

    // --- 6. Khởi tạo ---
    renderDanhSach();
    
    console.log("Trang Khóa học của tôi (khoa_hoc_cua_toi.js) đã tải thành công.");
});