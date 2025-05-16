import { apiRequest } from './api.js';

async function loadOrders() {
    const result = await apiRequest('/orders/process');
    if (result.success) {
        const orderProcessList = document.getElementById('orderProcessList');
        orderProcessList.innerHTML = '';
        result.data.forEach(order => {
            orderProcessList.innerHTML += `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.date}</td>
                    <td>${order.total} VND</td>
                    <td>
                        <select class="form-select" onchange="updateOrderStatus('${order.id}', this.value)">
                            <option value="Chờ xử lý" ${order.status === 'Chờ xử lý' ? 'selected' : ''}>Chờ xử lý</option>
                            <option value="Đang giao" ${order.status === 'Đang giao' ? 'selected' : ''}>Đang giao</option>
                            <option value="Hoàn thành" ${order.status === 'Hoàn thành' ? 'selected' : ''}>Hoàn thành</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="cancelOrder('${order.id}')">Hủy</button>
                    </td>
                </tr>
            `;
        });
    }
}

async function updateOrderStatus(orderId, newStatus) {
    const result = await apiRequest(`/orders/${orderId}/status`, 'PUT', { status: newStatus });
    if (result.success) {
        alert('Cập nhật trạng thái đơn hàng thành công!');
    }
}

async function cancelOrder(id) {
    if (confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
        const result = await apiRequest(`/orders/${id}/cancel`, 'PUT');
        if (result.success) loadOrders();
    }
}

loadOrders();