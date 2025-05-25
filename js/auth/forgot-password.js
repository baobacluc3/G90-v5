// Tải modal HTML
fetch('../../components/modal.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('modalContainer').innerHTML = data;
    });

function openModal(title, content, onConfirm = null) {
    const modal = new bootstrap.Modal(document.getElementById('commonModal'));
    document.getElementById('commonModalLabel').innerText = title;
    document.querySelector('#commonModal .modal-body').innerText = content;

    const confirmBtn = document.getElementById('modalConfirmBtn');
    if (onConfirm) {
        confirmBtn.style.display = 'inline-block';
        confirmBtn.onclick = function () {
            onConfirm();
            modal.hide();
        };
    } else {
        confirmBtn.style.display = 'none';
    }

    modal.show();
}

document.addEventListener('DOMContentLoaded', function () {
    // Xử lý form quên mật khẩu
    document.getElementById('forgotPasswordForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        if (!email) {
            openModal('Lỗi', 'Vui lòng nhập email');
            return;
        }

        openModal('Xác Nhận Gửi Liên Kết', `Liên kết đặt lại mật khẩu sẽ được gửi đến ${email}. Bạn có muốn tiếp tục không?`, async function () {
            try {
                const res = await fetch('/api/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await res.json();
                if (data.success) {
                    openModal('Thành công', data.message, () => {
                        window.location.href = `reset-password.html?email=${encodeURIComponent(email)}`;
                    });
                } else {
                    openModal('Lỗi', data.message || 'Không thể gửi email');
                }
            } catch (err) {
                console.error(err);
                openModal('Lỗi', 'Không thể kết nối máy chủ.');
            }
        });
    });
});
