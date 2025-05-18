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
let currentHealthStatus = "all";
const itemsPerPage = 10;

async function loadPetHealth() {
  const searchQuery = currentSearch
    ? `&search=${encodeURIComponent(currentSearch)}`
    : "";
  const statusQuery =
    currentHealthStatus !== "all" ? `&status=${currentHealthStatus}` : "";
  const result = await apiRequest(
    `/pet-health?page=${currentPage}&limit=${itemsPerPage}${searchQuery}${statusQuery}`
  );

  if (result.success) {
    const petHealthList = document.getElementById("petHealthList");
    petHealthList.innerHTML = "";

    result.data.forEach((pet) => {
      const statusBadge = getHealthStatusBadge(pet.TrangThaiSucKhoe);
      const lastUpdate = pet.NgayCapNhatCuoi
        ? formatDate(pet.NgayCapNhatCuoi)
        : "Chưa cập nhật";

      petHealthList.innerHTML += `
        <tr>
          <td>${pet.ID_ThuCung}</td>
          <td>
            <div class="d-flex align-items-center">
              <i class="fas fa-paw text-primary me-2"></i>
              <strong>${pet.TenThuCung}</strong>
            </div>
          </td>
          <td>${pet.TenChuSoHuu}</td>
          <td>${pet.Loai}</td>
          <td>${pet.Tuoi} tuổi</td>
          <td>${statusBadge}</td>
          <td>${lastUpdate}</td>
          <td>
            <button class="btn btn-info btn-sm me-1" onclick="viewHealthHistory(${pet.ID_ThuCung})">
              <i class="fas fa-history"></i>
            </button>
            <button class="btn btn-success btn-sm me-1" onclick="updateHealth(${pet.ID_ThuCung})">
              <i class="fas fa-heartbeat"></i>
            </button>
            <button class="btn btn-warning btn-sm me-1" onclick="editPet(${pet.ID_ThuCung})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="deletePet(${pet.ID_ThuCung})">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });

    updatePagination(result.total, result.page, result.limit);
    updateStatistics(result.stats);
  }
}

function getHealthStatusBadge(status) {
  switch (status) {
    case "Khỏe mạnh":
      return '<span class="badge bg-success">Khỏe mạnh</span>';
    case "Cần theo dõi":
      return '<span class="badge bg-warning">Cần theo dõi</span>';
    case "Đang điều trị":
      return '<span class="badge bg-danger">Đang điều trị</span>';
    case "Đã khỏi":
      return '<span class="badge bg-info">Đã khỏi</span>';
    default:
      return '<span class="badge bg-secondary">Chưa cập nhật</span>';
  }
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

function formatDateTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN");
}

function updatePagination(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  const pagination = document.getElementById("pagination");

  if (!pagination) return;

  let paginationHTML = "";

  if (page > 1) {
    paginationHTML += `<li class="page-item">
      <a class="page-link" href="#" onclick="changePage(${page - 1})">Trước</a>
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
      <a class="page-link" href="#" onclick="changePage(${page + 1})">Sau</a>
    </li>`;
  }

  pagination.innerHTML = paginationHTML;
}

function updateStatistics(stats) {
  if (stats) {
    document.getElementById("totalPets").textContent = stats.total || 0;
    document.getElementById("healthyPets").textContent = stats.healthy || 0;
    document.getElementById("needCheckupPets").textContent = stats.needCheckup || 0;
    document.getElementById("treatmentPets").textContent = stats.treatment || 0;
  }
}

window.changePage = function (page) {
  currentPage = page;
  loadPetHealth();
};

window.searchPetHealth = function () {
  const searchInput = document.getElementById("searchInput");
  currentSearch = searchInput.value.trim();
  currentPage = 1;
  loadPetHealth();
};

window.filterByHealthStatus = function () {
  const statusFilter = document.getElementById("healthStatusFilter");
  currentHealthStatus = statusFilter.value;
  currentPage = 1;
  loadPetHealth();
};

window.addPet = function () {
  document.getElementById("petModalLabel").textContent = "Thêm Thú Cưng";
  document.getElementById("petForm").reset();
  document.getElementById("petId").value = "";

  const modal = new bootstrap.Modal(document.getElementById("petModal"));
  modal.show();
};

window.editPet = async function (id) {
  const result = await apiRequest(`/pet-health/${id}`);
  if (result.success) {
    const pet = result.data;

    document.getElementById("petModalLabel").textContent = "Sửa Thông Tin Thú Cưng";
    document.getElementById("petId").value = pet.ID_ThuCung;
    document.getElementById("petName").value = pet.TenThuCung;
    document.getElementById("ownerName").value = pet.TenChuSoHuu;
    document.getElementById("petSpecies").value = pet.Loai;
    document.getElementById("petBreed").value = pet.Giong || "";
    document.getElementById("petAge").value = pet.Tuoi;
    document.getElementById("petGender").value = pet.GioiTinh || "";
    document.getElementById("petWeight").value = pet.CanNang || "";
    document.getElementById("ownerPhone").value = pet.SoDienThoai || "";
    document.getElementById("ownerAddress").value = pet.DiaChi || "";

    const modal = new bootstrap.Modal(document.getElementById("petModal"));
    modal.show();
  }
};

window.deletePet = function (id) {
  if (confirm("Bạn có chắc chắn muốn xóa thú cưng này?")) {
    deletePetConfirm(id);
  }
};

async function deletePetConfirm(id) {
  const result = await apiRequest(`/pet-health/${id}`, "DELETE");
  if (result.success) {
    alert("Xóa thú cưng thành công!");
    loadPetHealth();
  } else {
    alert("Lỗi: " + (result.message || "Không thể xóa thú cưng"));
  }
}

window.updateHealth = async function (petId) {
  const result = await apiRequest(`/pet-health/${petId}`);
  if (result.success) {
    const pet = result.data;

    document.getElementById("healthModalLabel").textContent = "Cập Nhật Sức Khỏe";
    document.getElementById("healthPetId").value = pet.ID_ThuCung;
    document.getElementById("healthPetInfo").textContent = 
      `${pet.TenThuCung} - ${pet.Loai} (${pet.TenChuSoHuu})`;

    const today = new Date().toISOString().split('T')[0];
    document.getElementById("checkupDate").value = today;

    document.getElementById("healthForm").reset();
    document.getElementById("healthPetId").value = pet.ID_ThuCung;
    document.getElementById("checkupDate").value = today;

    const modal = new bootstrap.Modal(document.getElementById("healthModal"));
    modal.show();
  }
};

window.viewHealthHistory = async function (petId) {
  const result = await apiRequest(`/pet-health/${petId}/history`);
  if (result.success) {
    const pet = result.pet;
    const history = result.history;

    document.getElementById("historyModalLabel").textContent = 
      `Lịch Sử Sức Khỏe - ${pet.TenThuCung}`;

    let historyHTML = `
      <div class="pet-info mb-4">
        <div class="row">
          <div class="col-md-6">
            <p><strong>Tên:</strong> ${pet.TenThuCung}</p>
            <p><strong>Loài:</strong> ${pet.Loai}</p>
            <p><strong>Tuổi:</strong> ${pet.Tuoi} tuổi</p>
          </div>
          <div class="col-md-6">
            <p><strong>Chủ sở hữu:</strong> ${pet.TenChuSoHuu}</p>
            <p><strong>Giống:</strong> ${pet.Giong || "Không xác định"}</p>
            <p><strong>Cân nặng:</strong> ${pet.CanNang || "Chưa cập nhật"} kg</p>
          </div>
        </div>
      </div>

      <h6>Lịch Sử Khám Bệnh</h6>
    `;

    if (history && history.length > 0) {
      historyHTML += '<div class="health-timeline">';
      history.forEach(record => {
        const statusClass = getStatusClass(record.TrangThaiSucKhoe);
        historyHTML += `
          <div class="timeline-item mb-3 p-3 border-start border-${statusClass} border-3">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <h6 class="mb-1">
                  ${getHealthStatusBadge(record.TrangThaiSucKhoe)}
                  <span class="ms-2 text-muted">${formatDateTime(record.NgayKham)}</span>
                </h6>
                ${record.TrieuChung ? `<p class="mb-1"><strong>Triệu chứng:</strong> ${record.TrieuChung}</p>` : ''}
                ${record.ChanDoan ? `<p class="mb-1"><strong>Chẩn đoán:</strong> ${record.ChanDoan}</p>` : ''}
                ${record.PhuongPhapDieuTri ? `<p class="mb-1"><strong>Điều trị:</strong> ${record.PhuongPhapDieuTri}</p>` : ''}
                ${record.BacSiPhuTrach ? `<p class="mb-1"><strong>Bác sĩ:</strong> ${record.BacSiPhuTrach}</p>` : ''}
                <div class="row">
                  ${record.NhietDo ? `<div class="col-md-4"><small><strong>Nhiệt độ:</strong> ${record.NhietDo}°C</small></div>` : ''}
                  ${record.CanNang ? `<div class="col-md-4"><small><strong>Cân nặng:</strong> ${record.CanNang} kg</small></div>` : ''}
                  ${record.NgayTaiKham ? `<div class="col-md-4"><small><strong>Tái khám:</strong> ${formatDate(record.NgayTaiKham)}</small></div>` : ''}
                </div>
                ${record.GhiChu ? `<p class="mt-2 text-muted"><em>${record.GhiChu}</em></p>` : ''}
              </div>
            </div>
          </div>
        `;
      });
      historyHTML += '</div>';
    } else {
      historyHTML += '<p class="text-muted">Chưa có lịch sử khám bệnh</p>';
    }

    document.getElementById("healthHistoryContent").innerHTML = historyHTML;

    const modal = new bootstrap.Modal(document.getElementById("historyModal"));
    modal.show();
  }
};

function getStatusClass(status) {
  switch (status) {
    case "Khỏe mạnh": return "success";
    case "Cần theo dõi": return "warning";
    case "Đang điều trị": return "danger";
    case "Đã khỏi": return "info";
    default: return "secondary";
  }
}

window.exportHealthData = async function () {
  const result = await apiRequest("/pet-health/export");
  if (result.success) {
    const csvContent = result.data;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `suc-khoe-thu-cung-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  } else {
    alert("Lỗi xuất dữ liệu: " + result.message);
  }
};

document.addEventListener("DOMContentLoaded", function () {
  loadPetHealth();

  const petForm = document.getElementById("petForm");
  if (petForm) {
    petForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const petId = document.getElementById("petId").value;
      const formData = new FormData(petForm);
      const petData = Object.fromEntries(formData);

      let result;
      if (petId) {
        result = await apiRequest(`/pet-health/${petId}`, "PUT", petData);
      } else {
        result = await apiRequest("/pet-health", "POST", petData);
      }

      if (result.success) {
        alert(petId ? "Cập nhật thành công!" : "Thêm thú cưng thành công!");
        bootstrap.Modal.getInstance(document.getElementById("petModal")).hide();
        loadPetHealth();
      } else {
        alert("Lỗi: " + (result.message || "Không thể lưu thông tin thú cưng"));
      }
    });
  }

  const healthForm = document.getElementById("healthForm");
  if (healthForm) {
    healthForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const petId = document.getElementById("healthPetId").value;
      const formData = new FormData(healthForm);
      const healthData = Object.fromEntries(formData);

      const result = await apiRequest(`/pet-health/${petId}/health`, "POST", healthData);

      if (result.success) {
        alert("Cập nhật sức khỏe thành công!");
        bootstrap.Modal.getInstance(document.getElementById("healthModal")).hide();
        loadPetHealth();
      } else {
        alert("Lỗi: " + (result.message || "Không thể cập nhật sức khỏe"));
      }
    });
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchPetHealth();
      }
    });
  }

  const statusFilter = document.getElementById("healthStatusFilter");
  if (statusFilter) {
    statusFilter.addEventListener("change", filterByHealthStatus);
  }
});

