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

async function loadAppointments() {
  const searchQuery = currentSearch
    ? `&search=${encodeURIComponent(currentSearch)}`
    : "";
  const statusQuery = currentStatus !== "all" ? `&status=${currentStatus}` : "";
  const result = await apiRequest(
    `/appointments?page=${currentPage}&limit=${itemsPerPage}${searchQuery}${statusQuery}`
  );

  if (result.success) {
    const appointmentList = document.getElementById("appointmentList");
    appointmentList.innerHTML = "";

    result.data.forEach((appointment) => {
      const statusBadge = getStatusBadge(appointment.TrangThai);

      appointmentList.innerHTML += `
                <tr>
                    <td>#${appointment.ID_LichSu}</td>
                    <td>${appointment.HoTen}</td>
                    <td>${appointment.TenThuCung || "N/A"}</td>
                    <td>${appointment.DichVu}</td>
                    <td>${formatDate(appointment.Ngay)}</td>
                    <td>${appointment.Gio}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-primary btn-sm me-1" onclick="viewAppointment(${
                          appointment.ID_LichSu
                        })">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-warning btn-sm me-1" onclick="editAppointment(${
                          appointment.ID_LichSu
                        })">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${getStatusButtons(
                          appointment.ID_LichSu,
                          appointment.TrangThai
                        )}
                        <button class="btn btn-danger btn-sm" onclick="deleteAppointment(${
                          appointment.ID_LichSu
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

function getStatusBadge(status) {
  switch (status) {
    case "Chờ xác nhận":
      return '<span class="badge bg-warning">Chờ xác nhận</span>';
    case "Đã xác nhận":
      return '<span class="badge bg-success">Đã xác nhận</span>';
    case "Hoàn thành":
      return '<span class="badge bg-info">Hoàn thành</span>';
    case "Đã hủy":
      return '<span class="badge bg-danger">Đã hủy</span>';
    default:
      return '<span class="badge bg-secondary">Không xác định</span>';
  }
}

function getStatusButtons(id, currentStatus) {
  let buttons = "";

  if (currentStatus === "Chờ xác nhận") {
    buttons += `<button class="btn btn-success btn-sm me-1" onclick="updateStatus(${id}, 'Đã xác nhận')">
            <i class="fas fa-check"></i>
        </button>`;
  }

  if (currentStatus === "Đã xác nhận") {
    buttons += `<button class="btn btn-info btn-sm me-1" onclick="updateStatus(${id}, 'Hoàn thành')">
            <i class="fas fa-check-double"></i>
        </button>`;
  }

  if (currentStatus !== "Đã hủy" && currentStatus !== "Hoàn thành") {
    buttons += `<button class="btn btn-secondary btn-sm me-1" onclick="updateStatus(${id}, 'Đã hủy')">
            <i class="fas fa-times"></i>
        </button>`;
  }

  return buttons;
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

window.changePage = function (page) {
  currentPage = page;
  loadAppointments();
};

window.searchAppointments = function () {
  const searchInput = document.getElementById("searchInput");
  currentSearch = searchInput.value.trim();
  currentPage = 1;
  loadAppointments();
};

window.filterByStatus = function () {
  const statusFilter = document.getElementById("statusFilter");
  currentStatus = statusFilter.value;
  currentPage = 1;
  loadAppointments();
};

window.viewAppointment = async function (id) {
  const result = await apiRequest(`/appointments?page=1&limit=100`);
  const appointment = result.data.find((a) => a.ID_LichSu === id);

  if (appointment) {
    const details = `
            Mã lịch hẹn: #${appointment.ID_LichSu}
            Tên khách hàng: ${appointment.HoTen}
            Số điện thoại: ${appointment.SoDienThoai}
            Tên thú cưng: ${appointment.TenThuCung || "N/A"}
            Dịch vụ: ${appointment.DichVu}
            Chi nhánh: ${appointment.ChiNhanh}
            Ngày: ${formatDate(appointment.Ngay)}
            Giờ: ${appointment.Gio}
            Trạng thái: ${appointment.TrangThai}
            Ghi chú: ${appointment.GhiChu || "Không có"}
        `;
    alert(details);
  }
};

window.addAppointment = function () {
  console.log("Add appointment clicked"); // Debug log
  document.getElementById("appointmentModalLabel").textContent =
    "Thêm Lịch Hẹn";
  document.getElementById("appointmentForm").reset();
  document.getElementById("appointmentId").value = "";

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("ngay").min = today;

  const modal = new bootstrap.Modal(
    document.getElementById("appointmentModal")
  );
  modal.show();
};

window.editAppointment = async function (id) {
  const result = await apiRequest(`/appointments?page=1&limit=100`);
  const appointment = result.data.find((a) => a.ID_LichSu === id);

  if (appointment) {
    document.getElementById("appointmentModalLabel").textContent =
      "Sửa Lịch Hẹn";
    document.getElementById("appointmentId").value = appointment.ID_LichSu;
    document.getElementById("hoTen").value = appointment.HoTen;
    document.getElementById("soDienThoai").value = appointment.SoDienThoai;
    document.getElementById("tenThuCung").value = appointment.TenThuCung || "";
    document.getElementById("dichVu").value = appointment.DichVu;
    document.getElementById("chiNhanh").value = appointment.ChiNhanh;
    document.getElementById("ngay").value = appointment.Ngay;
    document.getElementById("gio").value = appointment.Gio;
    document.getElementById("ghiChu").value = appointment.GhiChu || "";

    const modal = new bootstrap.Modal(
      document.getElementById("appointmentModal")
    );
    modal.show();
  }
};

window.updateStatus = async function (id, newStatus) {
  if (
    confirm(`Bạn có chắc chắn muốn cập nhật trạng thái thành "${newStatus}"?`)
  ) {
    const result = await apiRequest(`/appointments/${id}/status`, "PUT", {
      status: newStatus,
    });
    if (result.success) {
      alert("Cập nhật trạng thái thành công!");
      loadAppointments();
    } else {
      alert("Lỗi: " + (result.message || "Không thể cập nhật trạng thái"));
    }
  }
};

window.deleteAppointment = function (id) {
  if (confirm("Bạn có chắc chắn muốn xóa lịch hẹn này?")) {
    deleteAppointmentConfirm(id);
  }
};

async function deleteAppointmentConfirm(id) {
  const result = await apiRequest(`/appointments/${id}`, "DELETE");
  if (result.success) {
    alert("Xóa lịch hẹn thành công!");
    loadAppointments();
  } else {
    alert("Lỗi: " + (result.message || "Không thể xóa lịch hẹn"));
  }
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("Appointment DOM loaded"); // Debug log

  loadAppointments();

  const appointmentForm = document.getElementById("appointmentForm");
  if (appointmentForm) {
    appointmentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Form submitted"); // Debug log

      const appointmentId = document.getElementById("appointmentId").value;
      const hoTen = document.getElementById("hoTen").value;
      const soDienThoai = document.getElementById("soDienThoai").value;
      const tenThuCung = document.getElementById("tenThuCung").value;
      const dichVu = document.getElementById("dichVu").value;
      const chiNhanh = document.getElementById("chiNhanh").value;
      const ngay = document.getElementById("ngay").value;
      const gio = document.getElementById("gio").value;
      const ghiChu = document.getElementById("ghiChu").value;

      const appointmentData = {
        hoTen,
        soDienThoai,
        tenThuCung,
        dichVu,
        chiNhanh,
        ngay,
        gio,
        ghiChu,
      };

      console.log("Appointment data:", appointmentData); // Debug log

      let result;
      if (appointmentId) {
        result = await apiRequest(
          `/appointments/${appointmentId}`,
          "PUT",
          appointmentData
        );
      } else {
        result = await apiRequest("/appointments", "POST", appointmentData);
      }

      console.log("Result:", result);

      if (result.success) {
        alert(
          appointmentId ? "Cập nhật thành công!" : "Thêm lịch hẹn thành công!"
        );
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("appointmentModal")
        );
        modal.hide();
        loadAppointments();
      } else {
        alert("Lỗi: " + (result.message || "Không thể lưu lịch hẹn"));
      }
    });
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchAppointments();
      }
    });
  }

  const statusFilter = document.getElementById("statusFilter");
  if (statusFilter) {
    statusFilter.addEventListener("change", filterByStatus);
  }
});
