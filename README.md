## 📁 Cấu trúc thư mục chi tiết

```
VOCAB/
│
├── 📂 admin/                    # Trang quản trị (Admin Panel)
│   └── admin_Dashboard.html    # Dashboard cho admin quản lý hệ thống
│
├── 📂 api/                      # API Endpoints (trả về JSON)
│   └── get-users.php            # API lấy danh sách users
│                                # Dùng cho AJAX calls từ frontend
│
├── 📂 assets/                   # Tài nguyên tĩnh (Static Assets)
│   ├── 📂 css/                  # Stylesheet files
│   │   └── style.css            # CSS chính của website
│   ├── 📂 fonts/                # Font chữ tùy chỉnh
│   ├── 📂 images/               # Hình ảnh trang trí, icons, logo
│   └── 📂 js/                   # JavaScript files
│       └── main.js              # JavaScript chính
│
├── 📂 auth/                     # Xác thực & Quản lý tài khoản
│   ├── forgot-password.php      # Form quên mật khẩu
│   ├── login.php                # Form đăng nhập
│   ├── logout.php               # Xử lý đăng xuất
│   ├── register.php             # Form đăng ký tài khoản mới
│   └── reset-password.php       # Form đặt lại mật khẩu
│
├── 📂 config/                   # Cấu hình hệ thống (⭐ QUAN TRỌNG)
│   ├── config.php               # Cấu hình chung (session, timezone, paths)
│   ├── constants.php            # Các hằng số (roles, status, levels)
│   └── database.php             # Kết nối database (MySQLi & PDO)
│
├── 📂 database/                 # Database Scripts (Tham khảo)
│   └── database.sql             # Cấu trúc database mẫu (đã tạo sẵn trên XAMPP)
│
├── 📂 includes/                 # File dùng chung (Common Files)
│   ├── footer.php               # Footer HTML chung
│   ├── functions.php            # ⭐ Các hàm PHP tiện ích
│   ├── header.php               # Header HTML chung
│   ├── navbar.php               # Navigation bar
│   └── upload-functions.php     # Xử lý upload file, hình ảnh
│
├── 📂 logs/                     # System Logs (tự động tạo)
│   └── error_YYYY-MM-DD.log     # Log lỗi theo ngày
│
├── 📂 process/                  # Backend Processing Scripts
│   ├── login-process.php        # Xử lý logic đăng nhập
│   ├── logout-process.php       # Xử lý logic đăng xuất
│   └── register-process.php     # Xử lý logic đăng ký
│
├── 📂 public/                   # Public accessible files
│   └── index.php                # Public landing page
│
├── 📂 uploads/                  # File Upload Directory (⚠️ Cần quyền ghi)
│   ├── 📂 documents/            # Tài liệu đã upload
│   └── 📂 temp/                 # File tạm thời
│
├── 📂 user/                     # Trang người dùng (User Panel)
│   └── user_Dashboard.html      # Dashboard cho user thường
│
├── 📄 index.php                 # ⭐ Trang chủ chính của website
└── 📄 README.md                 # ⭐ File này - Tài liệu hướng dẫn
```

### 📌 Giải thích chi tiết từng folder:

#### 1. **config/** - Trái tim của hệ thống
- `database.php`: Kết nối MySQL bằng MySQLi và PDO (sử dụng database `english_learning`)
- `config.php`: Khởi động session, include các file cần thiết, set timezone
- `constants.php`: Định nghĩa các hằng số: ROLE_ADMIN, ROLE_USER, STATUS_ACTIVE, v.v.

#### 2. **database/** - Scripts tham khảo
- `database.sql`: File SQL cấu trúc database (CHỈ THAM KHẢO - database đã tạo sẵn trên XAMPP)
- Lưu ý: Database `english_learning` đã được tạo và cấu hình sẵn trên XAMPP

#### 3. **includes/** - Thư viện hàm dùng chung
- `functions.php`: Chứa 20+ hàm tiện ích:
  - `is_logged_in()` - Kiểm tra đăng nhập
  - `is_admin()` - Kiểm tra quyền admin
  - `clean_input()` - Làm sạch dữ liệu
  - `hash_password()` - Mã hóa password
  - `redirect()` - Chuyển trang
  - `set_message()` - Tạo thông báo
  - v.v.

#### 4. **auth/** - Hệ thống xác thực
- Flow đăng nhập: `login.php` → `process/login-process.php` → Dashboard
- Flow đăng ký: `register.php` → `process/register-process.php` → Login
- Quên mật khẩu: `forgot-password.php` → gửi email → `reset-password.php`

#### 5. **process/** - Logic xử lý backend
- Nhận dữ liệu từ form (POST)
- Validate dữ liệu
- Xử lý database
- Trả về kết quả hoặc redirect

#### 6. **api/** - RESTful API Endpoints
- Trả về dữ liệu dạng JSON
- Dùng cho AJAX calls
- Ví dụ: `get-users.php` → `{"status":"success","data":[...]}`

#### 7. **uploads/** - Lưu trữ file
- ⚠️ **QUAN TRỌNG**: Folder này cần có quyền ghi (chmod 777)
- Không commit file upload lên Git (đã có trong `.gitignore`)

#### 8. **logs/** - Ghi log lỗi
- Tự động tạo file log theo ngày
- Giúp debug và theo dõi lỗi
- Ví dụ: `error_2025-11-08.log`

---



## 💻 Hướng dẫn Development

### 1. Quy trình làm việc cơ bản

```
1. Khởi động XAMPP (Apache + MySQL)
2. Mở project trong code editor (VS Code, PHPStorm...)
3. Truy cập http://localhost/VOCAB
4. Code và test
5. Commit code lên Git
```


