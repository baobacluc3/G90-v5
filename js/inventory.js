import { apiRequest } from './api.js';

async function loadInventory() {
    const result = await apiRequest('/inventory');
    if (result.success) {
        const inventoryList = document.getElementById('inventoryList');
        inventoryList.innerHTML = '';
        result.data.forEach(item => {
            inventoryList.innerHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price} VND</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editItem('${item.id}')">Sửa</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteItem('${item.id}')">Xóa</button>
                    </td>
                </tr>
            `;
        });
    }
}

document.getElementById('addInventoryForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('productName').value;
    const quantity = document.getElementById('quantity').value;
    const price = document.getElementById('price').value;

    const result = await apiRequest('/inventory', 'POST', { name, quantity, price });
    if (result.success) {
        loadInventory();
        bootstrap.Modal.getInstance(document.getElementById('addInventoryModal')).hide();
    }
});

async function editItem(id) {
    alert(`Chỉnh sửa sản phẩm ID: ${id}`);
}

async function deleteItem(id) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này khỏi kho?')) {
        const result = await apiRequest(`/inventory/${id}`, 'DELETE');
        if (result.success) loadInventory();
    }
}

loadInventory();