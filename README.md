## 📁 Cấu trúc thư mục chi tiết

```
VOCAB/
│
├── 📂 api/                      # API Endpoints (trả về JSON)
│   └── get-users.php            # API lấy danh sách users
│                                # Dùng cho AJAX calls từ frontend
│
├── 📂 assets/                   # Tài nguyên tĩnh (Static Assets)
│   ├── 📂 css/                  # Stylesheet files
│   │   └── style.css            # CSS chính của website
│   ├── 📂 fonts/                # Font chữ tùy chỉnh
│   │   └── all.min.css          # Font Awesome icons
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
├── 📂 pages/                    # Trang giao diện người dùng
│   ├── 📂 admin/                # Trang quản trị (Admin Panel)
│   │   └── admin_Dashboard.html # Dashboard cho admin quản lý hệ thống
│   └── 📂 user/                 # Trang người dùng (User Panel)
│       └── user_Dashboard.html  # Dashboard cho user thường
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
├── � .env                      # ⚠️ Biến môi trường (KHÔNG commit lên Git)
├── 📄 .gitignore                # Danh sách file/folder bỏ qua khi commit
├── 📄 .htaccess                 # Cấu hình Apache (URL rewrite, bảo mật)
├── 📄 index.php                 # ⭐ Trang chủ chính của website
└── 📄 README.md                 # ⭐ File này - Tài liệu hướng dẫn
```

### 📌 Giải thích chi tiết từng folder:

#### 1. **config/** - Trái tim của hệ thống
- `database.php`: Kết nối MySQL bằng MySQLi và PDO (sử dụng database `english_learning`)
- `config.php`: Khởi động session, include các file cần thiết, set timezone
- `constants.php`: Định nghĩa các hằng số: ROLE_ADMIN, ROLE_USER, STATUS_ACTIVE, v.v.

#### 2. **includes/** - Thư viện hàm dùng chung
- `functions.php`: Chứa 20+ hàm tiện ích:
  - `is_logged_in()` - Kiểm tra đăng nhập
  - `is_admin()` - Kiểm tra quyền admin
  - `clean_input()` - Làm sạch dữ liệu
  - `hash_password()` - Mã hóa password
  - `redirect()` - Chuyển trang
  - `set_message()` - Tạo thông báo
  - v.v.
- `header.php`, `footer.php`, `navbar.php`: Components HTML dùng chung
- `upload-functions.php`: Xử lý upload file an toàn

#### 3. **auth/** - Hệ thống xác thực
- Flow đăng nhập: `login.php` → `process/login-process.php` → Dashboard
- Flow đăng ký: `register.php` → `process/register-process.php` → Login
- Quên mật khẩu: `forgot-password.php` → gửi email → `reset-password.php`

#### 4. **process/** - Logic xử lý backend
- Nhận dữ liệu từ form (POST)
- Validate dữ liệu
- Xử lý database
- Trả về kết quả hoặc redirect

#### 5. **pages/** - Giao diện người dùng
- `pages/admin/`: Dashboard và các trang quản trị cho Admin
- `pages/user/`: Dashboard và các trang học tập cho User
- Phân quyền: redirect nếu user không có quyền truy cập

#### 6. **api/** - RESTful API Endpoints
- Trả về dữ liệu dạng JSON
- Dùng cho AJAX calls
- Ví dụ: `get-users.php` → `{"status":"success","data":[...]}`

#### 7. **uploads/** - Lưu trữ file
- ⚠️ **QUAN TRỌNG**: Folder này cần có quyền ghi (chmod 777 trên Linux/Mac)
- Không commit file upload lên Git (đã có trong `.gitignore`)
- Có `.htaccess` ngăn chặn thực thi file PHP trong thư mục này

#### 8. **logs/** - Ghi log lỗi
- Tự động tạo file log theo ngày
- Giúp debug và theo dõi lỗi
- Ví dụ: `error_2025-11-09.log`
- Có `.htaccess` ngăn chặn truy cập web

#### 9. **Root files** - File cấu hình gốc
- `.env`: Biến môi trường (database credentials, API keys) - ⚠️ KHÔNG commit
- `.gitignore`: Loại trừ file nhạy cảm khỏi Git (logs/, uploads/, .env)
- `.htaccess`: Cấu hình Apache (URL rewriting, security headers)
- `index.php`: Landing page / trang chủ chính

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


