import { apiRequest } from './api.js';

async function loadReports() {
    const result = await apiRequest('/reports');
    if (result.success) {
        document.getElementById('totalUsers').textContent = result.data.totalUsers;
        document.getElementById('totalOrders').textContent = result.data.totalOrders;
        document.getElementById('totalRevenue').textContent = `${result.data.totalRevenue} VND`;
    }
}

loadReports();