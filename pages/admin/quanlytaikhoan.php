<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quản lý tài khoản</title>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="../../assets/css/defaut/menu_admin.css">
    <link rel="stylesheet" href="../../assets/css/defaut/header_admin.css">
    <link rel="stylesheet" href="../../assets/css/admin/admin_global.css">
    <link rel="stylesheet" href="../../assets/css/admin/quanlytaikhoan.css"> 
    </head>
<body>

    <div id="menu_admin">
        <?php include '../../includes/menu_admin.php'; ?>
    </div>

    <div class="main-wrapper">
        
        <?php include '../../includes/header_admin.php'; ?>

        <div id="content">
            <div class="page-header">
                <h1 class="page-title">Quản lý tài khoản</h1>
                </div>

            <div class="search-bar">
                <i class="fa-solid fa-search"></i>
                <input type="text" id="searchBox" onkeyup="searchTable()" placeholder="Tìm theo tên hoặc email...">
            </div>

            <div class="admin-table-container">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 50px; text-align: center;">STT</th>
                            <th>Họ và tên</th>
                            <th>Email</th>
                            <th>Ngày tham gia</th>
                            <th>Trạng thái</th>
                            <th style="text-align: center;">Hành động</th>
                        </tr>
                    </thead>
                    <tbody id="user_table_body">
                        </tbody>
                </table>
            </div>
        </div>
    </div>

    <script src="../../assets/js/admin/layout_admin.js"></script>
    <script src="../../assets/js/admin/quanlytaikhoan.js"></script>

</body>
</html>