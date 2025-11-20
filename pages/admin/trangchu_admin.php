<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trang chủ Admin</title>
    
    <link rel="stylesheet" href="../../assets/css/defaut/menu_admin.css">
    <link rel="stylesheet" href="../../assets/css/defaut/header_admin.css">
    <link rel="stylesheet" href="../../assets/css/admin/admin_global.css">
    <link rel="stylesheet" href="../../assets/css/admin/trangchu_admin.css">
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>

<body>
    <?php include '../../includes/menu_admin.php'; ?>
    
    <div class="main-wrapper">
        <?php include '../../includes/header_admin.php'; ?>

        <div id="content">
            <main class="page-content trangchu-page">
                <div class="welcome-header">
                    <h1 class="page-title">Trang chủ</h1>
                    <p>Tổng quan hoạt động hệ thống</p>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="card-icon icon-users"><i class="fa-solid fa-users"></i></div>
                        <div class="card-content">
                            <span class="card-title">Tổng người dùng</span>
                            <span class="card-value" id="total-users">0</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="card-icon icon-courses"><i class="fa-solid fa-book"></i></div>
                        <div class="card-content">
                            <span class="card-title">Khóa học</span>
                            <span class="card-value" id="total-courses">0</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="card-icon icon-activity"><i class="fa-solid fa-chart-line"></i></div>
                        <div class="card-content">
                            <span class="card-title">Hoạt động hôm nay</span>
                            <span class="card-value" id="today-activity">0</span>
                        </div>
                    </div>
                </div>

                <div class="dashboard-main-grid">
                    <div class="widget">
                        <h3 class="widget-title">Hoạt động gần đây</h3>
                        <ul class="activity-list" id="recent-activity-list">
                            <p style="color:#999">Đang tải...</p>
                        </ul>
                    </div>

                    <div class="widget">
                        <h3 class="widget-title">Khóa học phổ biến</h3>
                        <p class="widget-subtitle">Theo số lượng học viên đăng ký</p>
                        <div class="chart-container" style="height: 250px;">
                            <canvas id="courseChart"></canvas>
                        </div>
                    </div>

                    <div class="widget widget-full-width">
                        <h3 class="widget-title">Người dùng mới theo tháng</h3>
                        <div class="chart-container" style="height: 300px;">
                            <canvas id="userChart"></canvas>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    </div>

    <script src="../../assets/js/admin/layout_admin.js"></script>
    <script src="../../assets/js/admin/trangchu_admin.js"></script>
</body>
</html>