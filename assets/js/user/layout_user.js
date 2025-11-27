/**
 * layout_user.js
 * - Tải menu_user.html và header_user.html vào trang template.html
 * - Layout: menu dọc bên trái (fixed), header ngang phía trên bên phải, content bên dưới header
 * - Ghi chú bằng tiếng Việt
 */

(function () {
  'use strict';

  // Đường dẫn tương đối từ pages/user/ đến includes/
  const MENU_PATH = '../../includes/menu_user.html';
  const HEADER_PATH = '../../includes/header_user.html';

  /**
   * Hàm fetch và inject nội dung HTML include vào một container
   * @param {string} url - đường dẫn đến file HTML
   * @param {string} containerId - ID của div chứa nội dung
   */
  async function loadInclude(url, containerId) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Không tải được ${url}: ${response.status}`);

      const html = await response.text();
      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`Không tìm thấy container #${containerId}`);
        return;
      }

      // Parse HTML để tách <link> tags và nội dung
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Lấy tất cả <link> tags và thêm vào <head>
      const links = doc.querySelectorAll('link[rel="stylesheet"]');
      links.forEach(link => {
        let href = link.getAttribute('href');

        // Chuyển đổi đường dẫn tương đối từ includes/ sang pages/user/
        // Ví dụ: ../assets/css/... (từ includes/) -> ../../assets/css/... (từ pages/user/)
        if (href && href.startsWith('../')) {
          href = '../' + href; // thêm một cấp ../ nữa
        }

        // Kiểm tra xem link đã tồn tại chưa (dùng href đã chuyển đổi)
        if (href && !document.querySelector(`link[href="${href}"]`)) {
          const newLink = document.createElement('link');
          newLink.rel = 'stylesheet';
          newLink.href = href;
          document.head.appendChild(newLink);
          console.log(`  → Đã thêm CSS: ${href}`);
        }
      });

      // Lấy phần tử có id trùng với containerId từ body của doc
      // Ví dụ: nếu containerId là 'menu_user', tìm <div id="menu_user"> trong parsed HTML
      const targetElement = doc.body.querySelector(`#${containerId}`);

      if (targetElement) {
        // Inject nội dung BÊN TRONG element đó (không bao gồm wrapper div)
        container.innerHTML = targetElement.innerHTML;
      } else {
        // Fallback: inject toàn bộ body content
        container.innerHTML = doc.body.innerHTML;
      }
      console.log(`✓ Đã tải ${url} vào #${containerId}`);

    } catch (error) {
      console.error(`Lỗi khi tải ${url}:`, error);
    }
  }

  /**
   * Thiết lập layout: menu bên trái, header + content bên phải
   */
  function setupLayout() {
    // Thêm class wrapper để body sử dụng flexbox layout
    document.body.classList.add('layout-user');

    // Tạo container chính bên phải cho header và content
    const mainContainer = document.createElement('div');
    mainContainer.id = 'main_container';

    // Di chuyển header và content vào main_container
    const headerDiv = document.getElementById('header_user');
    const contentDiv = document.getElementById('content');

    if (headerDiv) mainContainer.appendChild(headerDiv);
    if (contentDiv) mainContainer.appendChild(contentDiv);

    // Thêm main_container vào body (sau menu)
    document.body.appendChild(mainContainer);

    console.log('✓ Đã thiết lập layout user (menu trái, header + content phải)');
  }

  /**
   * Thêm CSS inline cho layout (nếu chưa có file CSS riêng)
   */
  function injectLayoutStyles() {
    const styleId = 'layout-user-styles';
    if (document.getElementById(styleId)) return; // đã tồn tại

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Layout user: menu bên trái fixed, phần còn lại bên phải */
      body.layout-user{
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: row;
        min-height: 100vh;
        font-family: 'Roboto', sans-serif;
      }
      
      /* Menu user: fixed bên trái */
      body.layout-user > #menu_user{
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        z-index: 100;
      }
      
      /* Main container: chứa header + content, chiếm phần còn lại bên phải menu */
      body.layout-user #main_container{
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-left: 4.5rem; /* chiều rộng menu khi collapsed */
        min-height: 100vh;
        transition: margin-left 220ms ease;
      }
      
      /* Header user: nằm ngang phía trên */
      body.layout-user #main_container > #header_user{
        position: sticky;
        top: 0;
        z-index: 50;
        width: 100%;
      }
      
      /* Content: chiếm phần còn lại */
      body.layout-user #main_container > #content{
        flex: 1;
        padding: 1.5rem;
        box-sizing: border-box;
      }
      
      /* Khi menu được mở bằng click (class menu-open), giữ menu ở trạng thái expanded */
      body.layout-user.menu-open > #menu_user{
        width: 15rem !important; /* force expanded width */
        font-size: 1rem !important;
        align-items: stretch !important;
      }
      
      body.layout-user.menu-open #main_container{
        margin-left: 15rem !important; /* dịch content sang phải */
      }
      
      /* Apply các style của hover state cho menu khi menu-open */
      body.layout-user.menu-open #menu_user #logo{
        justify-content: flex-start !important;
        padding-left: 1rem !important;
      }
      
      body.layout-user.menu-open #menu_user #logo p{
        display: block !important;
      }
      
      body.layout-user.menu-open #frame_menu > #main_menu a{
        justify-content: flex-start !important;
        padding-left: 1rem !important;
      }
      
      body.layout-user.menu-open #logout a{
        justify-content: flex-start !important;
        padding-left: 1rem !important;
      }
      
      body.layout-user.menu-open #frame_menu > #main_menu a i{
        margin-left: 0 !important;
      }
      
      /* Responsive: màn hình nhỏ */
      @media (max-width: 768px){
        body.layout-user #main_container{
          margin-left: 0; /* menu sẽ overlay trên mobile */
        }
        body.layout-user > #menu_user{
          transform: translateX(-100%); /* ẩn menu mặc định */
          transition: transform 220ms ease;
        }
        body.layout-user.menu-open > #menu_user{
          transform: translateX(0); /* hiện menu khi click icon */
        }
      }
    `;
    document.head.appendChild(style);
    console.log('✓ Đã inject CSS layout user');
  }

  /**
   * Thiết lập chức năng toggle menu khi click vào icon menu trong header
   */
  function setupMenuToggle() {
    const menuIcon = document.querySelector('#header_user #menu');
    const menuSidebar = document.getElementById('menu_user');

    if (!menuIcon || !menuSidebar) {
      console.warn('Không tìm thấy icon menu hoặc sidebar menu');
      return;
    }

    // Toggle class 'menu-open' khi click vào icon menu
    menuIcon.addEventListener('click', function (e) {
      e.stopPropagation(); // ngăn event bubble lên document
      document.body.classList.toggle('menu-open');
      console.log('Toggle menu:', document.body.classList.contains('menu-open') ? 'MỞ' : 'ĐÓNG');
    });

    // Đóng menu khi click bên ngoài menu
    document.addEventListener('click', function (e) {
      // Kiểm tra xem click có nằm trong menu không
      if (!menuSidebar.contains(e.target) && !menuIcon.contains(e.target)) {
        if (document.body.classList.contains('menu-open')) {
          document.body.classList.remove('menu-open');
          console.log('Đóng menu (click bên ngoài)');
        }
      }
    });

    // Ngăn click trong menu làm đóng menu
    menuSidebar.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    console.log('✓ Đã thiết lập menu toggle');
  }

  /**
   * Thiết lập logout button
   */
  function setupLogout() {
    // Tìm link logout trong menu
    const logoutLink = document.querySelector('#logout a');

    if (!logoutLink) {
      console.warn('Không tìm thấy link logout');
      return;
    }

    // Xử lý click logout
    logoutLink.addEventListener('click', function (e) {
      if (!confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        e.preventDefault();
      }
    });

    console.log('✓ Đã thiết lập logout button');
  }

  /**
   * Thiết lập notification toggle
   */
  function setupNotifications() {
    const notifContainer = document.getElementById('notifications');
    const notifTrigger = document.getElementById('notif-trigger');
    const notifPanel = document.getElementById('notif-panel');

    if (!notifContainer || !notifTrigger || !notifPanel) {
      console.warn('Không tìm thấy elements notification');
      return;
    }

    // Toggle panel on click
    notifTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      notifContainer.classList.toggle('open');
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!notifContainer.contains(e.target)) {
        notifContainer.classList.remove('open');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && notifContainer.classList.contains('open')) {
        notifContainer.classList.remove('open');
        notifTrigger.focus();
      }
    });

    console.log('✓ Đã thiết lập notification toggle');
  }

  /**
   * Khởi tạo khi DOM sẵn sàng
   */
  function init() {
    console.log('Đang khởi tạo layout user...');

    // Inject CSS layout trước
    injectLayoutStyles();

    // Load menu và header song song
    Promise.all([
      loadInclude(MENU_PATH, 'menu_user'),
      loadInclude(HEADER_PATH, 'header_user')
    ]).then(() => {
      // Sau khi load xong, thiết lập layout
      setupLayout();
      // Thiết lập menu toggle
      setupMenuToggle();
      // Thiết lập notifications
      setupNotifications();
      // Thiết lập logout
      setupLogout();
      // thiết lập thông báo
      loadNotificationModule();
      console.log('✓ Layout user đã sẵn sàng!');
    });
  }
  function loadNotificationModule() {
    const script = document.createElement('script');
    script.src = '../../assets/js/user/notifications.js';
    script.defer = true;
    document.head.appendChild(script);
    console.log('✓ Đã load Notification Module');
  }
  // Chạy khi DOM đã load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
