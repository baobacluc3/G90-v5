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
let currentStatus = "all";
const itemsPerPage = 10;

async function loadPromos() {
  const searchQuery = currentSearch
    ? `&search=${encodeURIComponent(currentSearch)}`
    : "";
  const statusQuery = currentStatus !== "all" ? `&status=${currentStatus}` : "";
  const result = await apiRequest(
    `/promos?page=${currentPage}&limit=${itemsPerPage}${searchQuery}${statusQuery}`
  );

  if (result.success) {
    const promoList = document.getElementById("promoList");
    promoList.innerHTML = "";

    result.data.forEach((promo) => {
      const statusBadge = getStatusBadge(promo.TrangThai);
      const isActive = isPromoActive(promo.NgayBatDau, promo.NgayKetThuc);

      promoList.innerHTML += `
        <tr class="${!isActive ? 'table-secondary' : ''}">
          <td>#${promo.ID_ChuongTrinh}</td>
          <td>${promo.TenChuongTrinh}</td>
          <td>${formatDate(promo.NgayBatDau)}</td>
          <td>${formatDate(promo.NgayKetThuc)}</td>
          <td>${promo.PhanTramGiam}%</td>
          <td>${promo.SoTienToiDa ? formatCurrency(promo.SoTienToiDa) : 'Không giới hạn'}</td>
          <td>${promo.SoLuongDaSuDung || 0}/${promo.SoLuongToiDa || '∞'}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn btn-primary btn-sm me-1" onclick="viewPromo(${promo.ID_ChuongTrinh})">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-warning btn-sm me-1" onclick="editPromo(${promo.ID_ChuongTrinh})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-${isActive ? 'secondary' : 'success'} btn-sm me-1" 
                    onclick="togglePromoStatus(${promo.ID_ChuongTrinh}, '${isActive ? 'Tạm dừng' : 'Hoạt động'}')">
              <i class="fas fa-${isActive ? 'pause' : 'play'}"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="deletePromo(${promo.ID_ChuongTrinh})">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });

    updatePagination(result.total, result.page, result.limit);
  }
}

function getStatusBadge(status) {
  switch (status) {
    case "Hoạt động":
      return '<span class="badge bg-success">Hoạt động</span>';
    case "Tạm dừng":
      return '<span class="badge bg-warning">Tạm dừng</span>';
    case "Đã kết thúc":
      return '<span class="badge bg-secondary">Đã kết thúc</span>';
    case "Sắp bắt đầu":
      return '<span class="badge bg-info">Sắp bắt đầu</span>';
    default:
      return '<span class="badge bg-light">Không xác định</span>';
  }
}

function isPromoActive(startDate, endDate) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  return now >= start && now <= end;
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
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

window.changePage = function (page) {
  currentPage = page;
  loadPromos();
};

window.searchPromos = function () {
  const searchInput = document.getElementById("searchInput");
  currentSearch = searchInput.value.trim();
  currentPage = 1;
  loadPromos();
};

window.filterByStatus = function () {
  const statusFilter = document.getElementById("statusFilter");
  currentStatus = statusFilter.value;
  currentPage = 1;
  loadPromos();
};

window.viewPromo = async function (id) {
  const result = await apiRequest(`/promos/${id}`);
  if (result.success) {
    const promo = result.data;
    const modal = new bootstrap.Modal(document.getElementById("promoDetailModal"));
    
    document.getElementById("promoDetailModalLabel").textContent = 
      `Chi tiết: ${promo.TenChuongTrinh}`;
    
    const detailContent = document.getElementById("promoDetailContent");
    detailContent.innerHTML = `
      <div class="row mb-3">
        <div class="col-md-6">
          <p><strong>Mã chương trình:</strong> #${promo.ID_ChuongTrinh}</p>
          <p><strong>Tên chương trình:</strong> ${promo.TenChuongTrinh}</p>
          <p><strong>Mô tả:</strong> ${promo.MoTa || 'Không có'}</p>
          <p><strong>Phần trăm giảm:</strong> ${promo.PhanTramGiam}%</p>
        </div>
        <div class="col-md-6">
          <p><strong>Ngày bắt đầu:</strong> ${formatDate(promo.NgayBatDau)}</p>
          <p><strong>Ngày kết thúc:</strong> ${formatDate(promo.NgayKetThuc)}</p>
          <p><strong>Số tiền tối đa:</strong> ${promo.SoTienToiDa ? formatCurrency(promo.SoTienToiDa) : 'Không giới hạn'}</p>
          <p><strong>Số lượng sử dụng:</strong> ${promo.SoLuongDaSuDung || 0}/${promo.SoLuongToiDa || '∞'}</p>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <p><strong>Trạng thái:</strong> ${getStatusBadge(promo.TrangThai)}</p>
          <p><strong>Điều kiện áp dụng:</strong> ${promo.DieuKienApDung || 'Không có điều kiện đặc biệt'}</p>
        </div>
      </div>
    `;
    
    modal.show();
  }
};

window.addPromo = function () {
  document.getElementById("promoModalLabel").textContent = "Thêm Chương Trình Khuyến Mãi";
  document.getElementById("promoForm").reset();
  document.getElementById("promoId").value = "";
  
  const today = new Date().toISOString().split('T')[0];
  document.getElementById("ngayBatDau").min = today;
  document.getElementById("ngayKetThuc").min = today;
  
  const modal = new bootstrap.Modal(document.getElementById("promoModal"));
  modal.show();
};

window.editPromo = async function (id) {
  const result = await apiRequest(`/promos/${id}`);
  if (result.success) {
    const promo = result.data;
    
    document.getElementById("promoModalLabel").textContent = "Sửa Chương Trình Khuyến Mãi";
    document.getElementById("promoId").value = promo.ID_ChuongTrinh;
    document.getElementById("tenChuongTrinh").value = promo.TenChuongTrinh;
    document.getElementById("moTa").value = promo.MoTa || "";
    document.getElementById("phanTramGiam").value = promo.PhanTramGiam;
    document.getElementById("soTienToiDa").value = promo.SoTienToiDa || "";
    document.getElementById("ngayBatDau").value = promo.NgayBatDau.split('T')[0];
    document.getElementById("ngayKetThuc").value = promo.NgayKetThuc.split('T')[0];
    document.getElementById("soLuongToiDa").value = promo.SoLuongToiDa || "";
    document.getElementById("dieuKienApDung").value = promo.DieuKienApDung || "";
    document.getElementById("trangThai").value = promo.TrangThai;
    
    const modal = new bootstrap.Modal(document.getElementById("promoModal"));
    modal.show();
  }
};

window.togglePromoStatus = async function (id, newStatus) {
  if (confirm(`Bạn có chắc chắn muốn ${newStatus.toLowerCase()} chương trình này?`)) {
    const result = await apiRequest(`/promos/${id}/status`, "PUT", {
      status: newStatus
    });
    
    if (result.success) {
      alert(`${newStatus} chương trình thành công!`);
      loadPromos();
    } else {
      alert("Lỗi: " + (result.message || "Không thể cập nhật trạng thái"));
    }
  }
};

window.deletePromo = function (id) {
  if (confirm("Bạn có chắc chắn muốn xóa chương trình khuyến mãi này?")) {
    deletePromoConfirm(id);
  }
};

async function deletePromoConfirm(id) {
  const result = await apiRequest(`/promos/${id}`, "DELETE");
  if (result.success) {
    alert("Xóa chương trình thành công!");
    loadPromos();
  } else {
    alert("Lỗi: " + (result.message || "Không thể xóa chương trình"));
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadPromos();

  const promoForm = document.getElementById("promoForm");
  if (promoForm) {
    promoForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const promoId = document.getElementById("promoId").value;
      const tenChuongTrinh = document.getElementById("tenChuongTrinh").value;
      const moTa = document.getElementById("moTa").value;
      const phanTramGiam = document.getElementById("phanTramGiam").value;
      const soTienToiDa = document.getElementById("soTienToiDa").value;
      const ngayBatDau = document.getElementById("ngayBatDau").value;
      const ngayKetThuc = document.getElementById("ngayKetThuc").value;
      const soLuongToiDa = document.getElementById("soLuongToiDa").value;
      const dieuKienApDung = document.getElementById("dieuKienApDung").value;
      const trangThai = document.getElementById("trangThai").value;

      if (new Date(ngayKetThuc) <= new Date(ngayBatDau)) {
        alert("Ngày kết thúc phải sau ngày bắt đầu!");
        return;
      }

      if (phanTramGiam < 1 || phanTramGiam > 100) {
        alert("Phần trăm giảm phải từ 1% đến 100%!");
        return;
      }

      const promoData = {
        tenChuongTrinh,
        moTa,
        phanTramGiam: parseInt(phanTramGiam),
        soTienToiDa: soTienToiDa ? parseInt(soTienToiDa) : null,
        ngayBatDau,
        ngayKetThuc,
        soLuongToiDa: soLuongToiDa ? parseInt(soLuongToiDa) : null,
        dieuKienApDung,
        trangThai
      };

      let result;
      if (promoId) {
        result = await apiRequest(`/promos/${promoId}`, "PUT", promoData);
      } else {
        result = await apiRequest("/promos", "POST", promoData);
      }

      if (result.success) {
        alert(promoId ? "Cập nhật thành công!" : "Thêm chương trình thành công!");
        bootstrap.Modal.getInstance(document.getElementById("promoModal")).hide();
        loadPromos();
      } else {
        alert("Lỗi: " + (result.message || "Không thể lưu chương trình"));
      }
    });
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchPromos();
      }
    });
  }

  document.getElementById("ngayBatDau")?.addEventListener("change", function() {
    document.getElementById("ngayKetThuc").min = this.value;
  });
});