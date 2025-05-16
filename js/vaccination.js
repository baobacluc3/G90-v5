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

async function loadVaccinations() {
    const petId = document.getElementById('petSelect').value;
    if (!petId) return;

    const result = await apiRequest(`/pets/${petId}/vaccinations`);
    if (result.success) {
        const vaccinationList = document.getElementById('vaccinationList');
        vaccinationList.innerHTML = '';
        result.data.forEach(vaccine => {
            vaccinationList.innerHTML += `
                <tr>
                    <td>${vaccine.name}</td>
                    <td>${vaccine.date}</td>
                    <td>${vaccine.status}</td>
                    <td>${vaccine.note || ''}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editVaccination('${vaccine.id}')">Sửa</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteVaccination('${vaccine.id}')">Xóa</button>
                    </td>
                </tr>
            `;
        });
    }
}

document.getElementById('addVaccinationForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const petId = document.getElementById('petSelect').value;
    const name = document.getElementById('vaccineName').value;
    const date = document.getElementById('vaccineDate').value;
    const status = document.getElementById('vaccineStatus').value;
    const note = document.getElementById('vaccineNote').value;

    const result = await apiRequest(`/pets/${petId}/vaccinations`, 'POST', { name, date, status, note });
    if (result.success) {
        loadVaccinations();
        bootstrap.Modal.getInstance(document.getElementById('addVaccinationModal')).hide();
    }
});

async function editVaccination(id) {
    alert(`Chỉnh sửa mũi tiêm ID: ${id}`);
}

async function deleteVaccination(id) {
    if (confirm('Bạn có chắc muốn xóa?')) {
        const petId = document.getElementById('petSelect').value;
        const result = await apiRequest(`/pets/${petId}/vaccinations/${id}`, 'DELETE');
        if (result.success) loadVaccinations();
    }
}

loadPets();