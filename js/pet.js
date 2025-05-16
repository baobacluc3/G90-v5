import { apiRequest } from './api.js';

document.getElementById('addPetForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('petName').value;
    const age = document.getElementById('petAge').value;
    const breed = document.getElementById('petBreed').value;

    const result = await apiRequest('/pets', 'POST', { name, age, breed });
    if (result.success) {
        loadPets();
        bootstrap.Modal.getInstance(document.getElementById('addPetModal')).hide();
    }
});

async function loadPets() {
    const result = await apiRequest('/pets');
    if (result.success) {
        const petList = document.getElementById('petList');
        petList.innerHTML = '';
        result.data.forEach(pet => {
            petList.innerHTML += `
                <tr>
                    <td>${pet.name}</td>
                    <td>${pet.age}</td>
                    <td>${pet.breed}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editPet('${pet.id}')">Sửa</button>
                        <button class="btn btn-danger btn-sm" onclick="deletePet('${pet.id}')">Xóa</button>
                    </td>
                </tr>
            `;
        });
    }
}

async function editPet(id) {
    alert(`Chỉnh sửa thú cưng ID: ${id}`);
}

async function deletePet(id) {
    if (confirm('Bạn có chắc muốn xóa?')) {
        const result = await apiRequest(`/pets/${id}`, 'DELETE');
        if (result.success) loadPets();
    }
}

loadPets();