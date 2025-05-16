import { apiRequest, showMessage } from './utils.js';

async function loadProfile() {
    const result = await apiRequest('/profile');
    if (result.success) {
        document.getElementById('name').value = result.data.name;
        document.getElementById('email').value = result.data.email;
        document.getElementById('phone').value = result.data.phone;
    }
}

document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;

    const result = await apiRequest('/profile', 'PUT', { name, phone });
    if (result.success) {
        showMessage('message', 'Cập nhật thông tin thành công!', true);
    } else {
        showMessage('message', result.message || 'Cập nhật thất bại');
    }
});

loadProfile();