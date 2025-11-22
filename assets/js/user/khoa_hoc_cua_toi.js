// khoa_hoc_cua_toi.js - Full Update Version
document.addEventListener('DOMContentLoaded', function() {

    // ============================================================
    // 1. CẤU HÌNH & KHỞI TẠO
    // ============================================================
    
    // ⚠️ QUAN TRỌNG: Thay 'VOCAB' bằng tên thư mục dự án thực tế của bạn
    const API_BASE_URL = 'http://localhost/VOCAB/api'; 

    const urlParams = new URLSearchParams(window.location.search);
    const USER_ID = urlParams.get('user_id') || 1;

    // --- DOM ELEMENTS (MAIN) ---
    const tabKhoaHocCuaToi = document.getElementById('tab-khoa-hoc-cua-toi');
    const tabKhoaHocCongDong = document.getElementById('tab-khoa-hoc-cong-dong');
    const danhSachContainer = document.getElementById('danh-sach-khoa-hoc');
    const khungPhanTrang = document.getElementById('khung-phan-trang');
    const thanhTimKiem = document.getElementById('thanh-tim-kiem');
    
    // --- DOM ELEMENTS (FILTER) ---
    const boLocHienTaiBtn = document.getElementById('bo-loc-hien-tai');
    const tieuDeLoc = document.getElementById('tieu-de-loc');
    const menuLocDropdown = document.getElementById('menu-loc-dropdown');
    const cacLuaChonLoc = document.querySelectorAll('.lua-chon-loc');

    // --- DOM ELEMENTS (MODAL CREATE COURSE) ---
    const btnTaoKhoaHoc = document.getElementById('btn-tao-khoa-hoc'); 
    const khungCheMo = document.getElementById('khung-che-mo');
    const modalTaoKhoaHoc = document.getElementById('modal-tao-khoa-hoc');
    const btnHuyModalTaoKhoaHoc = document.getElementById('btn-huy-modal-taokhoahoc');
    const btnSubmitTaoKhoaHoc = document.getElementById('btn-them-tu-vung'); 
    const tieuDeModal = document.querySelector('#modal-tao-khoa-hoc .tieu-de-modal'); // Tiêu đề modal
    
    // --- DOM ELEMENTS (MODAL TAG) ---
    const btnChonTag = document.getElementById('btn-chon-tag');
    const tagInput = document.getElementById('tag-input');
    const modalThemTag = document.getElementById('modal-them-tag');
    const btnDongModalTag = document.getElementById('btn-dong-modal-tag');
    const btnXacNhanTag = document.getElementById('btn-xac-nhan-tag');
    const khungTagDaChon = document.getElementById('khung-tag-da-chon');
    const khungTagGoiY = document.getElementById('khung-tag-goi-y');

    // --- STATE ---
    let coursesData = [];    
    let filteredData = [];   
    let boLocHienTai = 'tat-ca';
    let tuKhoaTimKiem = '';
    let trangHienTai = 1;
    const soMucTrenTrang = 5;

    let editingCourseId = null; // null: Đang tạo mới, Number: ID đang sửa
    
    // Dữ liệu tag giả lập
    const mockTagData = ['Tiếng Anh', 'N5', 'Giao tiếp', 'TOEIC', 'IELTS', 'Cơ bản', 'Nâng cao', 'CNTT', 'Du lịch'];
    let dsTagDaChon = []; 

    // ============================================================
    // 2. CÁC HÀM GỌI API
    // ============================================================

    async function fetchMyCourses() {
        const url = `${API_BASE_URL}/get-my-courses.php?user_id=${USER_ID}`;
        console.log("Đang tải dữ liệu:", url);

        try {
            danhSachContainer.innerHTML = '<p style="text-align:center">Đang tải dữ liệu...</p>';
            
            const response = await fetch(url);
            const text = await response.text(); 

            try {
                const result = JSON.parse(text);
                
                if (result.success) {
                    coursesData = result.data;
                    filteredData = coursesData;
                    renderDanhSach();
                } else {
                    danhSachContainer.innerHTML = `<p class="thong-bao-rong">Lỗi: ${result.error}</p>`;
                }
            } catch (jsonError) {
                console.error("Lỗi JSON:", jsonError);
                console.log("Response Text:", text);
                danhSachContainer.innerHTML = `<p class="thong-bao-rong">Lỗi dữ liệu từ server.</p>`;
            }

        } catch (error) {
            console.error("Lỗi mạng:", error);
            danhSachContainer.innerHTML = `<p class="thong-bao-rong">Không thể kết nối đến Server.</p>`;
        }
    }

    // Hàm chung xử lý Tạo mới hoặc Cập nhật
    async function saveCourse(payload, isUpdate) {
        const endpoint = isUpdate ? '/update-course.php' : '/create-course.php';
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error(error);
            return { success: false, error: "Lỗi kết nối server" };
        }
    }

    // Hàm Xóa hoặc Rời khóa học
    async function deleteOrLeaveCourse(courseId, isOwner) {
        const action = isOwner ? 'delete' : 'leave';
        const confirmMsg = isOwner 
            ? 'Bạn có chắc chắn muốn xóa VĨNH VIỄN khóa học này? Hành động này không thể hoàn tác!' 
            : 'Bạn có chắc chắn muốn rời khỏi khóa học này?';

        if (!confirm(confirmMsg)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/delete-course.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    user_id: USER_ID, 
                    course_id: courseId, 
                    action: action 
                })
            });
            
            // Kiểm tra nếu response rỗng hoặc không phải JSON
            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error("Response không phải JSON:", text);
                alert("Lỗi máy chủ: " + text);
                return;
            }

            if (result.success) {
                alert(result.message);
                fetchMyCourses(); // Tải lại danh sách
            } else {
                alert("Lỗi: " + result.error);
            }
        } catch (e) {
            console.error(e);
            alert("Lỗi kết nối server khi xóa.");
        }
    }

    // ============================================================
    // 3. CÁC HÀM RENDER GIAO DIỆN
    // ============================================================

    function renderDanhSach() {
        if (!danhSachContainer) return;

        // 1. Lọc dữ liệu
        filteredData = coursesData.filter(kh => {
            let matchFilter = true;
            if (boLocHienTai === 'da-tao') matchFilter = kh.isOwner;
            if (boLocHienTai === 'da-tham-gia') matchFilter = !kh.isOwner;
            
            let matchSearch = true;
            if (tuKhoaTimKiem) {
                const k = tuKhoaTimKiem.toLowerCase();
                matchSearch = kh.tieuDe.toLowerCase().includes(k) || 
                              (kh.mota && kh.mota.toLowerCase().includes(k));
            }
            return matchFilter && matchSearch;
        });

        // 2. Phân trang
        const tongSoMuc = filteredData.length;
        const tongSoTrang = Math.ceil(tongSoMuc / soMucTrenTrang);
        
        if (trangHienTai > tongSoTrang && tongSoTrang > 0) trangHienTai = 1;
        if (tongSoTrang === 0) trangHienTai = 1;

        const batDau = (trangHienTai - 1) * soMucTrenTrang;
        const ketThuc = batDau + soMucTrenTrang;
        const dataTrenTrang = filteredData.slice(batDau, ketThuc);

        // 3. Hiển thị HTML
        danhSachContainer.innerHTML = '';
        if (dataTrenTrang.length === 0) {
            danhSachContainer.innerHTML = '<p class="thong-bao-rong">Không tìm thấy khóa học nào.</p>';
        } else {
            dataTrenTrang.forEach(kh => {
                danhSachContainer.appendChild(taoTheKhoaHoc(kh));
            });
        }
        renderPhanTrang(tongSoTrang);
    }

    function taoTheKhoaHoc(kh) {
        const theDiv = document.createElement('div');
        theDiv.className = 'the-khoa-hoc';
        theDiv.setAttribute('data-id', kh.id);

        let classTrangThai = 'trang-thai-chua-hoc';
        if (kh.trangThai === 'Hoàn thành') classTrangThai = 'trang-thai-hoan-thanh';
        else if (kh.trangThai === 'Đang học') classTrangThai = 'trang-thai-dang-hoc';

        let nutHocText = 'Học';
        let nutHocAction = 'hoc';
        if (kh.tienDo === 100) { nutHocText = 'Kiểm tra'; nutHocAction = 'kiem-tra'; } 
        else if (kh.tienDo > 0) { nutHocText = 'Ôn tập'; nutHocAction = 'on-tap'; }

        const nutSuaHtml = kh.isOwner ? `<button class="nut-hanh-dong" data-action="sua" title="Sửa khóa học"><i class="fa-solid fa-pencil"></i></button>` : '';
        const nutXoaTooltip = kh.isOwner ? 'Xóa khóa học vĩnh viễn' : 'Rời khỏi khóa học';
        
        const tagsHtml = (kh.tags && kh.tags.length) 
            ? kh.tags.map(t => `<span class="the-tag">${t}</span>`).join('') 
            : '<span class="the-tag" style="opacity:0.5; font-size:0.8em">Không có tag</span>';

        theDiv.innerHTML = `
            <div class="dau-the">
                <div class="thong-tin-tieu-de">
                    <h3 class="tieu-de-khoa-hoc">${kh.tieuDe}</h3>
                    <p class="mota-khoa-hoc">${kh.mota || ''}</p>
                </div>
                <span class="trang-thai-the ${classTrangThai}">${kh.trangThai}</span>
            </div>
            <div class="noi-dung-the">
                <div class="khoi-thong-tin"><span class="tieu-de-khoi">Người tạo</span><span class="giatri-khoi">${kh.nguoiTao}</span></div>
                <div class="khoi-thong-tin"><span class="tieu-de-khoi">Số từ</span><span class="giatri-khoi">${kh.soTu} từ</span></div>
                <div class="khoi-thong-tin"><span class="tieu-de-khoi">Trạng thái</span><span class="giatri-khoi">${kh.trangThaiChiaSe}</span></div>
            </div>
            <div class="khung-tags">${tagsHtml}</div>
            <div class="khung-tien-do">
                <span class="nhan-tien-do">Tiến độ :</span>
                <div class="thanh-tien-do-tong">
                    <div class="thanh-tien-do-hien-tai" style="width: ${kh.tienDo}%;"></div>
                </div>
                <span class="phan-tram-tien-do">${kh.tienDo}%</span>
            </div>
            <div class="khung-nut-bam">
                <button class="nut-bam nut-xanh" data-action="chi-tiet">Xem chi tiết</button>
                <button class="nut-bam nut-xanh" data-action="${nutHocAction}">${nutHocText}</button>
                <div class="nhom-nut-hanh-dong">
                    ${nutSuaHtml}
                    <button class="nut-hanh-dong nut-xoa" data-action="xoa" title="${nutXoaTooltip}"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
        return theDiv;
    }
    
    function renderPhanTrang(tongSoTrang) {
        if (!khungPhanTrang) return;
        khungPhanTrang.innerHTML = '';
        if (tongSoTrang <= 1) return;

        const taoNut = (text, page, disabled = false, active = false) => {
            const btn = document.createElement('button');
            btn.className = 'nut-phan-trang' + (active ? ' trang-hien-tai' : '');
            btn.innerHTML = text;
            btn.disabled = disabled;
            btn.addEventListener('click', () => { 
                trangHienTai = page; 
                renderDanhSach(); 
                danhSachContainer.scrollIntoView({ behavior: 'smooth' });
            });
            return btn;
        };

        khungPhanTrang.appendChild(taoNut('<i class="fa-solid fa-chevron-left"></i> Trang trước', trangHienTai - 1, trangHienTai === 1));
        for (let i = 1; i <= tongSoTrang; i++) {
            khungPhanTrang.appendChild(taoNut(i, i, false, i === trangHienTai));
        }
        khungPhanTrang.appendChild(taoNut('Trang sau <i class="fa-solid fa-chevron-right"></i>', trangHienTai + 1, trangHienTai === tongSoTrang));
    }

    // ============================================================
    // 4. HÀM XỬ LÝ MODAL & TAGS
    // ============================================================

    // Mở modal để TẠO MỚI
    function moModalTaoKhoaHoc() {
        editingCourseId = null; // Reset mode
        
        // Reset giao diện về "Tạo mới"
        if (tieuDeModal) tieuDeModal.textContent = "Thông tin khóa học";
        if (btnSubmitTaoKhoaHoc) btnSubmitTaoKhoaHoc.textContent = "Thêm từ vựng";

        if (khungCheMo) khungCheMo.classList.remove('an');
        if (modalTaoKhoaHoc) modalTaoKhoaHoc.classList.remove('an');
        if (modalThemTag) modalThemTag.classList.add('an');
        
        // Reset form
        document.getElementById('form-tao-khoa-hoc').reset();
        dsTagDaChon = [];
        tagInput.value = "";
    }

    // Mở modal để SỬA
    function openEditModal(course) {
        editingCourseId = course.id; // Lưu ID đang sửa
        
        // Thay đổi giao diện thành "Cập nhật"
        if (tieuDeModal) tieuDeModal.textContent = "Cập nhật khóa học";
        if (btnSubmitTaoKhoaHoc) btnSubmitTaoKhoaHoc.textContent = "Lưu thay đổi";

        // Điền dữ liệu cũ vào form
        document.getElementById('ten-khoa-hoc-input').value = course.tieuDe;
        document.getElementById('mo-ta-input').value = course.mota || "";
        document.getElementById('trang-thai-select').value = (course.trangThaiChiaSe === 'Công khai') ? 'cong-khai' : 'rieng-tu';
        
        // Xử lý Tags
        dsTagDaChon = course.tags ? [...course.tags] : [];
        tagInput.value = dsTagDaChon.join(', ');
        
        // Hiển thị modal
        if (khungCheMo) khungCheMo.classList.remove('an');
        if (modalTaoKhoaHoc) modalTaoKhoaHoc.classList.remove('an');
        if (modalThemTag) modalThemTag.classList.add('an');
    }

    function moModalThemTag() {
        if (modalTaoKhoaHoc) modalTaoKhoaHoc.classList.add('an');
        if (modalThemTag) modalThemTag.classList.remove('an');
        
        // Lấy tag từ input để đồng bộ
        const currentTags = tagInput.value.split(',').map(t => t.trim()).filter(t => t !== "");
        currentTags.forEach(t => {
            if (!dsTagDaChon.includes(t)) dsTagDaChon.push(t);
        });
        
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

    // ============================================================
    // 5. EVENT LISTENERS (SỰ KIỆN)
    // ============================================================

    // --- Chuyển Tab ---
    if (tabKhoaHocCongDong) {
        tabKhoaHocCongDong.addEventListener('click', () => {
            window.location.href = `khoa_hoc_cong_dong.html?user_id=${USER_ID}`;
        });
    }

    // --- Nút mở modal tạo mới ---
    if (btnTaoKhoaHoc) btnTaoKhoaHoc.addEventListener('click', moModalTaoKhoaHoc);
    
    if (khungCheMo) {
        khungCheMo.addEventListener('click', (e) => {
            if (e.target === khungCheMo) dongTatCaModal();
        });
    }
    if (btnHuyModalTaoKhoaHoc) btnHuyModalTaoKhoaHoc.addEventListener('click', dongTatCaModal);

    // --- Nút Submit Form (Tạo mới / Cập nhật) ---
    if (btnSubmitTaoKhoaHoc) {
        btnSubmitTaoKhoaHoc.addEventListener('click', async (e) => {
            e.preventDefault();

            const tenKhoaHoc = document.getElementById('ten-khoa-hoc-input').value.trim();
            const moTa = document.getElementById('mo-ta-input').value.trim();
            const trangThaiSelect = document.getElementById('trang-thai-select').value;
            const visibility = (trangThaiSelect === 'cong-khai') ? 'public' : 'private';
            
            const tagsInputVal = tagInput.value.trim();
            let finalTags = [...dsTagDaChon];
            if (tagsInputVal) {
                const manualTags = tagsInputVal.split(',').map(t => t.trim()).filter(t => t !== "");
                manualTags.forEach(t => {
                    if (!finalTags.includes(t)) finalTags.push(t);
                });
            }

            if (!tenKhoaHoc) {
                alert('Vui lòng nhập tên khóa học!');
                return;
            }

            // Xử lý Logic API
            const isUpdate = (editingCourseId !== null);
            const payload = {
                user_id: USER_ID,
                course_name: tenKhoaHoc,
                description: moTa,
                visibility: visibility,
                tags: finalTags
            };

            if (isUpdate) {
                payload.course_id = editingCourseId;
            }

            btnSubmitTaoKhoaHoc.textContent = "Đang xử lý...";
            btnSubmitTaoKhoaHoc.disabled = true;

            const result = await saveCourse(payload, isUpdate);

            btnSubmitTaoKhoaHoc.disabled = false;
            btnSubmitTaoKhoaHoc.textContent = isUpdate ? "Lưu thay đổi" : "Thêm từ vựng";

            if (result.success) {
                alert(isUpdate ? "Cập nhật thành công!" : "Tạo khóa học thành công!");
                dongTatCaModal();
                
                if (isUpdate) {
                    // Nếu sửa, reload lại danh sách tại chỗ
                    fetchMyCourses();
                } else {
                    // Nếu tạo mới, chuyển sang trang thêm từ vựng
                    window.location.href = `them_tu_vung.html?id=${result.course_id}&user_id=${USER_ID}`;
                }
            } else {
                alert("Lỗi: " + result.error);
            }
        });
    }

    // --- Modal Tag ---
    if (btnChonTag) {
        btnChonTag.addEventListener('click', (e) => {
            e.preventDefault();
            moModalThemTag();
        });
    }
    if (btnDongModalTag) btnDongModalTag.addEventListener('click', dongTatCaModal);
    
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

    // --- Bộ lọc & Tìm kiếm ---
    if (boLocHienTaiBtn) {
        boLocHienTaiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuLocDropdown.classList.toggle('an');
        });
    }

    cacLuaChonLoc.forEach(luaChon => {
        luaChon.addEventListener('click', () => {
            boLocHienTai = luaChon.getAttribute('data-filter');
            tieuDeLoc.textContent = luaChon.textContent.trim();
            menuLocDropdown.classList.add('an');
            
            cacLuaChonLoc.forEach(item => item.classList.remove('active'));
            luaChon.classList.add('active');
            
            trangHienTai = 1;
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

    document.addEventListener('click', (e) => {
        if (boLocHienTaiBtn && !boLocHienTaiBtn.contains(e.target) && !menuLocDropdown.contains(e.target)) {
            menuLocDropdown.classList.add('an');
        }
    });

    // --- XỬ LÝ CLICK TRÊN DANH SÁCH KHÓA HỌC (DELEGATION) ---
    if (danhSachContainer) {
        danhSachContainer.addEventListener('click', (e) => {
            const nut = e.target.closest('.nut-bam, .nut-hanh-dong');
            if (!nut) return;
            
            const the = nut.closest('.the-khoa-hoc');
            const khoaHocId = the.getAttribute('data-id');
            const hanhDong = nut.getAttribute('data-action');
            
            // Lấy object khóa học đầy đủ để dùng cho chức năng Sửa
            const courseObj = coursesData.find(c => c.id == khoaHocId);

            switch (hanhDong) {
                case 'chi-tiet': 
                    window.location.href = `chi_tiet_khoa_hoc.html?id=${khoaHocId}&user_id=${USER_ID}`;
                    break;
                
                case 'hoc': 
                    window.location.href = `user_hoc_tu_vung.html?course_id=${khoaHocId}&user_id=${USER_ID}`;
                    break;
                
                case 'on-tap': 
                    window.location.href = `on_tap.html?course_id=${khoaHocId}&user_id=${USER_ID}`;
                    break;
                
                case 'kiem-tra': 
                    window.location.href = `kiem_tra.html?course_id=${khoaHocId}&user_id=${USER_ID}`;
                    break;

                case 'sua': 
                    if (courseObj) openEditModal(courseObj);
                    break;

                case 'xoa':
                    if (courseObj) deleteOrLeaveCourse(khoaHocId, courseObj.isOwner);
                    break;
            }
        });
    }

    // ============================================================
    // 6. KHỞI TẠO BAN ĐẦU
    // ============================================================
    fetchMyCourses();
    console.log("Trang Khóa học của tôi (Updated Version) đã tải.");
});