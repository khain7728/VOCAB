/* Layout chung */

document.addEventListener("DOMContentLoaded", function() {
    fetchCourses();

    const searchBox = document.getElementById('searchBox');
    if (searchBox) searchBox.addEventListener('keyup', searchTable);

    const saveCourseBtn = document.getElementById('saveCourseBtn');
    if (saveCourseBtn) saveCourseBtn.addEventListener('click', saveCourse);

    const btnChonTag = document.getElementById('btn-chon-tag');
    if (btnChonTag) btnChonTag.onclick = openTagModal;

    const btnXacNhanTag = document.getElementById('btn-xac-nhan-tag');
    if (btnXacNhanTag) btnXacNhanTag.onclick = confirmTagSelection;

    const tagModalElement = document.getElementById('tagModal');
    if (tagModalElement) {
        const closeBtn = tagModalElement.querySelector('.close-btn');
        if (closeBtn) closeBtn.onclick = closeTagModal;
    }
});

let allCoursesData = [];
// --- BIẾN TOÀN CỤC ---
const courseTagInput = document.getElementById('courseTag');
const courseDescriptionTextarea = document.getElementById('courseDescription');
const tagModal = document.getElementById('tagModal');
const khungTagDaChon = document.getElementById('khung-tag-da-chon');
const khungTagGoiY = document.getElementById('khung-tag-goi-y');
const suggestedTags = ['Ngữ pháp', 'Từ vựng', 'Giao tiếp', 'IELTS', 'TOEFL', 'Business English'];
let selectedTags = [];

