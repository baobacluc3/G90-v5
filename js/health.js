import { apiRequest } from './api.js';

async function loadPets() {
    const result = await apiRequest('/pets');
    if (result.success) {
        const petSelect = document.getElementById('petSelect');
        result.data.forEach(pet => {
            const option = document.createElement('option');
            option.value = pet.id;
            option.textContent = pet.name;
            petSelect.appendChild(option);
        });
    }
}

document.getElementById('healthForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const petId = document.getElementById('petSelect').value;
    const status = document.getElementById('healthStatus').value;
    const updateDate = document.getElementById('updateDate').value;

    const result = await apiRequest(`/pets/${petId}/health`, 'POST', { status, updateDate });
    if (result.success) {
        alert('Cập nhật sức khỏe thành công!');
        document.getElementById('healthForm').reset();
    }
});

loadPets();