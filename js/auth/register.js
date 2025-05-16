
fetch('../../components/modal.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('modalContainer').innerHTML = data;
    });

function openModal(title, content, onConfirm) {
    const modal = new bootstrap.Modal(document.getElementById('commonModal'));
    document.getElementById('commonModalLabel').innerText = title;
    document.querySelector('.modal-body').innerText = content;

    const confirmBtn = document.getElementById('modalConfirmBtn');
    confirmBtn.onclick = function () {
        onConfirm();
        modal.hide();
    };

    modal.show();
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function () {
            const passwordInput = this.previousElementSibling;
            const icon = this.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    document.getElementById('registerForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!fullName || !email || !password || !confirmPassword) {
            openModal('Lỗi', 'Vui lòng nhập đầy đủ thông tin!', function () {});
            return;
        }

        if (password !== confirmPassword) {
            openModal('Lỗi', 'Mật khẩu xác nhận không khớp!', function () {});
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    hoTen: fullName,
                    gmail: email,
                    matKhau: password,
                    chucVu: 3 
                })
            });

            const result = await response.json();

            if (result.success) {
                openModal('Thành Công', 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.', function () {
                    window.location.href = 'login.html';
                });
            } else {
                openModal('Lỗi', result.message || 'Đăng ký thất bại. Vui lòng thử lại.', function () {});
            }
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            openModal('Lỗi', 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.', function () {});
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
});