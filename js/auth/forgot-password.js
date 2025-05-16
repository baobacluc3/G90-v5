// Tải modal HTML
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
    // Xử lý form quên mật khẩu
    document.getElementById('forgotPasswordForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        openModal('Xác Nhận Gửi Liên Kết', `Liên kết đặt lại mật khẩu sẽ được gửi đến ${email}. Bạn có muốn tiếp tục không?`, function () {
            alert('Liên kết đã được gửi! Vui lòng kiểm tra email.');
            document.getElementById('forgotPasswordForm').reset();
        });
    });
});