export { loadPetHealth };

// import { apiRequest } from './api.js';

// document.getElementById('addPetForm')?.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const name = document.getElementById('petName').value;
//     const age = document.getElementById('petAge').value;
//     const breed = document.getElementById('petBreed').value;

//     const result = await apiRequest('/pets', 'POST', { name, age, breed });
//     if (result.success) {
//         loadPets();
//         bootstrap.Modal.getInstance(document.getElementById('addPetModal')).hide();
//     }
// });

// async function loadPets() {
//     const result = await apiRequest('/pets');
//     if (result.success) {
//         const petList = document.getElementById('petList');
//         petList.innerHTML = '';
//         result.data.forEach(pet => {
//             petList.innerHTML += `
//                 <tr>
//                     <td>${pet.name}</td>
//                     <td>${pet.age}</td>
//                     <td>${pet.breed}</td>
//                     <td>
//                         <button class="btn btn-warning btn-sm" onclick="editPet('${pet.id}')">Sửa</button>
//                         <button class="btn btn-danger btn-sm" onclick="deletePet('${pet.id}')">Xóa</button>
//                     </td>
//                 </tr>
//             `;
//         });
//     }
// }

// async function editPet(id) {
//     alert(`Chỉnh sửa thú cưng ID: ${id}`);
// }

// async function deletePet(id) {
//     if (confirm('Bạn có chắc muốn xóa?')) {
//         const result = await apiRequest(`/pets/${id}`, 'DELETE');
//         if (result.success) loadPets();
//     }
// }

// loadPets();