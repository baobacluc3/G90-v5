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

async function loadOrders() {
  const searchQuery = currentSearch
    ? `&search=${encodeURIComponent(currentSearch)}`
    : "";
  const statusQuery = currentStatus !== "all" ? `&status=${currentStatus}` : "";
  const result = await apiRequest(
    `/orders/process?page=${currentPage}&limit=${itemsPerPage}${searchQuery}${statusQuery}`
  );

  if (result.success) {
    const orderProcessList = document.getElementById("orderProcessList");
    orderProcessList.innerHTML = "";

    result.data.forEach((order) => {
      const statusSelectHtml = generateStatusSelect(
        order.ID_DonHang,
        order.TrangThai
      );

      orderProcessList.innerHTML += `
                <tr>
                    <td>${order.ID_DonHang}</td>
                    <td>${order.HoTen || "N/A"}</td>
                    <td>${formatDate(order.NgayDat)}</td>
                    <td>${formatCurrency(order.TongTien)}</td>
                    <td>${statusSelectHtml}</td>
                    <td>
                        <button class="btn btn-primary btn-sm me-1" onclick="viewOrderDetail(${
                          order.ID_DonHang
                        })">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="cancelOrder(${
                          order.ID_DonHang
                        })">
                            <i class="fas fa-times"></i> Hủy
                        </button>
                    </td>
                </tr>
            `;
    });

    updatePagination(result.total, result.page, result.limit);
  }
}

function generateStatusSelect(orderId, currentStatus) {
  return `
        <select class="form-select form-select-sm status-select" onchange="updateOrderStatus(${orderId}, this.value)">
            <option value="Chờ xử lý" ${
              currentStatus === "Chờ xử lý" ? "selected" : ""
            }>Chờ xử lý</option>
            <option value="Đang chuẩn bị" ${
              currentStatus === "Đang chuẩn bị" ? "selected" : ""
            }>Đang chuẩn bị</option>
            <option value="Đang giao" ${
              currentStatus === "Đang giao" ? "selected" : ""
            }>Đang giao</option>
            <option value="Hoàn thành" ${
              currentStatus === "Hoàn thành" ? "selected" : ""
            }>Hoàn thành</option>
            <option value="Đã hủy" ${
              currentStatus === "Đã hủy" ? "selected" : ""
            }>Đã hủy</option>
        </select>
    `;
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

function formatCurrency(amount) {
  if (!amount) return "0 VND";
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
  loadOrders();
};

window.searchOrders = function () {
  const searchInput = document.getElementById("searchInput");
  currentSearch = searchInput.value.trim();
  currentPage = 1;
  loadOrders();
};

window.filterByStatus = function () {
  const statusFilter = document.getElementById("statusFilter");
  currentStatus = statusFilter.value;
  currentPage = 1;
  loadOrders();
};

window.viewOrderDetail = async function (id) {
  const result = await apiRequest(`/orders/${id}`);
  if (result.success) {
    const order = result.data;
    const orderItems = result.items || [];

    let itemsHtml = "";
    orderItems.forEach((item) => {
      itemsHtml += `
                <tr>
                    <td>${item.TenSP}</td>
                    <td>${item.SoLuong}</td>
                    <td>${formatCurrency(item.DonGia)}</td>
                    <td>${formatCurrency(item.SoLuong * item.DonGia)}</td>
                </tr>
            `;
    });

    const modalContent = `
            <div class="order-detail">
                <h5>Thông tin đơn hàng #${order.ID_DonHang}</h5>
                <div class="row mb-3">
                    <div class="col-6"><strong>Khách hàng:</strong> ${
                      order.HoTen || "N/A"
                    }</div>
                    <div class="col-6"><strong>Số điện thoại:</strong> ${
                      order.DienThoai || "N/A"
                    }</div>
                </div>
                <div class="row mb-3">
                    <div class="col-6"><strong>Ngày đặt:</strong> ${formatDate(
                      order.NgayDat
                    )}</div>
                    <div class="col-6"><strong>Trạng thái:</strong> ${
                      order.TrangThai
                    }</div>
                </div>
                <div class="row mb-3">
                    <div class="col-12"><strong>Địa chỉ:</strong> ${
                      order.DiaChi || "N/A"
                    }</div>
                </div>
                <div class="row mb-3">
                    <div class="col-12"><strong>Ghi chú:</strong> ${
                      order.GhiChu || "Không có"
                    }</div>
                </div>
                
                <h5 class="mt-4">Chi tiết sản phẩm</h5>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="text-end"><strong>Tổng tiền:</strong></td>
                            <td><strong>${formatCurrency(
                              order.TongTien
                            )}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

    const detailModal = new bootstrap.Modal(
      document.getElementById("orderDetailModal")
    );
    document.getElementById(
      "orderDetailModalLabel"
    ).textContent = `Chi tiết đơn hàng #${order.ID_DonHang}`;
    document.querySelector("#orderDetailModal .modal-body").innerHTML =
      modalContent;
    detailModal.show();
  } else {
    alert("Lỗi: " + (result.message || "Không thể lấy thông tin đơn hàng"));
  }
};

window.updateOrderStatus = async function (orderId, newStatus) {
  const result = await apiRequest(`/orders/${orderId}/status`, "PUT", {
    status: newStatus,
  });
  if (result.success) {
    const message = `Cập nhật trạng thái đơn hàng #${orderId} thành "${newStatus}" thành công!`;
    showToast(message, "success");
  } else {
    showToast(
      "Lỗi: " + (result.message || "Không thể cập nhật trạng thái đơn hàng"),
      "danger"
    );
  }
};

window.cancelOrder = function (id) {
  if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
    cancelOrderConfirm(id);
  }
};

async function cancelOrderConfirm(id) {
  const result = await apiRequest(`/orders/${id}/cancel`, "PUT");
  if (result.success) {
    showToast("Hủy đơn hàng thành công!", "success");
    loadOrders();
  } else {
    showToast("Lỗi: " + (result.message || "Không thể hủy đơn hàng"), "danger");
  }
}

function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    const container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(container);
  }

  const toastId = "toast-" + Date.now();
  const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

  document
    .getElementById("toastContainer")
    .insertAdjacentHTML("beforeend", toastHtml);
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
  toast.show();

  toastElement.addEventListener("hidden.bs.toast", function () {
    toastElement.remove();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  loadOrders();

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchOrders();
      }
    });
  }

  const statusFilter = document.getElementById("statusFilter");
  if (statusFilter) {
    statusFilter.addEventListener("change", filterByStatus);
  }

  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (
    !currentUser ||
    (currentUser.role !== "admin" && currentUser.role !== "manager")
  ) {
    window.location.href = "../auth/login.html";
  }
});

export { loadOrders };
