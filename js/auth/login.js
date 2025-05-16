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
  document.querySelector('.toggle-password').addEventListener('click', function () {
    const pw = document.getElementById('password');
    const icon = this.querySelector('i');
    if (pw.type === 'password') {
      pw.type = 'text';
      icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      pw.type = 'password';
      icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
  });

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      openModal('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.success) {
        const userInfo = {
          ...data.user,
          role: data.user.ID_ChucVu === 1 ? 'admin' : 'user'
        };
        localStorage.setItem('loggedInUser', JSON.stringify(userInfo));
        
        openModal('Thành công', 'Đăng nhập thành công!', () => {
          if (userInfo.role === 'admin') {
            window.location.href = '../admin/project.html';
          } else {
            window.location.href = '../../pages/home.html';
          }
        });
      } else {
        openModal('Lỗi', data.message || 'Sai tài khoản hoặc mật khẩu.');
      }
    } catch (err) {
      console.error('Lỗi khi gửi yêu cầu đăng nhập:', err);
      openModal('Lỗi máy chủ', 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    }
  });
});