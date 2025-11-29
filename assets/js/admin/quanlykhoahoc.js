document.addEventListener("DOMContentLoaded", function() {
    fetchCourses();

    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        searchBox.addEventListener('keyup', searchTable);
    }
});

let allCoursesData = [];

// --- HÀM 1: LẤY DANH SÁCH (Fetch) ---
async function fetchCourses() {
    // Đường dẫn API lấy danh sách
    const apiUrl = '../../api/admin/course_get_list.php';
    const tableBody = document.getElementById('course_table_body');
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">Đang tải dữ liệu...</td></tr>`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Lỗi HTTP: " + response.status);

        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error("Lỗi phân tích JSON từ course_get_list.php:", responseText.trim());
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Lỗi phân tích dữ liệu từ Server (Xem F12 Console).</td></tr>`;
            return;
        }

        if (result.status === 'success') {
            allCoursesData = result.data;
            renderTable(allCoursesData);
        } else {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">${result.message || 'Không có dữ liệu'}</td></tr>`;
        }
    } catch (error) {
        console.error("Lỗi Fetch/Kết nối:", error);
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Lỗi kết nối server</td></tr>`;
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
        const code = item.code || "---";
        const name = item.name || "Chưa đặt tên";
        const author = item.author || "Admin";
        const status = item.status; // Giá trị: 'public' hoặc 'private'

        const statusBadge = (status === 'public') ?
            `<span class="status-badge public">Công khai</span>` :
            `<span class="status-badge private">Đang ẩn</span>`;

        html += `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td><strong>${code}</strong></td>
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
        const code = (item.code || "").toLowerCase();
        return name.includes(filter) || code.includes(filter);
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
        title.innerText = "Thêm khóa học mới";
        inpId.value = "";
        inpCode.value = "";
        inpName.value = "";
        inpStatus.value = "active";
    } else {
        title.innerText = "Cập nhật khóa học";
        const item = allCoursesData.find(c => c.id == id);
        if (item) {
            inpId.value = id;
            inpCode.value = item.code;
            inpName.value = item.name;
            // Map từ DB 'public' -> select 'active'
            inpStatus.value = (item.status === 'public') ? 'active' : 'hidden';
        }
    }

    modal.classList.add('show');
}

// --- HÀM 5: ĐÓNG MODAL ---
function closeModal() {
    const modal = document.getElementById('courseModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// --- HÀM 6: ĐÓNG MODAL KHI CLICK NGOÀI ---
window.onclick = function(event) {
    const modal = document.getElementById('courseModal');
    if (event.target == modal) closeModal();
}


// --- HÀM 7: LƯU DỮ LIỆU (THÊM / SỬA) ---
// Code này được bạn cung cấp, đã được thêm vào đây
async function saveCourse() {
    // 1. Lấy giá trị từ Form
    const id = document.getElementById('courseId').value;
    const code = document.getElementById('courseCode').value.trim();
    const name = document.getElementById('courseName').value.trim();
    const status = document.getElementById('courseStatus').value;

    // 2. Validate dữ liệu
    if (!code || !name) {
        alert("Vui lòng nhập đầy đủ Mã và Tên khóa học!");
        return;
    }

    // 3. Xác định API cần gọi
    const url = id ? '../../api/admin/course_update.php' : '../../api/admin/course_create.php';

    // 4. Chuẩn bị dữ liệu gửi đi
    const payload = {
        id: id,
        code: code,
        name: name,
        status: status
    };

    console.log("Đang gửi dữ liệu:", payload); // Debug: Xem gửi gì đi

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Kiểm tra xem phản hồi có phải JSON không
        const responseText = await response.text();
        console.log("Server trả về:", responseText); // Debug: Xem server trả gì về

        let result;
        try {
            // Thử parse JSON
            result = JSON.parse(responseText);
        } catch (e) {
            console.error("Lỗi phân tích JSON:", e);
            alert("Lỗi server: Phản hồi không đúng định dạng JSON. Xem console (F12) để biết thêm.");
            return;
        }

        // 5. Xử lý kết quả
        if (result.status === 'success') {
            alert(result.message || "Thao tác thành công!");

            // --- QUAN TRỌNG: ĐÓNG MODAL TẠI ĐÂY ---
            closeModal();

            // Tải lại danh sách
            fetchCourses();
        } else {
            alert("Thất bại: " + (result.message || "Lỗi không xác định"));
        }

    } catch (error) {
        console.error("Lỗi hệ thống:", error);
        alert("Lỗi kết nối server hoặc lỗi Javascript! Hãy nhấn F12 chọn tab Console để xem.");
    }
}

// --- HÀM 8: XÓA ---
async function deleteCourse(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa khóa học này?")) return;

    try {
        const response = await fetch('../../api/admin/course_delete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const result = await response.json();

        if (result.status === 'success') {
            alert("Đã xóa khóa học!");
            fetchCourses();
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (error) {
        console.error(error);
        alert("Lỗi kết nối server!");
    }
}