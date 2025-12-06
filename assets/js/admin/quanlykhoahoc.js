/**
 * Tệp: assets/js/admin/quanlykhoahoc.js
 */

document.addEventListener("DOMContentLoaded", function() {
    loadCsrfToken(); // 1. Lấy Token bảo mật
    fetchCourses(); // 2. Tải dữ liệu bảng
    setupEventListeners(); // 3. Gán sự kiện
});

// --- 1. STATE & CONFIG ---
let currentPage = 1;
let currentSort = { col: 'created_at', order: 'DESC' };
let searchTimer = null;
let csrfToken = '';

// Dữ liệu cho Modal Tag
let selectedTags = [];
const suggestedTags = ['Ngữ pháp', 'Từ vựng', 'Giao tiếp', 'IELTS', 'TOEFL', 'Business', 'CNTT', 'Y học'];
let allCourses = [];

// --- 2. HÀM API CHÍNH ---

async function loadCsrfToken() {
    try {
        const res = await fetch('../../api/common/get_csrf.php');
        const data = await res.json();
        if (data.token) {
            csrfToken = data.token;
            const inputCsrf = document.getElementById('csrf_token');
            if (inputCsrf) inputCsrf.value = data.token;
        }
    } catch (e) { console.error("Lỗi lấy CSRF Token", e); }
}

async function fetchCourses() {
    const tableBody = document.getElementById('course_table_body');
    const searchVal = document.getElementById('searchCourseBox').value.trim();
    const statusVal = document.getElementById('filterStatus') ? document.getElementById('filterStatus').value : '';

    // Loading State
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-4"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu...</td></tr>`;

    const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        sort_by: currentSort.col,
        order: currentSort.order,
        search: searchVal,
        status: statusVal
    });

    try {
        const res = await fetch(`../../api/admin/course_get_list.php?${params.toString()}`);
        const result = await res.json();

        if (result.status === 'success') {
            allCourses = result.data;
            renderTable(result.data, (currentPage - 1) * 10);
            renderPagination(result.pagination);
        } else {
            tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-red">${escapeHtml(result.message)}</td></tr>`;
        }
    } catch (e) {
        console.error(e);
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-red">Lỗi kết nối máy chủ (JSON Parse Error)!</td></tr>`;
    }
}

