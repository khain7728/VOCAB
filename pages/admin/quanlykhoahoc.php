<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quản lý khóa học</title>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="../../assets/css/defaut/menu_admin.css">
    <link rel="stylesheet" href="../../assets/css/defaut/header_admin.css">
    <link rel="stylesheet" href="../../assets/css/admin/admin_global.css">
    <link rel="stylesheet" href="../../assets/css/admin/quanlykhoahoc.css">
</head>
<body>

    <div id="menu_admin">
        <?php include '../../includes/menu_admin.php'; ?>
    </div>

    <div class="main-wrapper">
        
        <?php include '../../includes/header_admin.php'; ?>

        <div id="content">
            <div class="page-header">
                <h1 class="page-title">Quản lý khóa học</h1>
                <button class="btn btn-primary" onclick="openModal()">
                    <i class="fa-solid fa-plus"></i> Thêm khóa học
                </button>
            </div>

            <div class="search-bar">
                <i class="fa-solid fa-search"></i>
                <input type="text" id="searchBox" onkeyup="searchTable()" placeholder="Tìm kiếm khóa học...">
            </div>

            <div class="admin-table-container">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 50px; text-align: center;">STT</th>
                            <th>Mã KH</th>
                            <th>Tên khóa học</th>
                            <th>Người tạo</th>
                            <th>Trạng thái</th>
                            <th style="text-align: center;">Hành động</th>
                        </tr>
                    </thead>
                    <tbody id="course_table_body">
                        </tbody>
                </table>
            </div>
        </div>
    </div>

    <div id="courseModal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modalTitle">Thêm khóa học mới</h3>
                <span class="close-btn" onclick="closeModal()">&times;</span>
            </div>
            
            <div class="modal-body">
                <input type="hidden" id="courseId">
                <div class="form-group">
                    <label>Mã khóa học <span style="color:red">*</span></label>
                    <input type="text" id="courseCode" placeholder="VD: IT01">
                </div>
                <div class="form-group">
                    <label>Tên khóa học <span style="color:red">*</span></label>
                    <input type="text" id="courseName" placeholder="Nhập tên khóa học...">
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeModal()">Hủy bỏ</button>
                <button class="btn-save" onclick="saveCourse()">Lưu lại</button>
            </div>
        </div>
    </div>

    <script src="../../assets/js/admin/layout_admin.js"></script>
    <script src="../../assets/js/admin/quanlykhoahoc.js"></script>

</body>
</html>