// (Quy tắc 9) Chờ DOM tải xong
document.addEventListener('DOMContentLoaded', function() {

    // --- 1. Dữ liệu mẫu (Cho trang cộng đồng) ---
    const mockCongDongData = [
        {
            id: 101,
            tieuDe: 'Khóa học số 3',
            mota: 'Tiếng anh cho người mới bắt đầu',
            nguoiTao: 'Mino',
            soTu: 20,
            hocVien: 10,
            tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4'],
            daThamGia: true // Đã tham gia
        },
        {
            id: 102,
            tieuDe: 'Hoạt động',
            mota: 'Làm quen với từ chỉ hoạt động',
            nguoiTao: 'Mino',
            soTu: 20,
            hocVien: 10,
            tags: ['Tag1', 'Tag2'],
            daThamGia: false // Chưa tham gia
        },
        {
            id: 103,
            tieuDe: 'Thể thao',
            mota: 'Làm quen với từ chỉ thể thao',
            nguoiTao: 'Mino',
            soTu: 20,
            hocVien: 10,
            tags: ['Tag1', 'Tag2', 'Tag3'],
            daThamGia: false // Chưa tham gia
        },
        {
            id: 104,
            tieuDe: 'Thức ăn',
            mota: 'Làm quen với từ chỉ thức ăn',
            nguoiTao: 'Mino',
            soTu: 20,
            hocVien: 10,
            tags: ['Tag1', 'Tag2', 'Tag3'],
            daThamGia: false // Chưa tham gia
        },
        {
            id: 105,
            tieuDe: 'Thời tiết',
            mota: 'Làm quen với từ chỉ thời tiết',
            nguoiTao: 'Mino',
            soTu: 20,
            hocVien: 10,
            tags: ['Tag1', 'Tag2', 'Tag3'],
            daThamGia: false // Chưa tham gia
        },
        // Thêm dữ liệu để test phân trang
        {
            id: 106,
            tieuDe: 'Âm nhạc (Trang 2)',
            mota: 'Các loại nhạc cụ',
            nguoiTao: 'Admin',
            soTu: 30,
            hocVien: 5,
            tags: ['Music', 'Test'],
            daThamGia: true // Đã tham gia
        }
    ];

    // --- 2. Khởi tạo các phần tử DOM ---
    const tabKhoaHocCuaToi = document.getElementById('tab-khoa-hoc-cua-toi');
    const thanhTimKiem = document.getElementById('thanh-tim-kiem');
    const danhSachContainer = document.getElementById('danh-sach-khoa-hoc-cong-dong');
    const khungPhanTrang = document.getElementById('khung-phan-trang');

    // --- 3. Biến trạng thái ---
    let tuKhoaTimKiem = '';
    let trangHienTai = 1;
    const soMucTrenTrang = 5; // 5 khóa học mỗi trang

    // --- 4. Hàm chức năng ---

    /**
     * Hàm chính để tải và hiển thị danh sách khóa học
     */
    function renderDanhSach() {
        if (!danhSachContainer) return;

        let dataToRender = mockCongDongData;

        // 1. Lọc theo từ khóa tìm kiếm
        if (tuKhoaTimKiem) {
            dataToRender = dataToRender.filter(kh => 
                kh.tieuDe.toLowerCase().includes(tuKhoaTimKiem) ||
                kh.mota.toLowerCase().includes(tuKhoaTimKiem)
            );
        }

        // 2. Phân trang
        const tongSoMuc = dataToRender.length;
        const tongSoTrang = Math.ceil(tongSoMuc / soMucTrenTrang);
        const batDau = (trangHienTai - 1) * soMucTrenTrang;
        const ketThuc = batDau + soMucTrenTrang;
        const dataTrenTrang = dataToRender.slice(batDau, ketThuc);

        // Xóa nội dung cũ
        danhSachContainer.innerHTML = '';

        // Render dữ liệu
        if (dataTrenTrang.length === 0) {
            danhSachContainer.innerHTML = '<p class="thong-bao-rong">Không có khóa học nào để hiển thị.</p>';
        } else {
            dataTrenTrang.forEach(kh => {
                danhSachContainer.appendChild(taoTheKhoaHoc(kh));
            });
        }
        
        // Render phân trang
        renderPhanTrang(tongSoTrang);
    }
    
    /**
     * (Quy tắc 3) Tạo HTML cho một thẻ khóa học CỘNG ĐỒNG
     */
    function taoTheKhoaHoc(kh) {
        const theDiv = document.createElement('div');
        theDiv.className = 'the-khoa-hoc';
        theDiv.setAttribute('data-id', kh.id);

        // Trạng thái (badge)
        const classTrangThai = kh.daThamGia ? 'trang-thai-da-tham-gia' : 'trang-thai-chua-tham-gia';
        const textTrangThai = kh.daThamGia ? 'Đã tham gia' : 'Chưa tham gia';

        // Nút "Thêm" (chỉ hiện khi chưa tham gia)
        const nutThemHtml = !kh.daThamGia
            ? `<button class="nut-bam nut-them" data-action="them">Thêm</button>`
            : ''; // Nếu đã tham gia thì không hiện nút "Thêm"

        // (Quy tắc 3) Dùng span và id cho các số động
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
                    <span class="giatri-khoi" id="so-tu-${kh.id}">${kh.soTu} từ</span>
                </div>
                <div class="khoi-thong-tin">
                    <span class="tieu-de-khoi">Học viên</span>
                    <span class="giatri-khoi" id="hoc-vien-${kh.id}">${kh.hocVien}</span>
                </div>
            </div>
            <div class="khung-tags">
                ${kh.tags.map(tag => `<span class="the-tag">${tag}</span>`).join('')}
            </div>
            <div class="khung-nut-bam">
                <button class="nut-bam nut-xem-chi-tiet" data-action="chi-tiet">Xem chi tiết</button>
                ${nutThemHtml}
            </div>
        `;
        return theDiv;
    }

    /**
     * Tải và hiển thị các nút phân trang
     */
    function renderPhanTrang(tongSoTrang) {
        if (!khungPhanTrang) return;
        khungPhanTrang.innerHTML = '';

        if (tongSoTrang <= 1) return; // Không cần phân trang

        // Nút Trang trước
        const nutTruoc = document.createElement('button');
        nutTruoc.className = 'nut-phan-trang';
        nutTruoc.innerHTML = '<i class="fa-solid fa-chevron-left"></i> Trang trước';
        nutTruoc.disabled = (trangHienTai === 1);
        nutTruoc.addEventListener('click', () => {
            if (trangHienTai > 1) {
                trangHienTai--;
                renderDanhSach();
            }
        });
        khungPhanTrang.appendChild(nutTruoc);

        // Các nút số trang
        for (let i = 1; i <= tongSoTrang; i++) {
            const nutTrang = document.createElement('button');
            nutTrang.className = 'nut-phan-trang';
            nutTrang.textContent = i;
            if (i === trangHienTai) {
                nutTrang.classList.add('trang-hien-tai');
            }
            nutTrang.addEventListener('click', () => {
                trangHienTai = i;
                renderDanhSach();
            });
            khungPhanTrang.appendChild(nutTrang);
        }

        // Nút Trang sau
        const nutSau = document.createElement('button');
        nutSau.className = 'nut-phan-trang';
        nutSau.innerHTML = 'Trang sau <i class="fa-solid fa-chevron-right"></i>';
        nutSau.disabled = (trangHienTai === tongSoTrang);
        nutSau.addEventListener('click', () => {
            if (trangHienTai < tongSoTrang) {
                trangHienTai++;
                renderDanhSach();
            }
        });
        khungPhanTrang.appendChild(nutSau);
    }


    // --- 5. Gán Event Listeners (Quy tắc 9) ---

    // Chuyển tab VỀ trang "Khóa học của tôi"
    if (tabKhoaHocCuaToi) {
        tabKhoaHocCuaToi.addEventListener('click', () => {
            window.location.href = 'khoa_hoc_cua_toi.html';
        });
    }

    // Tìm kiếm
    if (thanhTimKiem) {
        thanhTimKiem.addEventListener('input', (e) => {
            tuKhoaTimKiem = e.target.value.toLowerCase();
            trangHienTai = 1; // Reset về trang 1
            renderDanhSach();
        });
    }

    // (Quy tắc 9) Xử lý click các nút trong thẻ (Event Delegation)
    if (danhSachContainer) {
        danhSachContainer.addEventListener('click', (e) => {
            const nut = e.target.closest('.nut-bam');
            if (!nut) return;

            const the = nut.closest('.the-khoa-hoc');
            const khoaHocId = the.getAttribute('data-id');
            const hanhDong = nut.getAttribute('data-action');

            switch (hanhDong) {
                case 'chi-tiet':
                    alert(`Xem chi tiết khóa học ID: ${khoaHocId}`);
                    // window.location.href = `chi_tiet_khoa_hoc.html?id=${khoaHocId}`;
                    break;
                case 'them':
                    alert(`Tham gia khóa học ID: ${khoaHocId}`);
                    // Logic: gọi API để tham gia, sau đó render lại
                    // const khoaHoc = mockCongDongData.find(kh => kh.id == khoaHocId);
                    // khoaHoc.daThamGia = true;
                    // renderDanhSach();
                    break;
            }
        });
    }

    // --- 6. Khởi tạo ban đầu ---
    renderDanhSach(); // Tải danh sách lần đầu
    
    console.log("Trang Khóa học cộng đồng (khoa_hoc_cong_dong.js) đã tải thành công.");
});