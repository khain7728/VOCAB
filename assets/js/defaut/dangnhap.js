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
                showInfo('Đăng nhập với Facebook\n\nTính năng này đang được phát triển.');
            });
        }

        // Xử lý đăng nhập bằng Google
        // if (googleButton) {
        //     googleButton.addEventListener('click', function(e) {
        //         e.preventDefault();
        //         alert('Đăng nhập với Google\n\nTính năng này đang được phát triển.');
        //     });
        // }

        // Xử lý đăng nhập thường
        if (loginButton) {
            loginButton.addEventListener('click', function(e) {
                e.preventDefault();

                // Ngăn không cho submit nhiều lần
                if (loginButton.disabled) {
                    console.log('Login button đã disabled, bỏ qua click');
                    return;
                }

                // Lấy giá trị từ input
                const email = emailInput ? emailInput.value.trim() : '';
                const password = passwordInput ? passwordInput.value : '';

                // Validate
                if (!email) {
                    showError('Vui lòng nhập email!');
                    emailInput.focus();
                    return;
                }

                if (!validateEmail(email)) {
                    showError('Email không hợp lệ!');
                    emailInput.focus();
                    return;
                }

                if (!password) {
                    showError('Vui lòng nhập mật khẩu!');
                    passwordInput.focus();
                    return;
                }

                if (password.length < 6) {
                    showError('Mật khẩu phải có ít nhất 6 ký tự!');
                    passwordInput.focus();
                    return;
                }

                // Nếu validate thành công, gửi request đến backend
                const formData = new FormData();
                formData.append('email', email);
                formData.append('password', password);

                // Vô hiệu hóa nút đăng nhập ngay lập tức
                console.log('Disabling login button...');
                loginButton.disabled = true;
                loginButton.textContent = 'Đang xử lý...';

                // Gửi request
                fetch('../process/login-process.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    // Kiểm tra xem có redirect không
                    if (response.redirected) {
                        window.location.href = response.url;
                        return;
                    }
                    
                    // Kiểm tra content-type
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        return response.json();
                    }
                    return response.text();
                })
                .then(data => {
                    // Xử lý response JSON
                    if (data && typeof data === 'object') {
                        if (data.error_type === 'email_not_found') {
                            // Hiển thị confirm dialog
                            const userConfirm = confirm(
                                data.message + '\n\n' +
                                'Bạn có muốn đăng ký tài khoản với email này không?'
                            );
                            
                            if (userConfirm) {
                                // Chuyển sang trang đăng ký
                                window.location.href = 'dangki.html';
                            } else {
                                // Người dùng không muốn đăng ký, giữ nguyên
                                loginButton.disabled = false;
                                loginButton.textContent = 'Đăng nhập';
                            }
                        } else {
                            // Lỗi khác
                            showError(data.message || 'Có lỗi xảy ra!');
                            loginButton.disabled = false;
                            loginButton.textContent = 'Đăng nhập';
                        }
                    } else if (data) {
                        console.log(data);
                    }
                })
                .catch(error => {
                    console.error('Lỗi:', error);
                    showError('Có lỗi xảy ra. Vui lòng thử lại!');
                    loginButton.disabled = false;
                    loginButton.textContent = 'Đăng nhập';
                });
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
