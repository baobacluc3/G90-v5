import { apiRequest, showMessage } from './utils.js';

async function loadOrders() {
    const result = await apiRequest('/orders');
    if (result.success) {
        const orderSelect = document.getElementById('orderSelect');
        result.data.forEach(order => {
            const option = document.createElement('option');
            option.value = order.id;
            option.textContent = `Đơn hàng #${order.id} - ${order.date}`;
            orderSelect.appendChild(option);
        });
    }
}

document.getElementById('reviewForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const orderId = document.getElementById('orderSelect').value;
    const rating = document.getElementById('rating').value;
    const comment = document.getElementById('comment').value;

    const result = await apiRequest(`/orders/${orderId}/reviews`, 'POST', { rating, comment });
    if (result.success) {
        showMessage('message', 'Đánh giá của bạn đã được gửi thành công!', true);
        document.getElementById('reviewForm').reset();
    } else {
        showMessage('message', result.message || 'Gửi đánh giá thất bại');
    }
});

loadOrders();