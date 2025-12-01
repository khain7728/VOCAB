document.addEventListener("DOMContentLoaded", function() {
    loadCourses(); // Tải danh sách

    // Gán sự kiện
    const el = (id) => document.getElementById(id);

    if (el('searchBox')) el('searchBox').addEventListener('keyup', searchTable);
    if (el('btnOpenAddModal')) el('btnOpenAddModal').addEventListener('click', () => openModal('add'));

    // Nút đóng/hủy modal chính
    if (el('btnCloseCourseModal')) el('btnCloseCourseModal').addEventListener('click', closeModal);
    if (el('btnCancelCourseModal')) el('btnCancelCourseModal').addEventListener('click', closeModal);

    // Nút Lưu
    if (el('saveCourseBtn')) el('saveCourseBtn').addEventListener('click', handleSaveCourse);

    // Modal Tag
    if (el('btnOpenTagModal')) el('btnOpenTagModal').addEventListener('click', (e) => {
        e.preventDefault();
        openTagModal();
    });
    if (el('btnCloseTagModal')) el('btnCloseTagModal').addEventListener('click', closeTagModal);
    if (el('btnConfirmTag')) el('btnConfirmTag').addEventListener('click', confirmTagSelection);

    // Click outside
    window.addEventListener('click', (e) => {
        if (e.target == el('courseModal')) closeModal();
        if (e.target == el('tagModal')) closeTagModal();
    });

    // Event Delegation cho bảng (Sửa/Xóa)
    const tbody = el('course_table_body');
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const id = btn.dataset.id;
            if (btn.classList.contains('btn-edit')) openModal('edit', id);
            if (btn.classList.contains('btn-delete')) handleDelete(id);
        });
    }
});

let allCourses = [];
let selectedTags = [];
const suggestedTags = ['Ngữ pháp', 'Từ vựng', 'Giao tiếp', 'IELTS', 'TOEFL', 'Business'];

// --- API FUNCTIONS ---

