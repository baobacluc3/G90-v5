import { apiRequest } from './api.js';

async function loadClinics() {
    const result = await apiRequest('/clinics');
    if (result.success) {
        const clinicList = document.getElementById('clinicList');
        clinicList.innerHTML = '';
        result.data.forEach(clinic => {
            clinicList.innerHTML += `
                <tr>
                    <td>${clinic.name}</td>
                    <td>${clinic.address}</td>
                    <td>${clinic.phone}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editClinic('${clinic.id}')">Sửa</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteClinic('${clinic.id}')">Xóa</button>
                    </td>
                </tr>
            `;
        });
    }
}

document.getElementById('addClinicForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('clinicName').value;
    const address = document.getElementById('clinicAddress').value;
    const phone = document.getElementById('clinicPhone').value;

    const result = await apiRequest('/clinics', 'POST', { name, address, phone });
    if (result.success) {
        loadClinics();
        bootstrap.Modal.getInstance(document.getElementById('addClinicModal')).hide();
    }
});

async function editClinic(id) {
    alert(`Chỉnh sửa cơ sở thú y ID: ${id}`);
}

async function deleteClinic(id) {
    if (confirm('Bạn có chắc muốn xóa cơ sở này?')) {
        const result = await apiRequest(`/clinics/${id}`, 'DELETE');
        if (result.success) loadClinics();
    }
}

loadClinics();