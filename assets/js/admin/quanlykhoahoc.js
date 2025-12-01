document.addEventListener("DOMContentLoaded", function() {
    loadCourses(); // Tải danh sách khóa học khi vào trang

    // --- GÁN SỰ KIỆN (EVENT LISTENERS) ---
    const el = (id) => document.getElementById(id);

    // Tìm kiếm
    if (el('searchBox')) el('searchBox').addEventListener('keyup', searchTable);

    // Nút mở modal Thêm mới
    if (el('btnOpenAddModal')) el('btnOpenAddModal').addEventListener('click', () => openModal('add'));

    // Các nút Đóng/Hủy Modal Khóa học
    if (el('btnCloseCourseModal')) el('btnCloseCourseModal').addEventListener('click', closeModal);
    if (el('btnCancelCourseModal')) el('btnCancelCourseModal').addEventListener('click', closeModal);

    // Nút Lưu (Chính là nút "Thêm từ vựng")
    if (el('saveCourseBtn')) el('saveCourseBtn').addEventListener('click', handleSaveCourse);

    // --- Xử lý Modal Tag ---
    if (el('btnOpenTagModal')) el('btnOpenTagModal').addEventListener('click', (e) => {
        e.preventDefault();
        openTagModal();
    });
    if (el('btnCloseTagModal')) el('btnCloseTagModal').addEventListener('click', closeTagModal);
    if (el('btnConfirmTag')) el('btnConfirmTag').addEventListener('click', confirmTagSelection);

    // Click ra ngoài để đóng modal
    window.addEventListener('click', (e) => {
        if (e.target == el('courseModal')) closeModal();
        if (e.target == el('tagModal')) closeTagModal();
    });

    // --- Xử lý sự kiện trong Bảng (Sửa / Xóa) ---
    const tbody = el('course_table_body');
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            // Tìm nút button gần nhất được click (tránh click vào icon i)
            const btn = e.target.closest('button');
            if (!btn) return;

            const id = btn.dataset.id;

            // Nếu click nút Sửa
            if (btn.classList.contains('btn-edit')) {
                openModal('edit', id);
            }

            // Nếu click nút Xóa
            if (btn.classList.contains('btn-delete')) {
                handleDelete(id);
            }
        });
    }
});

let allCourses = [];
let selectedTags = [];
const suggestedTags = ['Ngữ pháp', 'Từ vựng', 'Giao tiếp', 'IELTS', 'TOEFL', 'Business', 'CNTT', 'Y học'];

// --- 1. CÁC HÀM API (FETCH DATA) ---

async function loadCourses() {
    const tbody = document.getElementById('course_table_body');
    tbody.innerHTML = `<tr><td colspan="7" class="text-center">Đang tải dữ liệu...</td></tr>`;

    try {
        // Gọi API lấy danh sách
        const res = await fetch('../../api/admin/course_get_list.php');
        const data = await res.json();

        if (data.status === 'success') {
            allCourses = data.data; // Lưu dữ liệu gốc để dùng cho search/edit
            renderTable(allCourses);
        } else {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-red">${data.message}</td></tr>`;
        }
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-red">Lỗi kết nối máy chủ!</td></tr>`;
    }
}

// --- QUAN TRỌNG: Hàm xử lý Lưu và Chuyển trang ---
async function handleSaveCourse() {
    const id = document.getElementById('courseId').value;
    const name = document.getElementById('courseName').value.trim();

    if (!name) { alert("Vui lòng nhập tên khóa học!"); return; }

    const payload = {
        id: id,
        name: name,
        status: document.getElementById('courseStatus').value,
        tags: document.getElementById('courseTag').value,
        description: document.getElementById('courseDescription').value
    };

    // Xác định API: Nếu có ID là Update, không có là Create
    const url = id ? '../../api/admin/course_update.php' : '../../api/admin/course_create.php';

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (result.status === 'success') {
            // Đóng modal
            closeModal();

            // Lấy ID: Ưu tiên lấy từ kết quả trả về (thêm mới), nếu không thì lấy từ input (sửa)
            const targetCourseId = (result.data && result.data.id) ? result.data.id : id;

            if (targetCourseId) {
                // --- SỬA Ở ĐÂY ---
                // Chuyển sang trang "them_tu_vung.html" của ADMIN (nằm cùng thư mục)
                // Không chuyển sang trang user nữa
                window.location.href = `themtuvung.html?id=${targetCourseId}`;

            } else {
                alert("Đã lưu thành công nhưng không lấy được ID.");
                loadCourses();
            }
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi hệ thống khi lưu khóa học!");
    }
}