// --- 3. RENDER UI ---

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return text.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function formatDate(dateString) {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function renderTable(data, startIndex) {
    const tbody = document.getElementById('course_table_body');
    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center">Không tìm thấy khóa học nào.</td></tr>`;
        return;
    }

    let html = '';
    data.forEach((item, index) => {
        const id = item.course_id;

        // Render Tags dạng badge
        let tagsHtml = '';
        if (item.tags) {
            tagsHtml = item.tags.split(',').map(t =>
                `<span style="background:#EEF2FF; color:#4F46E5; padding:2px 6px; border-radius:4px; font-size:11px; margin-right:2px;">${escapeHtml(t.trim())}</span>`
            ).join('');
        }

        const statusBadge = (item.visibility === 'public') ?
            `<span class="status-badge public">Công khai</span>` :
            `<span class="status-badge private">Riêng tư</span>`;

        html += `
            <tr>
                <td class="text-center">${startIndex + index + 1}</td>
                <td><strong>${escapeHtml(item.course_code)}</strong></td>
                <td>${escapeHtml(item.course_name)}</td>
                <td>${tagsHtml}</td>
                <td>${escapeHtml(item.author_name)}</td>
                <td>${formatDate(item.created_at)}</td>
                <td class="text-center">${statusBadge}</td>
                <td class="text-center">
                    <button class="btn-action btn-edit" onclick="openModal('edit', ${id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-action btn-delete" onclick="handleDelete(${id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// --- HÀM PHÂN TRANG MỚI (CẬP NHẬT) ---
function renderPagination(paging) {
    const container = document.getElementById('pagination');
    if (!container) return;

    // Nếu chỉ có 1 trang hoặc không có dữ liệu -> Xóa phân trang
    if (paging.total_pages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    // Nút Previous (<)
    html += `<button class="page-btn" onclick="changePage(${paging.current_page - 1})" ${paging.current_page === 1 ? 'disabled' : ''}>
                <i class="fa-solid fa-chevron-left"></i>
             </button>`;

    // Các nút số trang
    for (let i = 1; i <= paging.total_pages; i++) {
        // Logic hiển thị: Trang đầu, Trang cuối, và các trang xung quanh trang hiện tại (+-1)
        if (i === 1 || i === paging.total_pages || (i >= paging.current_page - 1 && i <= paging.current_page + 1)) {
            const activeClass = i === paging.current_page ? 'active' : '';
            html += `<button class="page-btn ${activeClass}" onclick="changePage(${i})">${i}</button>`;
        }
        // Logic hiển thị dấu ...
        else if (i === paging.current_page - 2 || i === paging.current_page + 2) {
            html += `<span class="page-dots">...</span>`;
        }
    }

    // Nút Next (>)
    html += `<button class="page-btn" onclick="changePage(${paging.current_page + 1})" ${paging.current_page === paging.total_pages ? 'disabled' : ''}>
                <i class="fa-solid fa-chevron-right"></i>
             </button>`;

    container.innerHTML = html;
}

window.changePage = function(page) {
    if (page < 1) return;
    currentPage = page;
    fetchCourses();
}

// --- 4. XỬ LÝ SỰ KIỆN (MODAL, BUTTON) ---

function setupEventListeners() {
    // Tìm kiếm (Debounce)
    const searchBox = document.getElementById('searchCourseBox');
    if (searchBox) {
        searchBox.addEventListener('input', () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                currentPage = 1;
                fetchCourses();
            }, 500);
        });
    }

    // Lọc trạng thái
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
        filterStatus.addEventListener('change', () => {
            currentPage = 1;
            fetchCourses();
        });
    }

    // Sắp xếp cột
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.getAttribute('data-sort');
            if (currentSort.col === col) {
                currentSort.order = currentSort.order === 'ASC' ? 'DESC' : 'ASC';
            } else {
                currentSort.col = col;
                currentSort.order = 'DESC';
            }
            // Update icon visually
            document.querySelectorAll('th.sortable i').forEach(i => i.className = 'fa-solid fa-sort');
            th.querySelector('i').className = currentSort.order === 'ASC' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';

            fetchCourses();
        });
    });

    // Các nút Modal
    if (document.getElementById('btnOpenAddModal')) document.getElementById('btnOpenAddModal').onclick = () => openModal('add');
    if (document.getElementById('btnCloseCourseModal')) document.getElementById('btnCloseCourseModal').onclick = closeModal;
    if (document.getElementById('btnCancelCourseModal')) document.getElementById('btnCancelCourseModal').onclick = closeModal;
    if (document.getElementById('saveCourseBtn')) document.getElementById('saveCourseBtn').onclick = handleSaveCourse;

    // Các nút Tag Modal
    if (document.getElementById('btnOpenTagModal')) document.getElementById('btnOpenTagModal').onclick = (e) => {
        e.preventDefault();
        openTagModal();
    };
    if (document.getElementById('btnCloseTagModal')) document.getElementById('btnCloseTagModal').onclick = closeTagModal;
    if (document.getElementById('btnConfirmTag')) document.getElementById('btnConfirmTag').onclick = confirmTagSelection;
}

// --- 5. LOGIC MODAL & TAG ---

window.openModal = async function(mode, id = null) {
    const modal = document.getElementById('courseModal');
    const title = document.getElementById('modalTitle');
    const btn = document.getElementById('saveCourseBtn');

    // Reset Form
    document.getElementById('courseId').value = '';
    document.getElementById('courseName').value = '';
    document.getElementById('courseStatus').value = 'active';
    document.getElementById('courseTag').value = '';
    document.getElementById('courseDescription').value = '';
    selectedTags = [];

    if (mode === 'add') {
        title.innerText = "Thêm Khóa học Mới";
        btn.innerText = "Thêm từ vựng";
    } else {
        title.innerText = "Cập nhật Khóa học";
        btn.innerText = "Lưu & Thêm từ vựng";

        const item = allCourses.find(c => c.course_id == id);
        if (item) {
            document.getElementById('courseId').value = item.course_id;
            document.getElementById('courseName').value = item.course_name;
            document.getElementById('courseStatus').value = (item.visibility === 'public') ? 'active' : 'hidden';
            document.getElementById('courseDescription').value = item.description || '';

            if (item.tags) {
                document.getElementById('courseTag').value = item.tags;
                selectedTags = item.tags.split(',').map(t => t.trim()).filter(Boolean);
            }
        }
    }
    modal.classList.add('show');
}

function closeModal() { document.getElementById('courseModal').classList.remove('show'); }

function openTagModal() {
    const val = document.getElementById('courseTag').value;
    selectedTags = val ? val.split(',').map(t => t.trim()).filter(Boolean) : [];
    renderTagUI();
    document.getElementById('tagModal').classList.add('show');
}

function closeTagModal() { document.getElementById('tagModal').classList.remove('show'); }

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
    span.style.cssText = "display:inline-block; padding:5px 10px; margin:4px; border-radius:15px; cursor:pointer; font-size:13px;";

    if (isSelected) {
        span.style.background = '#DEF7EC';
        span.style.color = '#03543F';
        span.innerHTML += ' <i class="fa-solid fa-times" style="margin-left:5px; font-size:10px;"></i>';
        span.onclick = () => {
            selectedTags = selectedTags.filter(x => x !== text);
            renderTagUI();
        };
    } else {
        span.style.background = '#F3F4F6';
        span.style.color = '#4B5563';
        span.onclick = () => {
            selectedTags.push(text);
            renderTagUI();
        };
    }
    return span;
}

// --- 6. XỬ LÝ LƯU & XÓA ---

async function handleSaveCourse() {
    const btn = document.getElementById('saveCourseBtn');
    const id = document.getElementById('courseId').value;
    const name = document.getElementById('courseName').value.trim();
    const desc = document.getElementById('courseDescription').value.trim();

    if (!name) { alert("Vui lòng nhập tên khóa học!"); return; }
    if (name.length < 5) { alert("Tên khóa học quá ngắn!"); return; }

    const payload = {
        id: id,
        name: name,
        description: desc,
        status: document.getElementById('courseStatus').value,
        tags: document.getElementById('courseTag').value,
        csrf_token: csrfToken
    };

    const url = id ? '../../api/admin/course_update.php' : '../../api/admin/course_create.php';

    btn.disabled = true;
    const originalText = btn.innerText;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (result.status === 'success') {
            closeModal();
            if (!id && result.data && result.data.id) {
                if (confirm("Tạo thành công! Chuyển đến trang thêm từ vựng ngay?")) {
                    window.location.href = `themtuvung.html?id=${result.data.id}`;
                } else {
                    fetchCourses();
                }
            } else {
                fetchCourses();
                alert(result.message);
            }
        } else {
            alert(result.message);
            if (result.message.includes('CSRF')) loadCsrfToken();
        }
    } catch (e) {
        alert("Lỗi hệ thống hoặc phiên đăng nhập hết hạn!");
        console.error(e);
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
}

window.handleDelete = async function(id) {
    if (!confirm("CẢNH BÁO: Xóa khóa học sẽ xóa toàn bộ bài học và lịch sử liên quan.\nTiếp tục?")) return;

    try {
        const res = await fetch('../../api/admin/course_delete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, csrf_token: csrfToken })
        });
        const result = await res.json();
        if (result.status === 'success') {
            fetchCourses();
        } else {
            alert(result.message);
        }
    } catch (e) { alert("Lỗi kết nối!"); }
}