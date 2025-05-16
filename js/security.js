import { apiRequest } from "./api.js";

async function loadRoles() {
  const result = await apiRequest("/users/roles");
  if (result.success) {
    const roleList = document.getElementById("roleList");
    roleList.innerHTML = "";
    result.data.forEach((user) => {
      const roleSelect = createRoleSelect(user.ID_TaiKhoan, user.ID_ChucVu);
      roleList.innerHTML += `
                <tr>
                    <td>${user.ID_TaiKhoan}</td>
                    <td>${user.HoTen}</td>
                    <td>${user.Gmail}</td>
                    <td><span class="badge bg-info">${user.role_name}</span></td>
                    <td>${roleSelect}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="lockUser(${user.ID_TaiKhoan})">
                            <i class="fas fa-lock"></i> Khóa
                        </button>
                    </td>
                </tr>
            `;
    });
  }
}

function createRoleSelect(userId, currentRoleId) {
  return `
        <select class="form-select" onchange="updateRole(${userId}, this.value)">
            <option value="3" ${
              currentRoleId === 3 ? "selected" : ""
            }>User</option>
            <option value="2" ${
              currentRoleId === 2 ? "selected" : ""
            }>Quản lý</option>
            <option value="1" ${
              currentRoleId === 1 ? "selected" : ""
            }>Admin</option>
        </select>
    `;
}

window.updateRole = async function (userId, newRoleId) {
  if (confirm("Bạn có chắc chắn muốn thay đổi quyền của người dùng này?")) {
    let roleName = "user";
    if (newRoleId == 1) roleName = "admin";
    else if (newRoleId == 2) roleName = "manager";

    const result = await apiRequest(`/users/${userId}/role`, "PUT", {
      role: roleName,
    });
    if (result.success) {
      alert("Cập nhật quyền thành công!");
      loadRoles();
    } else {
      alert("Lỗi: " + (result.message || "Không thể cập nhật quyền"));
    }
  }
};

window.lockUser = async function (userId) {
  if (confirm("Bạn có chắc chắn muốn khóa người dùng này?")) {
    alert(
      "Tính năng khóa người dùng sẽ được triển khai trong phiên bản tiếp theo"
    );
  }
};

document.addEventListener("DOMContentLoaded", function () {
  loadRoles();
});

export { loadRoles };
