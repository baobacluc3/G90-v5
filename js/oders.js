import { apiRequest } from './api.js';

async function loadOrders() {
    const result = await apiRequest('/orders');
    if (result.success) {
        const orderList = document.getElementById('orderList');
        orderList.innerHTML = '';
        result.data.forEach(order => {
            orderList.innerHTML += `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.date}</td>
                    <td>${order.total} VND</td>
                    <td>${order.status}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="viewOrder('${order.id}')">Xem</button>
                    </td>
                </tr>
            `;
        });
    }
}

function viewOrder(orderId) {
    alert(`Xem chi tiết đơn hàng ID: ${orderId}`);
    // Có thể chuyển hướng đến trang chi tiết đơn hàng nếu cần
}

loadOrders();