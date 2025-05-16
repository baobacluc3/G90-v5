import { apiRequest } from './api.js';

async function loadProjects() {
    const result = await apiRequest('/projects');
    if (result.success) {
        const projectList = document.getElementById('projectList');
        projectList.innerHTML = '';
        result.data.forEach(project => {
            projectList.innerHTML += `
                <tr>
                    <td>${project.name}</td>
                    <td>${project.status}</td>
                    <td>${project.startDate}</td>
                    <td>${project.endDate}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editProject('${project.id}')">Sửa</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProject('${project.id}')">Xóa</button>
                    </td>
                </tr>
            `;
        });
    }
}

document.getElementById('addProjectForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('projectName').value;
    const status = document.getElementById('projectStatus').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const result = await apiRequest('/projects', 'POST', { name, status, startDate, endDate });
    if (result.success) {
        loadProjects();
        bootstrap.Modal.getInstance(document.getElementById('addProjectModal')).hide();
    }
});

async function editProject(id) {
    alert(`Chỉnh sửa dự án ID: ${id}`);
}

async function deleteProject(id) {
    if (confirm('Bạn có chắc muốn xóa dự án này?')) {
        const result = await apiRequest(`/projects/${id}`, 'DELETE');
        if (result.success) loadProjects();
    }
}

loadProjects();