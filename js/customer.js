import { apiRequest } from './api.js';

async function loadCustomers() {
    const result = await apiRequest('/customers');
    if (result.success) {
        const customerList = document.getElementById('customerList');
        customerList.innerHTML = '';
        result.data.forEach(customer => {
            customerList.innerHTML += `
                <tr>
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.phone}</td>
                    <td>${customer.totalOrders}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="viewCustomer('${customer.id}')">Xem</button>
                    </td>
                </tr>
            `;
        });
    }
}

function viewCustomer(id) {
    alert(`Xem chi tiết khách hàng ID: ${id}`);
}

loadCustomers();