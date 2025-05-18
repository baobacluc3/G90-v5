import { apiRequest } from "./api.js";

let currentPage = 1;
let currentSearch = "";
const itemsPerPage = 10;

async function loadCustomers() {
  const searchQuery = currentSearch
    ? `&search=${encodeURIComponent(currentSearch)}`
    : "";
  const result = await apiRequest(
    `/customers?page=${currentPage}&limit=${itemsPerPage}${searchQuery}`
  );

  if (result.success) {
    const customerList = document.getElementById("customerList");
    customerList.innerHTML = "";

    result.data.forEach((customer) => {
      customerList.innerHTML += `
        <tr>
          <td>${customer.ID_KhachHang}</td>
          <td>${customer.HoTen}</td>
          <td>${customer.Email}</td>
          <td>${customer.DienThoai || ""}</td>
          <td>${customer.TongDonHang || 0}</td>
          <td>${customer.TongThanhToan || 0} VNĐ</td>
          <td>
            <button class="btn btn-primary btn-sm me-1" onclick="viewCustomer(${
              customer.ID_KhachHang
            })">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-warning btn-sm me-1" onclick="editCustomer(${
              customer.ID_KhachHang
            })">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteCustomer(${
              customer.ID_KhachHang
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
  loadCustomers();
};

window.searchCustomers = function () {
  const searchInput = document.getElementById("searchInput");
  currentSearch = searchInput.value.trim();
  currentPage = 1;
  loadCustomers();
};

window.viewCustomer = async function (id) {
  const result = await apiRequest(`/customers/${id}`);
  if (result.success) {
    const customer = result.data;

    const modal = new bootstrap.Modal(
      document.getElementById("customerDetailModal")
    );
    document.getElementById(
      "customerDetailModalLabel"
    ).textContent = `Thông Tin Khách Hàng: ${customer.HoTen}`;

    const detailContent = document.getElementById("customerDetailContent");
    detailContent.innerHTML = `
      <div class="row mb-3">
        <div class="col-md-6">
          <p><strong>Họ tên:</strong> ${customer.HoTen}</p>
          <p><strong>Email:</strong> ${customer.Email}</p>
          <p><strong>Số điện thoại:</strong> ${
            customer.DienThoai || "Chưa cập nhật"
          }</p>
          <p><strong>Địa chỉ:</strong> ${customer.DiaChi || "Chưa cập nhật"}</p>
        </div>
        <div class="col-md-6">
          <p><strong>Tổng đơn hàng:</strong> ${customer.TongDonHang || 0}</p>
          <p><strong>Tổng thanh toán:</strong> ${
            customer.TongThanhToan || 0
          } VNĐ</p>
          <p><strong>Ngày tạo tài khoản:</strong> ${formatDate(
            customer.NgayTao
          )}</p>
          <p><strong>Lần cuối mua hàng:</strong> ${formatDate(
            customer.LanCuoiMua
          )}</p>
        </div>
      </div>
      
      <h5 class="mt-4">Đơn Hàng Gần Đây</h5>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền (VNĐ)</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${
              customer.DonHang && customer.DonHang.length > 0
                ? customer.DonHang.map(
                    (order) => `
                <tr>
                  <td>${order.ID_DonHang}</td>
                  <td>${formatDate(order.NgayDat)}</td>
                  <td>${order.TongTien}</td>
                  <td>${getStatusBadge(order.TrangThai)}</td>
                </tr>
              `
                  ).join("")
                : '<tr><td colspan="4" class="text-center">Không có đơn hàng</td></tr>'
            }
          </tbody>
        </table>
      </div>
    `;

    modal.show();
  }
};

window.editCustomer = async function (id) {
  const result = await apiRequest(`/customers/${id}`);
  if (result.success) {
    const customer = result.data;

    document.getElementById("customerModalLabel").textContent =
      "Sửa Thông Tin Khách Hàng";
    document.getElementById("customerId").value = customer.ID_KhachHang;
    document.getElementById("hoTen").value = customer.HoTen;
    document.getElementById("email").value = customer.Email;
    document.getElementById("dienThoai").value = customer.DienThoai || "";
    document.getElementById("diaChi").value = customer.DiaChi || "";

    const modal = new bootstrap.Modal(document.getElementById("customerModal"));
    modal.show();
  }
};

window.addCustomer = function () {
  document.getElementById("customerModalLabel").textContent =
    "Thêm Khách Hàng Mới";
  document.getElementById("customerForm").reset();
  document.getElementById("customerId").value = "";

  const modal = new bootstrap.Modal(document.getElementById("customerModal"));
  modal.show();
};

window.deleteCustomer = function (id) {
  if (confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
    deleteCustomerConfirm(id);
  }
};

async function deleteCustomerConfirm(id) {
  const result = await apiRequest(`/customers/${id}`, "DELETE");
  if (result.success) {
    alert("Xóa khách hàng thành công!");
    loadCustomers();
  } else {
    alert("Lỗi: " + (result.message || "Không thể xóa khách hàng"));
  }
}

function getStatusBadge(status) {
  switch (status) {
    case "Hoàn thành":
      return '<span class="badge bg-success">Hoàn thành</span>';
    case "Đang xử lý":
      return '<span class="badge bg-warning">Đang xử lý</span>';
    case "Đang giao":
      return '<span class="badge bg-info">Đang giao</span>';
    case "Đã hủy":
      return '<span class="badge bg-danger">Đã hủy</span>';
    default:
      return '<span class="badge bg-secondary">Không xác định</span>';
  }
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

document.addEventListener("DOMContentLoaded", function () {
  loadCustomers();

  const customerForm = document.getElementById("customerForm");
  if (customerForm) {
    customerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const customerId = document.getElementById("customerId").value;
      const hoTen = document.getElementById("hoTen").value;
      const email = document.getElementById("email").value;
      const dienThoai = document.getElementById("dienThoai").value;
      const diaChi = document.getElementById("diaChi").value;

      const customerData = { hoTen, email, dienThoai, diaChi };

      let result;
      if (customerId) {
        result = await apiRequest(
          `/customers/${customerId}`,
          "PUT",
          customerData
        );
      } else {
        result = await apiRequest("/customers", "POST", customerData);
      }

      if (result.success) {
        alert(
          customerId ? "Cập nhật thành công!" : "Thêm khách hàng thành công!"
        );
        bootstrap.Modal.getInstance(
          document.getElementById("customerModal")
        ).hide();
        loadCustomers();
      } else {
        alert(
          "Lỗi: " + (result.message || "Không thể lưu thông tin khách hàng")
        );
      }
    });
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchCustomers();
      }
    });
  }
});

export { loadCustomers };
