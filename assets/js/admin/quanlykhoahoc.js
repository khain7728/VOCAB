let coursesList = [];

document.addEventListener('DOMContentLoaded', function() {
    loadData();
});

// 1. LOAD DỮ LIỆU
function loadData() {
    const tbody = document.getElementById('course_table_body');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Đang tải dữ liệu...</td></tr>';

    fetch('../../api/admin/course_get_list.php')
        .then(res => {
            if (!res.ok) throw new Error("Lỗi kết nối HTTP: " + res.status);
            return res.json();
        })
        .then(data => {
            if (data.status === 'success') {
                coursesList = data.data;
                renderTable(coursesList);
            } else {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red">${data.message || 'Không có dữ liệu'}</td></tr>`;
            }
        })
        .catch(err => {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red">Lỗi kết nối server! Kiểm tra file course_get_list.php</td></tr>';
        });
}

// 2. RENDER BẢNG
function renderTable(data) {
    const tbody = document.getElementById('course_table_body');
    let html = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Chưa có khóa học nào.</td></tr>';
        return;
    }

    data.forEach((item, index) => {
        // Trạng thái public/private
        const isPrivate = item.status === 'private';
        const statusClass = isPrivate ? 'status-red' : 'status-green';
        const statusText = isPrivate ? 'Đã khóa' : 'Công khai';

        const lockIcon = isPrivate ? 'fa-lock' : 'fa-lock-open';
        const lockTitle = isPrivate ? 'Mở khóa' : 'Khóa lại';

        html += `
            <tr>
                <td style="text-align:center">${index + 1}</td>
                <td>${item.code}</td>
                <td><strong>${item.name}</strong></td>
                <td>${item.author}</td>
                <td><span class="status-pill ${statusClass}">${statusText}</span></td>
                <td class="table-actions" style="text-align:center">
                    <i class="fa-solid fa-pen" title="Sửa" onclick="editCourse(${item.id})"></i>
                    <i class="fa-solid ${lockIcon}" 
                       title="${lockTitle}" 
                       style="cursor: pointer;"
                       onclick="toggleLock(${item.id}, '${item.status}')"></i>
                    <i class="fa-solid fa-trash" title="Xóa" onclick="deleteCourse(${item.id})"></i>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// 3. MODAL (POPUP)
function openModal() {
    document.getElementById('modalTitle').innerText = 'Thêm khóa học mới';
    document.getElementById('courseId').value = '';
    document.getElementById('courseCode').value = '';
    document.getElementById('courseName').value = '';
    document.getElementById('courseModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('courseModal').style.display = 'none';
}

function editCourse(id) {
    const course = coursesList.find(c => c.id == id);
    if (course) {
        document.getElementById('modalTitle').innerText = 'Cập nhật khóa học';
        document.getElementById('courseId').value = course.id;
        document.getElementById('courseCode').value = course.code;
        document.getElementById('courseName').value = course.name;
        document.getElementById('courseModal').style.display = 'flex';
    }
}

window.onclick = function(event) {
    if (event.target == document.getElementById('courseModal')) {
        closeModal();
    }
}

// 4. LƯU (THÊM/SỬA)
function saveCourse() {
    const id = document.getElementById('courseId').value;
    const code = document.getElementById('courseCode').value.trim();
    const name = document.getElementById('courseName').value.trim();

    if (!code || !name) { alert('Vui lòng nhập đủ thông tin!'); return; }

    const apiUrl = id ? '../../api/admin/course_update.php' : '../../api/admin/course_create.php';
    let payload = { code: code, name: name };
    if (id) payload.id = id;

    fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
                closeModal();
                loadData();
            } else {
                alert('Lỗi: ' + data.message);
            }
        })
        .catch(err => {
            console.error(err);
            alert('Lỗi kết nối server!');
        });
}

// 5. XÓA
function deleteCourse(id) {
    if (confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
        fetch('../../api/admin/course_delete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    alert(data.message);
                    loadData();
                } else {
                    alert('Lỗi: ' + data.message);
                }
            })
            .catch(err => console.error(err));
    }
}

// 6. KHÓA/MỞ KHÓA
function toggleLock(id, currentStatus) {
    const action = currentStatus === 'public' ? 'KHÓA' : 'MỞ KHÓA';
    if (confirm(`Bạn có muốn ${action} khóa học này không?`)) {
        fetch('../../api/admin/course_update_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, status: currentStatus })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    alert(data.message);
                    loadData();
                } else {
                    alert('Lỗi: ' + data.message);
                }
            })
            .catch(err => {
                console.error(err);
                alert('Lỗi kết nối server!');
            });
    }
}

// 7. TÌM KIẾM
function searchTable() {
    const val = document.getElementById('searchBox').value.toLowerCase();
    const filtered = coursesList.filter(c =>
        c.name.toLowerCase().includes(val) ||
        c.code.toLowerCase().includes(val)
    );
    renderTable(filtered);
}