// --- HÀM 1: LẤY DANH SÁCH ---
async function fetchCourses() {
    // Sửa đường dẫn API cho đúng với cấu trúc thư mục của bạn
    // Nếu file html nằm ở pages/admin thì api nằm ở ../../api/admin/
    const apiUrl = '../../api/admin/course_get_list.php';
    const tableBody = document.getElementById('course_table_body');

    // Hiển thị trạng thái đang tải
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">Đang tải dữ liệu...</td></tr>`;

    try {
        const response = await fetch(apiUrl);

        // Kiểm tra lỗi HTTP (404, 500...)
        if (!response.ok) {
            throw new Error(`Lỗi HTTP: ${response.status} (Không tìm thấy API hoặc Server lỗi)`);
        }

        // Đọc text trước để debug nếu JSON lỗi
        const responseText = await response.text();

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error("Lỗi parse JSON:", responseText);
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Lỗi dữ liệu từ Server (Xem Console)</td></tr>`;
            return;
        }

        // Xử lý dữ liệu JSON hợp lệ
        if (result.status === 'success') {
            allCoursesData = result.data; // Lưu dữ liệu vào biến toàn cục
            renderTable(allCoursesData); // Vẽ bảng
        } else {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">${result.message || 'Không có dữ liệu'}</td></tr>`;
        }
    } catch (error) {
        console.error("Lỗi Fetch:", error);
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Lỗi kết nối: ${error.message}</td></tr>`;
    }
}

// --- HÀM 2: VẼ BẢNG (Render) ---
function renderTable(courses) {
    const tableBody = document.getElementById('course_table_body');

    if (!courses || courses.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: #666;">Không tìm thấy khóa học nào.</td></tr>`;
        return;
    }

    let html = '';
    courses.forEach((item, index) => {
        const id = item.id;

        // TẠO MÃ GIẢ LẬP (ENG01, ENG02...)
        let displayCode = "ENG" + String(id).padStart(2, '0');

        const name = item.name || "Chưa đặt tên";
        const author = item.author || "Admin"; // Lấy từ trường 'author' trong JSON

        // Xử lý trạng thái
        const status = item.status;
        let statusBadge = (status === 'public') ?
            `<span class="status-badge public">Công khai</span>` :
            `<span class="status-badge private">Riêng tư</span>`;

        html += `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td><strong>${displayCode}</strong></td>
                <td>${name}</td>
                <td>${author}</td>
                <td style="text-align: center;">${statusBadge}</td>
                <td style="text-align: center;">
                    <button class="btn-action btn-edit" onclick="openModal('edit', ${id})" title="Chỉnh sửa"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-action btn-delete" onclick="deleteCourse(${id})" title="Xóa"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    tableBody.innerHTML = html;
}

// --- HÀM 3: TÌM KIẾM ---
function searchTable() {
    const input = document.getElementById('searchBox');
    const filter = input.value.toLowerCase();

    const filteredData = allCoursesData.filter(item => {
        const name = (item.name || "").toLowerCase();
        // Tìm theo mã giả lập ENG...
        const generatedCode = ("eng" + String(item.id).padStart(2, '0'));
        return name.includes(filter) || generatedCode.includes(filter);
    });
    renderTable(filteredData);
}

// --- HÀM 4: MỞ MODAL ---
function openModal(mode, id = null) {
    const modal = document.getElementById('courseModal');
    const title = document.getElementById('modalTitle');
    const inpId = document.getElementById('courseId');
    const inpCode = document.getElementById('courseCode');
    const inpName = document.getElementById('courseName');
    const inpStatus = document.getElementById('courseStatus');

    if (mode === 'add') {
        title.innerText = "Thêm Khóa học Mới";
        document.getElementById('saveCourseBtn').innerText = "Thêm khóa học";
        inpId.value = "";

        inpCode.value = "Tự động sinh";
        inpCode.disabled = true;

        inpName.value = "";
        inpStatus.value = "active";
        courseTagInput.value = "";
        courseDescriptionTextarea.value = "";
        selectedTags = [];

    } else {
        title.innerText = "Chỉnh sửa Khóa học";
        document.getElementById('saveCourseBtn').innerText = "Lưu lại";

        const item = allCoursesData.find(c => c.id == id);
        if (item) {
            inpId.value = id;
            inpCode.value = "ENG" + String(id).padStart(2, '0');
            inpCode.disabled = true;
            inpName.value = item.name;
            inpStatus.value = (item.status === 'public') ? 'active' : 'hidden';

            // Xử lý Tags hiển thị (JSON trả về mảng tag nên phải join lại)
            let tagsValue = "";
            if (Array.isArray(item.tags)) {
                tagsValue = item.tags.join(', ');
                selectedTags = [...item.tags]; // Cập nhật cho modal tag
            } else {
                tagsValue = item.tags || "";
                if (tagsValue) selectedTags = tagsValue.split(',').map(t => t.trim());
            }

            courseTagInput.value = tagsValue;
            courseDescriptionTextarea.value = item.description || "";
        }
    }
    modal.classList.add('show');
}

// --- HÀM 5: ĐÓNG MODAL ---
function closeModal() {
    const modal = document.getElementById('courseModal');
    if (modal) modal.classList.remove('show');
}

window.onclick = function(event) {
    const courseModal = document.getElementById('courseModal');
    const tagModal = document.getElementById('tagModal');
    if (event.target == courseModal) closeModal();
    if (event.target == tagModal) closeTagModal();
}

// --- HÀM 7: LƯU DỮ LIỆU ---
async function saveCourse() {
    const id = document.getElementById('courseId').value;
    const name = document.getElementById('courseName').value.trim();
    const status = document.getElementById('courseStatus').value;
    const tags = courseTagInput.value.trim();
    const description = courseDescriptionTextarea.value.trim();

    if (!name) { alert("Vui lòng nhập Tên khóa học!"); return; }

    const url = id ? '../../api/admin/course_update.php' : '../../api/admin/course_create.php';

    const payload = {
        id: id,
        name: name,
        status: status,
        tags: tags,
        description: description
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.status === 'success') {
            alert(result.message || "Thành công!");
            closeModal();
            fetchCourses(); // Tải lại danh sách
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (error) {
        console.error(error);
        alert("Lỗi kết nối server!");
    }
}

// --- HÀM 8: XÓA ---
async function deleteCourse(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa khóa học này?")) return;
    try {
        const response = await fetch('../../api/admin/course_delete.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id }) });
        const result = await response.json();
        if (result.status === 'success') {
            alert("Đã xóa khóa học!");
            fetchCourses();
        } else { alert("Lỗi: " + result.message); }
    } catch (error) { alert("Lỗi kết nối server!"); }
}

// --- CÁC HÀM XỬ LÝ MODAL TAG ---
function openTagModal(event) {
    event.preventDefault();
    renderTags();
    tagModal.classList.add('show');
    document.getElementById('courseModal').style.opacity = '0.3';
    document.getElementById('courseModal').style.pointerEvents = 'none';
}

function closeTagModal() {
    tagModal.classList.remove('show');
    document.getElementById('courseModal').style.opacity = '1';
    document.getElementById('courseModal').style.pointerEvents = 'auto';
}

function renderTags() {
    khungTagDaChon.innerHTML = '';
    khungTagGoiY.innerHTML = '';
    const lowerSelected = selectedTags.map(t => t.toLowerCase());

    selectedTags.forEach(tag => {
        const tagElement = createTagElement(tag, 'selected');
        khungTagDaChon.appendChild(tagElement);
    });

    suggestedTags.filter(tag => !lowerSelected.includes(tag.toLowerCase())).forEach(tag => {
        const tagElement = createTagElement(tag, 'suggested');
        khungTagGoiY.appendChild(tagElement);
    });
}

function createTagElement(tagName, type) {
    const tag = document.createElement('span');
    tag.classList.add('tag-item');
    tag.textContent = tagName;
    if (type === 'suggested') {
        tag.onclick = () => {
            selectedTags.push(tagName);
            renderTags();
        };
    } else if (type === 'selected') {
        tag.onclick = () => {
            selectedTags = selectedTags.filter(t => t !== tagName);
            renderTags();
        };
    }
    return tag;
}

function confirmTagSelection() {
    courseTagInput.value = selectedTags.join(', ');
    closeTagModal();
}