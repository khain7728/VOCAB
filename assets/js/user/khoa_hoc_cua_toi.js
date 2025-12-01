document.addEventListener('DOMContentLoaded', function() {

    // ============================================================
    // 1. CẤU HÌNH
    // ============================================================
    const API_BASE_URL = 'http://localhost/VOCAB/api'; 
    const urlParams = new URLSearchParams(window.location.search);
    const USER_ID = urlParams.get('user_id') || 1;

    // DOM ELEMENTS
    const tabKhoaHocCongDong = document.getElementById('tab-khoa-hoc-cong-dong');
    const danhSachContainer = document.getElementById('danh-sach-khoa-hoc');
    const khungPhanTrang = document.getElementById('khung-phan-trang');
    const thanhTimKiem = document.getElementById('thanh-tim-kiem');
    const boLocNguonGocBtn = document.getElementById('bo-loc-nguon-goc');
    const tieuDeNguonGoc = document.getElementById('tieu-de-nguon-goc');
    const menuLocNguonGoc = document.getElementById('menu-loc-nguon-goc');
    const boLocTrangThaiBtn = document.getElementById('bo-loc-trang-thai');
    const tieuDeTrangThai = document.getElementById('tieu-de-trang-thai');
    const menuLocTrangThai = document.getElementById('menu-loc-trang-thai');

    // MODAL
    const btnTaoKhoaHoc = document.getElementById('btn-tao-khoa-hoc'); 
    const khungCheMo = document.getElementById('khung-che-mo');
    const modalTaoKhoaHoc = document.getElementById('modal-tao-khoa-hoc');
    const btnHuyModalTaoKhoaHoc = document.getElementById('btn-huy-modal-taokhoahoc');
    const btnSubmitTaoKhoaHoc = document.getElementById('btn-them-tu-vung'); // Nút submit form
    const tieuDeModal = document.querySelector('#modal-tao-khoa-hoc .tieu-de-modal');
    
    // TAGS
    const btnChonTag = document.getElementById('btn-chon-tag');
    const tagInput = document.getElementById('tag-input');
    const modalThemTag = document.getElementById('modal-them-tag');
    const btnDongModalTag = document.getElementById('btn-dong-modal-tag');
    const btnXacNhanTag = document.getElementById('btn-xac-nhan-tag');
    const khungTagDaChon = document.getElementById('khung-tag-da-chon');
    const khungTagGoiY = document.getElementById('khung-tag-goi-y');

    // STATE
    let coursesData = [];    
    let filteredData = [];   
    let boLocNguonGoc = 'tat-ca'; // Đã tạo / Đã tham gia
    let boLocTrangThai = 'tat-ca'; // Chưa học / Đang học / Hoàn thành
    let currentTab = 'my-courses'; // Thêm biến theo dõi tab
    let tuKhoaTimKiem = '';
    let trangHienTai = 1;
    const soMucTrenTrang = 5;
    let editingCourseId = null;
    let availableTags = []; 
    let dsTagDaChon = [];   

    // ============================================================
    // 2. API CALLS
    // ============================================================

    async function fetchMyCourses() {
        try {
            danhSachContainer.innerHTML = '<p style="text-align:center">Đang tải dữ liệu...</p>';
            const response = await fetch(`${API_BASE_URL}/get-my-courses.php?user_id=${USER_ID}`);
            const result = await response.json();

            if (result.success) {
                coursesData = result.data;
                filteredData = coursesData;
                renderDanhSach();
            } else {
                danhSachContainer.innerHTML = `<p class="thong-bao-rong">Lỗi: ${result.error}</p>`;
            }
        } catch (error) {
            console.error(error);
            danhSachContainer.innerHTML = `<p class="thong-bao-rong">Lỗi kết nối server.</p>`;
        }
    }

    async function fetchTags() {
        try {
            const response = await fetch(`${API_BASE_URL}/get-tags.php`);
            const result = await response.json();
            if (result.success) availableTags = result.data;
        } catch (error) { console.error("Lỗi tải tags:", error); }
    }

    async function saveCourse(payload, isUpdate) {
        const endpoint = isUpdate ? '/update-course.php' : '/create-course.php';
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: "Lỗi kết nối server" };
        }
    }

    async function deleteOrLeaveCourse(courseId, isOwner) {
        const action = isOwner ? 'delete' : 'leave';
        if (!confirm(isOwner ? 'Xóa vĩnh viễn khóa học?' : 'Rời khỏi khóa học?')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/delete-course.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: USER_ID, course_id: courseId, action: action })
            });
            const result = await response.json();
            if (result.success) {
                alert(result.message);
                fetchMyCourses();
            } else {
                alert("Lỗi: " + result.error);
            }
        } catch (e) { alert("Lỗi kết nối"); }
    }

    // ============================================================
    // 3. RENDER UI
    // ============================================================

    function renderDanhSach() {
        if (!danhSachContainer) return;

        filteredData = coursesData.filter(kh => {
            // Filter 1: Nguồn gốc
            let matchNguonGoc = true;
            if (boLocNguonGoc === 'da-tao') {
                matchNguonGoc = kh.isOwner;
            } else if (boLocNguonGoc === 'da-tham-gia') {
                matchNguonGoc = !kh.isOwner;
            }
            
            // Filter 2: Trạng thái học tập
            let matchTrangThai = true;
            if (boLocTrangThai === 'chua-hoc') {
                matchTrangThai = kh.trangThai === 'Chưa học';
            } else if (boLocTrangThai === 'dang-hoc') {
                matchTrangThai = kh.trangThai === 'Đang học';
            } else if (boLocTrangThai === 'hoan-thanh') {
                matchTrangThai = kh.trangThai === 'Hoàn thành';
            }
            
            // Filter 3: Tìm kiếm
            let matchSearch = true;
            if (tuKhoaTimKiem) {
                const k = tuKhoaTimKiem.toLowerCase();
                matchSearch = kh.tieuDe.toLowerCase().includes(k) || (kh.mota && kh.mota.toLowerCase().includes(k));
            }
            
            return matchNguonGoc && matchTrangThai && matchSearch;
        });

        const tongSoMuc = filteredData.length;
        const tongSoTrang = Math.ceil(tongSoMuc / soMucTrenTrang);
        if (trangHienTai > tongSoTrang && tongSoTrang > 0) trangHienTai = 1;
        if (tongSoTrang === 0) trangHienTai = 1;

        const batDau = (trangHienTai - 1) * soMucTrenTrang;
        const ketThuc = batDau + soMucTrenTrang;
        const dataTrenTrang = filteredData.slice(batDau, ketThuc);

        danhSachContainer.innerHTML = '';
        if (dataTrenTrang.length === 0) {
            danhSachContainer.innerHTML = '<p class="thong-bao-rong">Không tìm thấy khóa học nào.</p>';
        } else {
            dataTrenTrang.forEach(kh => danhSachContainer.appendChild(taoTheKhoaHoc(kh)));
        }
        renderPhanTrang(tongSoTrang);
    }

    function taoTheKhoaHoc(kh) {
        const div = document.createElement('div');
        div.className = 'the-khoa-hoc';
        div.setAttribute('data-id', kh.id);

        let classTrangThai = kh.trangThai === 'Hoàn thành' ? 'trang-thai-hoan-thanh' : (kh.trangThai === 'Đang học' ? 'trang-thai-dang-hoc' : 'trang-thai-chua-hoc');
        let btnAction = kh.tienDo === 100 ? { text: 'Kiểm tra', action: 'kiem-tra', class: 'nut-xanh' } : (kh.tienDo > 0 ? { text: 'Ôn tập', action: 'on-tap', class: 'nut-xanh' } : { text: 'Học', action: 'hoc', class: 'nut-trang-vien-xanh' });
        const btnSua = kh.isOwner ? `<button class="nut-hanh-dong" data-action="sua"><i class="fa-solid fa-pencil"></i></button>` : '';
        const tagsHtml = (kh.tags && kh.tags.length) ? kh.tags.map(t => `<span class="the-tag">${t}</span>`).join('') : '<span class="the-tag" style="opacity:0.5">Không có tag</span>';

        div.innerHTML = `
            <div class="dau-the">
                <div class="thong-tin-tieu-de"><h3>${kh.tieuDe}</h3><p>${kh.mota}</p></div>
                <span class="trang-thai-the ${classTrangThai}">${kh.trangThai}</span>
            </div>
            <div class="noi-dung-the">
                <div class="khoi-thong-tin"><span>Người tạo</span><span class="giatri-khoi">${kh.nguoiTao}</span></div>
                <div class="khoi-thong-tin"><span>Số từ</span><span class="giatri-khoi">${kh.soTu} từ</span></div>
                <div class="khoi-thong-tin"><span>Trạng thái</span><span class="giatri-khoi">${kh.trangThaiChiaSe}</span></div>
            </div>
            <div class="khung-tags">${tagsHtml}</div>
            <div class="khung-tien-do">
                <span class="nhan-tien-do">Tiến độ:</span>
                <div class="thanh-tien-do-tong"><div class="thanh-tien-do-hien-tai" style="width:${kh.tienDo}%"></div></div>
                <span class="phan-tram-tien-do">${kh.tienDo}%</span>
            </div>
            <div class="khung-nut-bam">
                <button class="nut-bam nut-xanh" data-action="chi-tiet">Xem chi tiết</button>
                <button class="nut-bam ${btnAction.class}" data-action="${btnAction.action}">${btnAction.text}</button>
                <div class="nhom-nut-hanh-dong">
                    ${btnSua}
                    <button class="nut-hanh-dong nut-xoa" data-action="xoa"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
        return div;
    }

    function renderPhanTrang(tongSoTrang) {
        khungPhanTrang.innerHTML = '';
        if (tongSoTrang <= 1) return;
        const taoNut = (txt, p) => {
            const b = document.createElement('button');
            b.className = `nut-phan-trang ${p === trangHienTai ? 'trang-hien-tai' : ''}`;
            b.innerHTML = txt;
            b.onclick = () => { trangHienTai = p; renderDanhSach(); danhSachContainer.scrollIntoView({behavior:'smooth'}); };
            return b;
        };
        khungPhanTrang.appendChild(taoNut('<', Math.max(1, trangHienTai-1)));
        for(let i=1; i<=tongSoTrang; i++) khungPhanTrang.appendChild(taoNut(i, i));
        khungPhanTrang.appendChild(taoNut('>', Math.min(tongSoTrang, trangHienTai+1)));
    }

    // ============================================================
    // 4. MODAL LOGIC & EVENT HANDLERS
    // ============================================================

    function moModalTaoKhoaHoc() {
        editingCourseId = null;
        if (tieuDeModal) tieuDeModal.textContent = "Thông tin khóa học";
        if (btnSubmitTaoKhoaHoc) btnSubmitTaoKhoaHoc.textContent = "Thêm từ vựng";
        moModalChung();
        document.getElementById('form-tao-khoa-hoc').reset();
        dsTagDaChon = [];
        tagInput.value = "";
        fetchTags();
    }

    function openEditModal(course) {
        editingCourseId = course.id;
        if (tieuDeModal) tieuDeModal.textContent = "Cập nhật khóa học";
        if (btnSubmitTaoKhoaHoc) btnSubmitTaoKhoaHoc.textContent = "Lưu thay đổi";
        moModalChung();
        document.getElementById('ten-khoa-hoc-input').value = course.tieuDe;
        document.getElementById('mo-ta-input').value = course.mota || "";
        document.getElementById('trang-thai-select').value = (course.trangThaiChiaSe === 'Công khai') ? 'cong-khai' : 'rieng-tu';
        dsTagDaChon = course.tags ? [...course.tags] : [];
        tagInput.value = dsTagDaChon.join(', ');
        fetchTags();
    }

    function moModalChung() {
        khungCheMo.classList.remove('an');
        modalTaoKhoaHoc.classList.remove('an');
        modalThemTag.classList.add('an');
    }

    function renderTagsTrongModal() {
        khungTagGoiY.innerHTML = '';
        khungTagDaChon.innerHTML = '';
        availableTags.forEach(tag => {
            if(!dsTagDaChon.includes(tag)) {
                const sp = document.createElement('span');
                sp.className = 'the-tag-modal'; 
                sp.textContent = tag;
                sp.onclick = () => { dsTagDaChon.push(tag); renderTagsTrongModal(); };
                khungTagGoiY.appendChild(sp);
            }
        });
        dsTagDaChon.forEach(tag => {
            const sp = document.createElement('span');
            sp.className = 'the-tag-modal da-chon'; 
            sp.innerHTML = `${tag} <i class="fa-solid fa-times"></i>`;
            sp.onclick = () => { dsTagDaChon = dsTagDaChon.filter(t => t !== tag); renderTagsTrongModal(); };
            khungTagDaChon.appendChild(sp);
        });
    }

    function dongTatCaModal() {
        khungCheMo.classList.add('an');
        modalTaoKhoaHoc.classList.add('an');
        modalThemTag.classList.add('an');
    }

    // --- EVENTS ---
    if(tabKhoaHocCongDong) tabKhoaHocCongDong.onclick = () => window.location.href = `khoa_hoc_cong_dong.html?user_id=${USER_ID}`;
    if(btnTaoKhoaHoc) btnTaoKhoaHoc.onclick = moModalTaoKhoaHoc;
    if(btnHuyModalTaoKhoaHoc) btnHuyModalTaoKhoaHoc.onclick = dongTatCaModal;
    if(khungCheMo) khungCheMo.onclick = (e) => { if(e.target === khungCheMo) dongTatCaModal(); };

    // --- NÚT LƯU / TẠO ---
    if (btnSubmitTaoKhoaHoc) {
        btnSubmitTaoKhoaHoc.addEventListener('click', async (e) => {
            e.preventDefault();
            const name = document.getElementById('ten-khoa-hoc-input').value.trim();
            const desc = document.getElementById('mo-ta-input').value.trim();
            const visi = document.getElementById('trang-thai-select').value === 'cong-khai' ? 'public' : 'private';
            
            const tagsVal = tagInput.value.trim();
            let tagsToSend = tagsVal ? tagsVal.split(',').map(t => t.trim()).filter(t => t !== "") : dsTagDaChon;

            if (!name) return alert('Vui lòng nhập tên khóa học');

            const isUpdate = (editingCourseId !== null);
            const payload = { user_id: USER_ID, course_name: name, description: desc, visibility: visi, tags: tagsToSend };
            if (isUpdate) payload.course_id = editingCourseId;

            btnSubmitTaoKhoaHoc.textContent = "Đang xử lý...";
            btnSubmitTaoKhoaHoc.disabled = true;

            const res = await saveCourse(payload, isUpdate);
            btnSubmitTaoKhoaHoc.disabled = false;
            btnSubmitTaoKhoaHoc.textContent = isUpdate ? "Lưu thay đổi" : "Thêm từ vựng";

            console.log("Response Server:", res); // Debug

            if (res.success) {
                alert(res.message || (isUpdate ? "Cập nhật thành công!" : "Tạo thành công!"));
                dongTatCaModal();
                
                if (isUpdate) {
                    fetchMyCourses();
                } else {
                    // --- ĐÂY LÀ ĐOẠN QUAN TRỌNG ĐỂ SỬA LỖI ---
                    // Lấy ID trả về từ PHP
                    const newId = res.course_id; 

                    if (newId && newId > 0) {
                        // Chuyển sang trang thêm từ vựng với ID chuẩn
                        window.location.href = `them_tu_vung.html?id=${newId}&user_id=${USER_ID}`;
                    } else {
                        // Trường hợp tạo được nhưng ID = 0 (Lỗi DB)
                        alert("Cảnh báo: Không lấy được ID khóa học mới. Vui lòng tải lại trang danh sách.");
                        fetchMyCourses();
                    }
                }
                fetchTags();
            } else {
                alert("Lỗi: " + res.error);
            }
        });
    }

    // Tag Events
    if(btnChonTag) btnChonTag.onclick = (e) => {
        e.preventDefault();
        const currentTags = tagInput.value.split(',').map(t => t.trim()).filter(t => t);
        dsTagDaChon = [...new Set([...dsTagDaChon, ...currentTags])];
        moModalChung(); 
        modalTaoKhoaHoc.classList.add('an'); 
        modalThemTag.classList.remove('an');
        renderTagsTrongModal();
    };
    if(btnDongModalTag) btnDongModalTag.onclick = dongTatCaModal;
    if(btnXacNhanTag) btnXacNhanTag.onclick = () => {
        tagInput.value = dsTagDaChon.join(', ');
        modalThemTag.classList.add('an');
        modalTaoKhoaHoc.classList.remove('an');
    };

    // Filter & Search
    // Dropdown Nguồn gốc
    if(boLocNguonGocBtn) {
        boLocNguonGocBtn.onclick = (e) => { 
            e.stopPropagation(); 
            menuLocNguonGoc.classList.toggle('an');
            menuLocTrangThai.classList.add('an'); // Đóng dropdown kia
        };
    }
    
    if(menuLocNguonGoc) {
        menuLocNguonGoc.querySelectorAll('.lua-chon-loc').forEach(item => {
            item.onclick = () => {
                boLocNguonGoc = item.getAttribute('data-source');
                const nguonGocNames = {
                    'tat-ca': 'Tất cả nguồn',
                    'da-tao': 'Đã tạo',
                    'da-tham-gia': 'Đã tham gia'
                };
                tieuDeNguonGoc.textContent = nguonGocNames[boLocNguonGoc];
                menuLocNguonGoc.classList.add('an');
                
                menuLocNguonGoc.querySelectorAll('.lua-chon-loc').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                trangHienTai = 1;
                renderDanhSach();
            };
        });
    }
    
    // Dropdown Trạng thái
    if(boLocTrangThaiBtn) {
        boLocTrangThaiBtn.onclick = (e) => { 
            e.stopPropagation(); 
            menuLocTrangThai.classList.toggle('an');
            menuLocNguonGoc.classList.add('an'); // Đóng dropdown kia
        };
    }
    
    if(menuLocTrangThai) {
        menuLocTrangThai.querySelectorAll('.lua-chon-loc').forEach(item => {
            item.onclick = () => {
                boLocTrangThai = item.getAttribute('data-status');
                const trangThaiNames = {
                    'tat-ca': 'Tất cả trạng thái',
                    'chua-hoc': 'Chưa học',
                    'dang-hoc': 'Đang học',
                    'hoan-thanh': 'Hoàn thành'
                };
                tieuDeTrangThai.textContent = trangThaiNames[boLocTrangThai];
                menuLocTrangThai.classList.add('an');
                
                menuLocTrangThai.querySelectorAll('.lua-chon-loc').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                trangHienTai = 1;
                renderDanhSach();
            };
        });
    }
    
    if(thanhTimKiem) thanhTimKiem.oninput = (e) => { tuKhoaTimKiem = e.target.value.toLowerCase(); trangHienTai = 1; renderDanhSach(); };
    
    // Đóng dropdowns khi click bên ngoài
    document.onclick = (e) => { 
        if(boLocNguonGocBtn && !boLocNguonGocBtn.contains(e.target) && !menuLocNguonGoc.contains(e.target)) {
            menuLocNguonGoc.classList.add('an');
        }
        if(boLocTrangThaiBtn && !boLocTrangThaiBtn.contains(e.target) && !menuLocTrangThai.contains(e.target)) {
            menuLocTrangThai.classList.add('an');
        }
    };

    // Click Handler cho List
    if(danhSachContainer) danhSachContainer.onclick = (e) => {
        const nut = e.target.closest('.nut-bam, .nut-hanh-dong');
        if(!nut) return;
        const id = nut.closest('.the-khoa-hoc').getAttribute('data-id');
        const action = nut.getAttribute('data-action');
        const course = coursesData.find(c => c.id == id);

        if(action === 'chi-tiet') window.location.href = `chi_tiet_khoa_hoc.html?id=${id}&user_id=${USER_ID}`;
        else if(action === 'hoc') window.location.href = `user_hoc_tu_vung.html?course_id=${id}&user_id=${USER_ID}`;
        else if(action === 'on-tap') window.location.href = `user_hinh_thuc_on_tap.html?course_id=${id}&user_id=${USER_ID}`;
        else if(action === 'kiem-tra') window.location.href = `kiem_tra.html?course_id=${id}&user_id=${USER_ID}`;
        else if(action === 'sua') openEditModal(course);
        else if(action === 'xoa') deleteOrLeaveCourse(id, course.isOwner);
    };

    // Init
    fetchMyCourses();
    fetchTags();
});