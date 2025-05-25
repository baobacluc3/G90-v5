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
    confirmBtn.onclick = () => {
      onConfirm();
      modal.hide();
    };
  } else {
    confirmBtn.style.display = 'none';
  }

  modal.show();
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email') || '';
  document.getElementById('email').value = email;

  document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('code').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (!code || !newPassword || !confirmPassword) {
      openModal('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      openModal('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        openModal('Thành công', data.message, () => {
          window.location.href = 'login.html';
        });
      } else {
        openModal('Lỗi', data.message || 'Không thể đặt lại mật khẩu');
      }
    } catch (err) {
      console.error(err);
      openModal('Lỗi', 'Không thể kết nối máy chủ.');
    }
  });
});
