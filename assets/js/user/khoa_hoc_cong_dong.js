document.addEventListener('DOMContentLoaded', function() {
    
    // === CẤU HÌNH ===
    const API_BASE_URL = 'http://localhost/VOCAB/api'; 
    // Lấy user_id từ localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const USER_ID = localStorage.getItem('user_id'); // Lấy từ session đã được lưu bởi auth_check.js

    // DOM
    const danhSachContainer = document.getElementById('danh-sach-khoa-hoc-cong-dong');
    const thanhTimKiem = document.getElementById('thanh-tim-kiem');
    const tabKhoaHocCuaToi = document.getElementById('tab-khoa-hoc-cua-toi');
    const boLocHienTai = document.getElementById('bo-loc-hien-tai');
    const menuLocDropdown = document.getElementById('menu-loc-dropdown');
    const tieuDeLoc = document.getElementById('tieu-de-loc');

    // State
    let allCoursesData = [];
    let filteredData = [];
    let tuKhoaTimKiem = '';
    let boLoc = 'tat-ca'; // tat-ca, da-tham-gia, chua-tham-gia
    
    // ... (Giữ nguyên các phần khai báo biến phân trang cũ) ...
    let trangHienTai = 1;
    const soMucTrenTrang = 5;
    const khungPhanTrang = document.getElementById('khung-phan-trang');

    // --- 1. GỌI API LẤY DANH SÁCH ---
    async function fetchCommunityCourses() {
        try {
            const response = await fetch(`${API_BASE_URL}/get-public-courses.php?user_id=${USER_ID}`);
            const result = await response.json();

            if (result.success) {
                allCoursesData = result.data;
                filteredData = allCoursesData;
                renderDanhSach();
            } else {
                console.error(result.error);
                danhSachContainer.innerHTML = `<p class="thong-bao-rong">Lỗi: ${result.error}</p>`;
            }
        } catch (error) {
            console.error(error);
        }
    }

    // --- 2. GỌI API THAM GIA KHÓA HỌC (NEW) ---
    async function joinCourse(courseId) {
        try {
            const response = await fetch(`${API_BASE_URL}/join-course.php`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    user_id: USER_ID, 
                    course_id: courseId 
                })
            });

            const result = await response.json();

            if (result.success) {
                alert("Đã tham gia khóa học thành công!");
                
                // Cập nhật giao diện ngay lập tức (Client-side Update)
                // Tìm khóa học trong mảng và đổi trạng thái
                const courseIndex = allCoursesData.findIndex(c => c.id == courseId);
                if (courseIndex > -1) {
                    allCoursesData[courseIndex].daThamGia = true;
                    allCoursesData[courseIndex].hocVien += 1; // Tăng số học viên ảo lên 1
                    
                    // Render lại để nút "Thêm" biến mất, hiện "Đã tham gia"
                    renderDanhSach();
                }
            } else {
                alert("Lỗi: " + result.error);
            }

        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối server khi tham gia khóa học.");
        }
    }

    // --- 3. RENDER & EVENT ---
    function renderDanhSach() {
        if (!danhSachContainer) return;

        // Lọc theo bộ lọc
        let tempData = allCoursesData;
        
        if (boLoc === 'da-tham-gia') {
            tempData = tempData.filter(kh => kh.daThamGia === true);
        } else if (boLoc === 'chua-tham-gia') {
            tempData = tempData.filter(kh => !kh.daThamGia || kh.daThamGia === false);
        }
        
        // Lọc theo từ khóa tìm kiếm
        if (tuKhoaTimKiem) {
            const k = tuKhoaTimKiem.toLowerCase();
            filteredData = tempData.filter(kh => 
                kh.tieuDe.toLowerCase().includes(k) ||
                (kh.mota && kh.mota.toLowerCase().includes(k))
            );
        } else {
            filteredData = tempData;
        }

        // Phân trang (Logic giữ nguyên như cũ)
        const tongSoMuc = filteredData.length;
        const tongSoTrang = Math.ceil(tongSoMuc / soMucTrenTrang);
        if (trangHienTai > tongSoTrang && tongSoTrang > 0) trangHienTai = 1;
        const batDau = (trangHienTai - 1) * soMucTrenTrang;
        const ketThuc = batDau + soMucTrenTrang;
        const dataTrenTrang = filteredData.slice(batDau, ketThuc);

        danhSachContainer.innerHTML = '';
        if (dataTrenTrang.length === 0) {
            danhSachContainer.innerHTML = '<p class="thong-bao-rong">Không có khóa học nào.</p>';
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

        const classTrangThai = kh.daThamGia ? 'trang-thai-da-tham-gia' : 'trang-thai-chua-tham-gia';
        const textTrangThai = kh.daThamGia ? 'Đã tham gia' : 'Chưa tham gia';
        
        // Chỉ hiện nút Thêm nếu chưa tham gia
        const nutThemHtml = !kh.daThamGia
            ? `<button class="nut-bam nut-them" data-action="them">Thêm</button>`
            : ''; 

        const tagsHtml = (kh.tags && kh.tags.length) 
            ? kh.tags.map(t => `<span class="the-tag">${t}</span>`).join('') 
            : '<span class="the-tag" style="opacity:0.5">Không có tag</span>';

        theDiv.innerHTML = `
            <div class="dau-the">
                <div class="thong-tin-tieu-de">
                    <h3 class="tieu-de-khoa-hoc">${kh.tieuDe}</h3>
                    <p class="mota-khoa-hoc">${kh.mota}</p>
                </div>
                <span class="trang-thai-the ${classTrangThai}">${textTrangThai}</span>
            </div>
            <div class="noi-dung-the">
                <div class="khoi-thong-tin">
                    <span class="tieu-de-khoi">Người tạo</span>
                    <span class="giatri-khoi">${kh.nguoiTao}</span>
                </div>
                <div class="khoi-thong-tin">
                    <span class="tieu-de-khoi">Số từ</span>
                    <span class="giatri-khoi">${kh.soTu} từ</span>
                </div>
                <div class="khoi-thong-tin">
                    <span class="tieu-de-khoi">Học viên</span>
                    <span class="giatri-khoi">${kh.hocVien}</span>
                </div>
            </div>
            <div class="khung-tags">${tagsHtml}</div>
            <div class="khung-nut-bam">
                ${nutThemHtml}
                <button class="nut-bam nut-xem-chi-tiet" data-action="chi-tiet">Xem chi tiết</button>
            </div>
        `;
        return theDiv;
    }

    // Hàm phân trang
    function renderPhanTrang(tongSoTrang) {
        if (!khungPhanTrang) return;
        khungPhanTrang.innerHTML = '';
        if (tongSoTrang <= 1) return;

        const taoNut = (text, page, disabled, active) => {
            const btn = document.createElement('button');
            btn.className = 'nut-phan-trang' + (active ? ' trang-hien-tai' : '');
            btn.innerHTML = text;
            btn.disabled = disabled;
            btn.addEventListener('click', () => { trangHienTai = page; renderDanhSach(); });
            return btn;
        };

        khungPhanTrang.appendChild(taoNut('<i class="fa-solid fa-chevron-left"></i> Trang trước', trangHienTai - 1, trangHienTai === 1, false));
        for (let i = 1; i <= tongSoTrang; i++) {
            khungPhanTrang.appendChild(taoNut(i, i, false, i === trangHienTai));
        }
        khungPhanTrang.appendChild(taoNut('Trang sau <i class="fa-solid fa-chevron-right"></i>', trangHienTai + 1, trangHienTai === tongSoTrang, false));
    }

    // --- LISTENERS ---
    
    // Xử lý click nút Thêm
    if (danhSachContainer) {
        danhSachContainer.addEventListener('click', (e) => {
            const nut = e.target.closest('.nut-bam');
            if (!nut) return;
            const id = nut.closest('.the-khoa-hoc').getAttribute('data-id');
            const action = nut.getAttribute('data-action');

            if (action === 'chi-tiet') {
                window.location.href = `chi_tiet_khoa_hoc.html?id=${id}&user_id=${USER_ID}`;
            } else if (action === 'them') {
                if (confirm('Bạn có muốn tham gia khóa học này?')) {
                    // Gọi hàm xử lý tham gia
                    joinCourse(id);
                }
            }
        });
    }

    if (thanhTimKiem) {
        thanhTimKiem.addEventListener('input', (e) => {
            tuKhoaTimKiem = e.target.value.toLowerCase();
            trangHienTai = 1;
            renderDanhSach();
        });
    }

    if (tabKhoaHocCuaToi) tabKhoaHocCuaToi.addEventListener('click', () => window.location.href = `khoa_hoc_cua_toi.html?user_id=${USER_ID}`);

    // Dropdown filter toggle
    if (boLocHienTai) {
        boLocHienTai.addEventListener('click', (e) => {
            e.stopPropagation();
            menuLocDropdown.classList.toggle('an');
        });
    }

    // Đóng dropdown khi click bên ngoài
    document.addEventListener('click', (e) => {
        if (!menuLocDropdown.contains(e.target) && !boLocHienTai.contains(e.target)) {
            menuLocDropdown.classList.add('an');
        }
    });

    // Xử lý chọn filter
    if (menuLocDropdown) {
        menuLocDropdown.addEventListener('click', (e) => {
            const luaChon = e.target.closest('.lua-chon-loc');
            if (!luaChon) return;
            
            const filter = luaChon.getAttribute('data-filter');
            boLoc = filter;
            
            // Cập nhật active state
            menuLocDropdown.querySelectorAll('.lua-chon-loc').forEach(item => {
                item.classList.remove('active');
            });
            luaChon.classList.add('active');
            
            // Cập nhật tiêu đề
            const tieuDe = {
                'tat-ca': 'Tất cả khóa học',
                'da-tham-gia': 'Đã tham gia',
                'chua-tham-gia': 'Chưa tham gia'
            };
            tieuDeLoc.textContent = tieuDe[filter] || 'Tất cả khóa học';
            
            // Đóng dropdown và render lại
            menuLocDropdown.classList.add('an');
            trangHienTai = 1;
            renderDanhSach();
        });
    }

    // Init
    fetchCommunityCourses();
});