// JavaScript cho trang đăng ký
(function() {
    'use strict';

    // Đợi DOM load xong
    document.addEventListener('DOMContentLoaded', function() {
        
        // Lấy các elements
        const registerButton = document.querySelector('.login-button');
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const termsCheckbox = document.getElementById('terms-checkbox');

        // Xử lý click vào "Điều khoản dịch vụ"
        const termsLinks = document.querySelectorAll('.terms a');
        termsLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const linkText = this.textContent;
                
                if (linkText.includes('Điều khoản')) {
                    showTermsModal();
                } else if (linkText.includes('Chính sách')) {
                    showPrivacyModal();
                }
            });
        });

        // Xử lý đăng ký
        if (registerButton) {
            registerButton.addEventListener('click', function(e) {
                e.preventDefault();

                // Lấy giá trị từ input
                const name = nameInput ? nameInput.value.trim() : '';
                const email = emailInput ? emailInput.value.trim() : '';
                const password = passwordInput ? passwordInput.value : '';
                const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
                const termsAccepted = termsCheckbox ? termsCheckbox.checked : false;

                // Validate
                if (!name) {
                    alert('Vui lòng nhập tên đầy đủ!');
                    nameInput.focus();
                    return;
                }

                if (name.length < 2) {
                    alert('Tên phải có ít nhất 2 ký tự!');
                    nameInput.focus();
                    return;
                }

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

                if (!confirmPassword) {
                    alert('Vui lòng xác nhận mật khẩu!');
                    confirmPasswordInput.focus();
                    return;
                }

                if (password !== confirmPassword) {
                    alert('Mật khẩu xác nhận không khớp!');
                    confirmPasswordInput.focus();
                    return;
                }

                if (!termsAccepted) {
                    alert('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật!');
                    return;
                }

                // Nếu validate thành công
                alert(`Đăng ký thành công!\n\nTên: ${name}\nEmail: ${email}\n\nChào mừng bạn đến với VOCAB!`);
                
                // TODO: Gửi request đến server để tạo tài khoản
                // setTimeout(() => {
                //     window.location.href = 'dangnhap.html';
                // }, 1000);
            });
        }

        // Cho phép nhấn Enter để chuyển field
        if (nameInput) {
            nameInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    emailInput.focus();
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

        if (passwordInput) {
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    confirmPasswordInput.focus();
                }
            });
        }

        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    registerButton.click();
                }
            });
        }
    });

    // Hàm validate email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Hiển thị modal Điều khoản dịch vụ
    function showTermsModal() {
        alert('ĐIỀU KHOẢN DỊCH VỤ\n\n' +
              '1. Chấp nhận điều khoản\n' +
              'Bằng việc sử dụng dịch vụ VOCAB, bạn đồng ý với các điều khoản này.\n\n' +
              '2. Tài khoản người dùng\n' +
              'Bạn chịu trách nhiệm bảo mật thông tin tài khoản của mình.\n\n' +
              '3. Sử dụng dịch vụ\n' +
              'Bạn cam kết sử dụng dịch vụ đúng mục đích học tập.\n\n' +
              '4. Quyền sở hữu trí tuệ\n' +
              'Mọi nội dung trên VOCAB đều thuộc quyền sở hữu của chúng tôi.\n\n' +
              'Trang chi tiết đang được phát triển.');
    }

    // Hiển thị modal Chính sách bảo mật
    function showPrivacyModal() {
        alert('CHÍNH SÁCH BẢO MẬT\n\n' +
              '1. Thu thập thông tin\n' +
              'Chúng tôi thu thập email, tên và thông tin học tập của bạn.\n\n' +
              '2. Sử dụng thông tin\n' +
              'Thông tin được sử dụng để cải thiện trải nghiệm học tập.\n\n' +
              '3. Bảo mật dữ liệu\n' +
              'Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn.\n\n' +
              '4. Chia sẻ thông tin\n' +
              'Chúng tôi không chia sẻ thông tin của bạn với bên thứ ba.\n\n' +
              '5. Quyền của người dùng\n' +
              'Bạn có quyền yêu cầu xóa hoặc chỉnh sửa thông tin cá nhân.\n\n' +
              'Trang chi tiết đang được phát triển.');
    }

})();
