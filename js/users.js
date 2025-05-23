async function apiRequest(endpoint, method = "GET", data = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (data) options.body = JSON.stringify(data);

  try {
    const response = await fetch(`/api${endpoint}`, options);
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Lỗi hệ thống" };
  }
}

let currentPage = 1;
let currentSearch = "";
const itemsPerPage = 10;

async function loadUsers() {
  const searchQuery = currentSearch
    ? `&search=${encodeURIComponent(currentSearch)}`
    : "";
  const result = await apiRequest(
    `/users?page=${currentPage}&limit=${itemsPerPage}${searchQuery}`
  );

  if (result.success) {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    result.data.forEach((user) => {
      const roleText = getRoleText(user.ID_ChucVu);
      const statusBadge = getStatusBadge(user.TrangThai || "Hoạt động");

      userList.innerHTML += `
                <tr>
                    <td>${user.ID_TaiKhoan}</td>
                    <td>${user.HoTen}</td>
                    <td>${user.Gmail}</td>
                    <td>${user.DienThoai || ""}</td>
                    <td><span class="badge bg-info">${roleText}</span></td>
                    <td>${formatDate(user.NamSinh)}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-primary btn-sm me-1" onclick="editUser(${
                          user.ID_TaiKhoan
                        })">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteUser(${
                          user.ID_TaiKhoan
                        })">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
    });

    updatePagination(result.total, result.page, result.limit);
  }
}

function getRoleText(roleId) {
  switch (roleId) {
    case 1:
      return "Admin";
    case 2:
      return "Quản lý";
    case 3:
      return "User";
    default:
      return "User";
  }
}

function getStatusBadge(status) {
  if (status === "Hoạt động") {
    return '<span class="badge bg-success">Hoạt động</span>';
  } else {
    return '<span class="badge bg-danger">Không hoạt động</span>';
  }
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

function updatePagination(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  const pagination = document.getElementById("pagination");

  if (!pagination) return;

  let paginationHTML = "";

  if (page > 1) {
    paginationHTML += `<li class="page-item">
            <a class="page-link" href="#" onclick="changePage(${
              page - 1
            })">Trước</a>
        </li>`;
  }

  for (
    let i = Math.max(1, page - 2);
    i <= Math.min(totalPages, page + 2);
    i++
  ) {
    const activeClass = i === page ? "active" : "";
    paginationHTML += `<li class="page-item ${activeClass}">
            <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
        </li>`;
  }

  if (page < totalPages) {
    paginationHTML += `<li class="page-item">
            <a class="page-link" href="#" onclick="changePage(${
              page + 1
            })">Sau</a>
        </li>`;
  }

  pagination.innerHTML = paginationHTML;
}

function changePage(page) {
  currentPage = page;
  loadUsers();
}

function searchUsers() {
  const searchInput = document.getElementById("searchInput");
  currentSearch = searchInput.value.trim();
  currentPage = 1;
  loadUsers();
}

function addUser() {
  console.log("Add user clicked");
  document.getElementById("userModalLabel").textContent = "Thêm Người Dùng";
  document.getElementById("userForm").reset();
  document.getElementById("userId").value = "";

  document
    .getElementById("matKhau")
    .parentElement.querySelector("small").style.display = "none";

  const modal = new bootstrap.Modal(document.getElementById("userModal"));
  modal.show();
}

async function editUser(id) {
  const result = await apiRequest(`/users?search=&page=1&limit=100`);
  const user = result.data.find((u) => u.ID_TaiKhoan === id);

  if (user) {
    document.getElementById("userModalLabel").textContent = "Sửa Người Dùng";
    document.getElementById("userId").value = user.ID_TaiKhoan;
    document.getElementById("hoTen").value = user.HoTen;
    document.getElementById("gmail").value = user.Gmail;
    document.getElementById("dienThoai").value = user.DienThoai || "";
    document.getElementById("chucVu").value = user.ID_ChucVu;

    document
      .getElementById("matKhau")
      .parentElement.querySelector("small").style.display = "block";

    const modal = new bootstrap.Modal(document.getElementById("userModal"));
    modal.show();
  }
}

function deleteUser(id) {
  if (confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
    deleteUserConfirm(id);
  }
}

async function deleteUserConfirm(id) {
  const result = await apiRequest(`/users/${id}`, "DELETE");
  if (result.success) {
    alert("Xóa người dùng thành công!");
    loadUsers();
  } else {
    alert("Lỗi: " + (result.message || "Không thể xóa người dùng"));
  }
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded");

  loadUsers();

  const userForm = document.getElementById("userForm");
  if (userForm) {
    userForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const userId = document.getElementById("userId").value;
      const hoTen = document.getElementById("hoTen").value;
      const gmail = document.getElementById("gmail").value;
      const dienThoai = document.getElementById("dienThoai").value;
      const matKhau = document.getElementById("matKhau").value;
      const chucVu = document.getElementById("chucVu").value;

      const userData = { hoTen, gmail, dienThoai, chucVu };

      if (!userId && matKhau) {
        userData.matKhau = matKhau;
      }

      let result;
      if (userId) {
        result = await apiRequest(`/users/${userId}`, "PUT", userData);
      } else {
        if (!matKhau) {
          alert("Vui lòng nhập mật khẩu cho người dùng mới");
          return;
        }
        result = await apiRequest("/users", "POST", userData);
      }

      if (result.success) {
        alert(userId ? "Cập nhật thành công!" : "Thêm người dùng thành công!");
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("userModal")
        );
        modal.hide();
        loadUsers();
      } else {
        alert("Lỗi: " + (result.message || "Không thể lưu người dùng"));
      }
    });
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchUsers();
      }
    });
  }
});