async function handleDelete(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa khóa học này không?")) return;
    try {
        const res = await fetch('../../api/admin/course_delete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const result = await res.json();
        if (result.status === 'success') {
            alert("Đã xóa khóa học!");
            loadCourses();
        } else {
            alert(result.message);
        }
    } catch (e) { alert("Lỗi kết nối!"); }
}


// --- 2. CÁC HÀM RENDER GIAO DIỆN ---

// Hàm định dạng ngày tháng
function formatDate(dateString) {
    if (!dateString) return '---';
    const date = new Date(dateString);
    // Định dạng: dd/mm/yyyy HH:MM
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function renderTable(data) {
    const tbody = document.getElementById('course_table_body');

    // Kiểm tra dữ liệu
    if (!data || !Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center">Không tìm thấy khóa học nào.</td></tr>`;
        return;
    }

    let html = '';
    data.forEach((item, index) => {
        // Lấy dữ liệu an toàn
        const id = item.course_id || item.id;
        const code = item.course_code || '---';
        const name = item.course_name || item.name || '(Chưa đặt tên)';
        const author = item.author_name || 'Admin';

        // Lấy ngày tạo (item.created_at phải trùng với tên cột trong CSDL)
        const dateCreated = formatDate(item.created_at);

        // Badge trạng thái
        const statusBadge = (item.visibility === 'public' || item.status === 'active') ?
            `<span class="status-badge public" style="background:#DEF7EC; color:#03543F; padding:4px 8px; border-radius:12px; font-size:12px;">Công khai</span>` :
            `<span class="status-badge private" style="background:#F3F4F6; color:#6B7280; padding:4px 8px; border-radius:12px; font-size:12px;">Riêng tư</span>`;

        html += `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td><strong>${code}</strong></td>
                <td>${name}</td>
                <td>${author}</td>
                <td>${dateCreated}</td> 
                <td class="text-center">${statusBadge}</td>
                <td class="text-center">
                    <button class="btn-action btn-edit" data-id="${id}" title="Sửa thông tin"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-action btn-delete" data-id="${id}" title="Xóa khóa học"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function searchTable() {
    const term = document.getElementById('searchBox').value.toLowerCase();
    const filtered = allCourses.filter(c =>
        (c.course_name || c.name || '').toLowerCase().includes(term) ||
        (c.course_code || '').toLowerCase().includes(term)
    );
    renderTable(filtered);
}

// --- 3. MODAL LOGIC (KHÓA HỌC) ---

function openModal(mode, id = null) {
    const modal = document.getElementById('courseModal');
    const title = document.getElementById('modalTitle');
    const btn = document.getElementById('saveCourseBtn');

    // Reset form
    document.getElementById('courseId').value = '';
    document.getElementById('courseCode').value = ''; // Input này ẩn
    document.getElementById('courseName').value = '';
    document.getElementById('courseStatus').value = 'active';
    document.getElementById('courseTag').value = '';
    document.getElementById('courseDescription').value = '';
    selectedTags = []; // Reset mảng tag

    if (mode === 'add') {
        title.innerText = "Thêm Khóa học Mới";
        btn.innerText = "Thêm từ vựng"; // Nút đổi tên theo yêu cầu
    } else {
        title.innerText = "Cập nhật Khóa học";
        btn.innerText = "Lưu & Thêm từ vựng";

        // Tìm dữ liệu cũ để điền vào form
        const item = allCourses.find(c => (c.course_id || c.id) == id);
        if (item) {
            document.getElementById('courseId').value = item.course_id || item.id;
            document.getElementById('courseCode').value = item.course_code;
            document.getElementById('courseName').value = item.course_name || item.name;
            document.getElementById('courseStatus').value = (item.visibility === 'public' || item.status === 'active') ? 'active' : 'hidden';
            document.getElementById('courseDescription').value = item.description || '';
            document.getElementById('courseTag').value = item.tags || '';

            // Cập nhật mảng selectedTags nếu có tags
            if (item.tags) {
                selectedTags = item.tags.split(',').map(t => t.trim()).filter(Boolean);
            }
        }
    }
    modal.classList.add('show');
}

function closeModal() {
    document.getElementById('courseModal').classList.remove('show');
}


// --- 4. MODAL LOGIC (TAGS) ---
// Giữ nguyên logic chọn Tag để không bị lỗi chức năng này

function openTagModal() {
    const val = document.getElementById('courseTag').value;
    // Đồng bộ input vào biến mảng
    selectedTags = val ? val.split(',').map(t => t.trim()).filter(Boolean) : [];
    renderTagUI();

    document.getElementById('tagModal').classList.add('show');
}

function closeTagModal() {
    document.getElementById('tagModal').classList.remove('show');
}

function confirmTagSelection() {
    document.getElementById('courseTag').value = selectedTags.join(', ');
    closeTagModal();
}

function renderTagUI() {
    const boxSel = document.getElementById('khung-tag-da-chon');
    const boxSug = document.getElementById('khung-tag-goi-y');
    boxSel.innerHTML = '';
    boxSug.innerHTML = '';

    const lowerSel = selectedTags.map(t => t.toLowerCase());

    // Render tag đã chọn
    selectedTags.forEach(t => boxSel.appendChild(createTagEl(t, true)));

    // Render tag gợi ý (trừ những cái đã chọn)
    suggestedTags.forEach(t => {
        if (!lowerSel.includes(t.toLowerCase())) boxSug.appendChild(createTagEl(t, false));
    });
}

function createTagEl(text, isSelected) {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = 'tag-item';
    span.style.cursor = 'pointer';
    span.style.margin = '4px';
    span.style.padding = '5px 10px';
    span.style.borderRadius = '15px';
    span.style.display = 'inline-block';
    span.style.fontSize = '13px';

    if (isSelected) {
        span.style.background = '#DEF7EC';
        span.style.color = '#03543F';
        span.innerHTML += ' <i class="fa-solid fa-times" style="font-size:10px; margin-left:4px"></i>';
        span.onclick = () => {
            selectedTags = selectedTags.filter(x => x !== text);
            renderTagUI();
        }
    } else {
        span.style.background = '#F3F4F6';
        span.style.color = '#4B5563';
        span.onclick = () => {
            selectedTags.push(text);
            renderTagUI();
        }
    }
    return span;
}