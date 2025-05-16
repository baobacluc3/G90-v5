import { apiRequest } from './api.js';

async function loadPayments() {
    const result = await apiRequest('/payments');
    if (result.success) {
        const paymentList = document.getElementById('paymentList');
        paymentList.innerHTML = '';
        result.data.forEach(payment => {
            paymentList.innerHTML += `
                <tr>
                    <td>${payment.id}</td>
                    <td>${payment.invoiceId}</td>
                    <td>${payment.amount} VND</td>
                    <td>
                        <select class="form-select" onchange="updatePaymentStatus('${payment.id}', this.value)">
                            <option value="Chờ xác nhận" ${payment.status === 'Chờ xác nhận' ? 'selected' : ''}>Chờ xác nhận</option>
                            <option value="Đã xác nhận" ${payment.status === 'Đã xác nhận' ? 'selected' : ''}>Đã xác nhận</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deletePayment('${payment.id}')">Xóa</button>
                    </td>
                </tr>
            `;
        });
    }
}

async function updatePaymentStatus(paymentId, newStatus) {
    const result = await apiRequest(`/payments/${paymentId}/status`, 'PUT', { status: newStatus });
    if (result.success) {
        alert('Cập nhật trạng thái thanh toán thành công!');
    }
}

async function deletePayment(id) {
    if (confirm('Bạn có chắc muốn xóa thanh toán này?')) {
        const result = await apiRequest(`/payments/${id}`, 'DELETE');
        if (result.success) loadPayments();
    }
}

loadPayments();