// JavaScript cho trang đăng nhập
(function() {
    'use strict';

    // Đợi DOM load xong
    document.addEventListener('DOMContentLoaded', function() {
        
        // Lấy các elements
        const loginButton = document.querySelector('.login-button');
        const facebookButton = document.querySelector('.facebook-login-button');
        const googleButton = document.querySelector('.google-login-button');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        // Xử lý đăng nhập bằng Facebook
        if (facebookButton) {
            facebookButton.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Đăng nhập với Facebook\n\nTính năng này đang được phát triển.');
            });
        }

        // Xử lý đăng nhập bằng Google
        if (googleButton) {
            googleButton.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Đăng nhập với Google\n\nTính năng này đang được phát triển.');
            });
        }

        // Xử lý đăng nhập thường
        if (loginButton) {
            loginButton.addEventListener('click', function(e) {
                e.preventDefault();

                // Lấy giá trị từ input
                const email = emailInput ? emailInput.value.trim() : '';
                const password = passwordInput ? passwordInput.value : '';

                // Validate
                if (!email) {
                    alert('Vui lòng nhập email!');
                    emailInput.focus();
                    return;
                }

                if (!validateEmail(email)) {
                    alert('Email không hợp lệ!');
                    emailInput.focus();
                    return;
                }

                if (!password) {
                    alert('Vui lòng nhập mật khẩu!');
                    passwordInput.focus();
                    return;
                }

                if (password.length < 6) {
                    alert('Mật khẩu phải có ít nhất 6 ký tự!');
                    passwordInput.focus();
                    return;
                }

                // Nếu validate thành công
                alert(`Đăng nhập thành công!\n\nEmail: ${email}\n\nChức năng đăng nhập đầy đủ đang được phát triển.`);
                // Ở đây bạn có thể thêm mã để gửi dữ liệu đăng nhập lên server
            });
        }

        // Cho phép nhấn Enter để đăng nhập
        if (passwordInput) {
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    loginButton.click();
                }
            });
        }

        if (emailInput) {
            emailInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    passwordInput.focus();
                }
            });
        }
    });

    // Hàm validate email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

})();
