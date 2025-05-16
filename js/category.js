import { apiRequest } from './api.js';

async function loadCategories() {
    const result = await apiRequest('/categories');
    if (result.success) {
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = '';
        result.data.forEach(category => {
            categoryList.innerHTML += `
                <tr>
                    <td>${category.name}</td>
                    <td>${category.description || ''}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editCategory('${category.id}')">Sửa</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteCategory('${category.id}')">Xóa</button>
                    </td>
                </tr>
            `;
        });
    }
}

document.getElementById('addCategoryForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('categoryName').value;
    const description = document.getElementById('categoryDescription').value;

    const result = await apiRequest('/categories', 'POST', { name, description });
    if (result.success) {
        loadCategories();
        bootstrap.Modal.getInstance(document.getElementById('addCategoryModal')).hide();
    }
});

async function editCategory(id) {
    alert(`Chỉnh sửa danh mục ID: ${id}`);
}

async function deleteCategory(id) {
    if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
        const result = await apiRequest(`/categories/${id}`, 'DELETE');
        if (result.success) loadCategories();
    }
}

loadCategories();