async function loadCourses() {
    const tbody = document.getElementById('course_table_body');
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">Đang tải...</td></tr>`;

    try {
        const res = await fetch('../../api/admin/course_get_list.php');
        const data = await res.json();
        if (data.status === 'success') {
            allCourses = data.data;
            renderTable(allCourses);
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-red">${data.message}</td></tr>`;
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-red">Lỗi kết nối!</td></tr>`;
    }
}

async function handleSaveCourse() {
    const id = document.getElementById('courseId').value;
    const name = document.getElementById('courseName').value.trim();

    if (!name) { alert("Vui lòng nhập tên khóa học!"); return; }

    const payload = {
        id: id, // Nếu id rỗng => Thêm mới
        name: name,
        status: document.getElementById('courseStatus').value,
        tags: document.getElementById('courseTag').value,
        description: document.getElementById('courseDescription').value
    };

    const url = id ? '../../api/admin/course_update.php' : '../../api/admin/course_create.php';

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (result.status === 'success') {
            alert("Thành công!");
            closeModal();
            loadCourses();
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (e) { alert("Lỗi hệ thống!"); }
}

async function handleDelete(id) {
    if (!confirm("Bạn chắc chắn muốn xóa?")) return;
    try {
        const res = await fetch('../../api/admin/course_delete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const result = await res.json();
        if (result.status === 'success') {
            alert("Đã xóa!");
            loadCourses();
        } else {
            alert(result.message);
        }
    } catch (e) { alert("Lỗi kết nối!"); }
}


function renderTable(data) {
    const tbody = document.getElementById('course_table_body');

    // Kiểm tra dữ liệu đầu vào
    if (!data || !Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">Không tìm thấy khóa học nào.</td></tr>`;
        return;
    }

    let html = '';
    data.forEach((item, index) => {
        // Ánh xạ dữ liệu an toàn (tránh undefined)
        const id = item.course_id;
        const code = item.course_code || '---'; // Nếu null thì hiện ---
        const name = item.course_name || '(Chưa đặt tên)'; // QUAN TRỌNG: Phải là course_name
        const author = item.author_name || 'Admin';

        // Badge trạng thái
        const statusBadge = (item.visibility === 'public') ?
            `<span class="status-badge public" style="background:#DEF7EC; color:#03543F; padding:4px 8px; border-radius:12px; font-size:12px;">Công khai</span>` :
            `<span class="status-badge private" style="background:#F3F4F6; color:#6B7280; padding:4px 8px; border-radius:12px; font-size:12px;">Riêng tư</span>`;

        html += `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td><strong>${code}</strong></td>
                <td>${name}</td>
                <td>${author}</td>
                <td class="text-center">${statusBadge}</td>
                <td class="text-center">
                    <button class="btn-action btn-edit" data-id="${id}"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-action btn-delete" data-id="${id}"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// Cũng cần sửa lại hàm tìm kiếm (searchTable) để tìm đúng cột
function searchTable() {
    const term = document.getElementById('searchBox').value.toLowerCase();
    const filtered = allCourses.filter(c =>
        (c.course_name || '').toLowerCase().includes(term) || // Sửa name -> course_name
        (c.course_code || '').toLowerCase().includes(term)
    );
    renderTable(filtered);
}

// --- MODAL LOGIC ---

function openModal(mode, id = null) {
    const modal = document.getElementById('courseModal');
    const title = document.getElementById('modalTitle');
    const btn = document.getElementById('saveCourseBtn');

    // Reset inputs
    document.getElementById('courseId').value = '';
    document.getElementById('courseCode').value = '';
    document.getElementById('courseName').value = '';
    document.getElementById('courseStatus').value = 'active';
    document.getElementById('courseTag').value = '';
    document.getElementById('courseDescription').value = '';

    if (mode === 'add') {
        title.innerText = "Thêm Khóa học Mới";
        btn.innerText = "Tạo khóa học";
        document.getElementById('courseCode').placeholder = "Hệ thống tự tạo sau khi lưu";
    } else {
        title.innerText = "Cập nhật Khóa học";
        btn.innerText = "Lưu thay đổi";
        const item = allCourses.find(c => c.course_id == id);
        if (item) {
            document.getElementById('courseId').value = item.course_id;
            document.getElementById('courseCode').value = item.course_code;
            document.getElementById('courseName').value = item.course_name;
            document.getElementById('courseStatus').value = (item.visibility === 'public') ? 'active' : 'hidden';
            document.getElementById('courseDescription').value = item.description || '';
            // Tags xử lý sau nếu API trả về tags
        }
    }
    modal.classList.add('show');
}

function closeModal() { document.getElementById('courseModal').classList.remove('show'); }

// --- TAG LOGIC ---
function openTagModal() {
    const val = document.getElementById('courseTag').value;
    selectedTags = val ? val.split(',').map(t => t.trim()).filter(Boolean) : [];
    renderTagUI();
    document.getElementById('tagModal').classList.add('show');
    document.getElementById('courseModal').style.opacity = '0.4';
    document.getElementById('courseModal').style.pointerEvents = 'none';
}

function closeTagModal() {
    document.getElementById('tagModal').classList.remove('show');
    document.getElementById('courseModal').style.opacity = '1';
    document.getElementById('courseModal').style.pointerEvents = 'auto';
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

    selectedTags.forEach(t => boxSel.appendChild(createTagEl(t, true)));
    suggestedTags.forEach(t => {
        if (!lowerSel.includes(t.toLowerCase())) boxSug.appendChild(createTagEl(t, false));
    });
}

function createTagEl(text, isSelected) {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = 'tag-item';
    if (isSelected) {
        span.style.background = '#DEF7EC';
        span.onclick = () => {
            selectedTags = selectedTags.filter(x => x !== text);
            renderTagUI();
        }
    } else {
        span.style.background = '#F3F4F6';
        span.onclick = () => {
            selectedTags.push(text);
            renderTagUI();
        }
    }
    return span;
}