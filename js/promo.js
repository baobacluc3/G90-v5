import { apiRequest } from './api.js';

async function loadPromos() {
    const result = await apiRequest('/promos');
    if (result.success) {
        const promoList = document.getElementById('promoList');
        promoList.innerHTML = '';
        result.data.forEach(promo => {
            promoList.innerHTML += `
                <tr>
                    <td>${promo.name}</td>
                    <td>${promo.startDate}</td>
                    <td>${promo.endDate}</td>
                    <td>${promo.discount}%</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editPromo('${promo.id}')">Sửa</button>
                        <button class="btn btn-danger btn-sm" onclick="deletePromo('${promo.id}')">Xóa</button>
                    </td>
                </tr>
            `;
        });
    }
}

document.getElementById('addPromoForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('promoName').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const discount = document.getElementById('discount').value;

    const result = await apiRequest('/promos', 'POST', { name, startDate, endDate, discount });
    if (result.success) {
        loadPromos();
        bootstrap.Modal.getInstance(document.getElementById('addPromoModal')).hide();
    }
});

async function editPromo(id) {
    alert(`Chỉnh sửa chương trình khuyến mãi ID: ${id}`);
}

async function deletePromo(id) {
    if (confirm('Bạn có chắc muốn xóa chương trình này?')) {
        const result = await apiRequest(`/promos/${id}`, 'DELETE');
        if (result.success) loadPromos();
    }
}

loadPromos();