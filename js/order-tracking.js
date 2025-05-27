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
const itemsPerPage = 15;

// Sample orders used when the API is unavailable
const sampleOrders = [
  {
    ID_DonHang: "SAMPLE001",
    NgayDat: "2024-05-20T10:00:00",
    NgayCapNhat: "2024-05-21T09:00:00",
    TrangThai: "Chờ xác nhận",
    MucDoUuTien: "Cao",
    TongTien: 150000,
    SoLuongSanPham: 2,
    TenKhachHang: "Nguyễn Văn A",
    SoDienThoai: "0901234567",
    DiaChiGiaoHang: "123 Đường ABC, Quận 1",
    SanPham: [
      { TenSP: "Thức ăn cho chó", SoLuong: 1, Gia: 100000 },
      { TenSP: "Vòng cổ", SoLuong: 1, Gia: 50000 },
    ],
    LichSuTrangThai: [
      { ThoiGian: "2024-05-20T10:00:00", TrangThai: "Chờ xác nhận", GhiChu: "" },
    ],
  },
  {
    ID_DonHang: "SAMPLE002",
    NgayDat: "2024-05-18T14:30:00",
    NgayCapNhat: "2024-05-20T08:00:00",
    TrangThai: "Đang giao hàng",
    MucDoUuTien: "Trung bình",
    TongTien: 250000,
    SoLuongSanPham: 3,
    TenKhachHang: "Trần Thị B",
    SoDienThoai: "0909876543",
    DiaChiGiaoHang: "456 Đường XYZ, Quận 5",
    SanPham: [
      { TenSP: "Dây dắt", SoLuong: 2, Gia: 70000 },
      { TenSP: "Thức ăn cho mèo", SoLuong: 1, Gia: 110000 },
    ],
    LichSuTrangThai: [
      { ThoiGian: "2024-05-18T14:30:00", TrangThai: "Chờ xác nhận", GhiChu: "" },
      { ThoiGian: "2024-05-19T09:00:00", TrangThai: "Đã xác nhận", GhiChu: "" },
      { ThoiGian: "2024-05-20T08:00:00", TrangThai: "Đang giao hàng", GhiChu: "" },
    ],
  },
];

async function loadOrders() {
  console.log("Loading orders...", {
    currentPage,
    currentSearch,
    currentStatus,
  });

  const searchQuery = currentSearch
    ? `&search=${encodeURIComponent(currentSearch)}`
    : "";
  const statusQuery = currentStatus !== "all" ? `&status=${currentStatus}` : "";
  const url = `/api/orders/tracking?page=${currentPage}&limit=${itemsPerPage}${searchQuery}${statusQuery}`;

  console.log("Fetching from URL:", url);

  try {
    const result = await apiRequest(
      `/orders/tracking?page=${currentPage}&limit=${itemsPerPage}${searchQuery}${statusQuery}`
    );
    console.log("API Response:", result);

    if (result.success) {
      displayOrders(result.data);
      updatePagination(result.total, result.page, result.limit);
      updateOrderStats(result.stats);
    } else {
      console.error("API returned error:", result.message);
      showNotification(
        "Lỗi: " + (result.message || "Không thể tải đơn hàng"),
        "error"
      );

      // Fallback to sample data
      displayOrders(sampleOrders);
      updatePagination(sampleOrders.length, 1, itemsPerPage);
      updateOrderStats(calculateStats(sampleOrders));
    }
  } catch (error) {
    console.error("Network error:", error);
    showNotification("Lỗi kết nối: " + error.message, "error");
    // Use sample data when network fails
    displayOrders(sampleOrders);
    updatePagination(sampleOrders.length, 1, itemsPerPage);
    updateOrderStats(calculateStats(sampleOrders));
  }
}

function displayOrders(orders) {
  console.log("Displaying orders:", orders);
  const orderList = document.getElementById("orderTrackingList");

  if (!orders || orders.length === 0) {
    orderList.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    <div class="py-4">
                        <i class="fas fa-inbox fa-2x mb-2"></i>
                        <div>Không có đơn hàng nào</div>
                    </div>
                </td>
            </tr>
        `;
    return;
  }

  orderList.innerHTML = "";

  orders.forEach((order) => {
    console.log("Processing order:", order);
    const statusBadge = getStatusBadge(order.TrangThai);
    const priorityBadge = getPriorityBadge(order.MucDoUuTien);
    const timeInfo = getTimeInfo(order.NgayDat, order.NgayCapNhat);

    orderList.innerHTML += `
            <tr class="order-row" data-order-id="${order.ID_DonHang}">
                <td>
                    <div class="order-id">#${order.ID_DonHang}</div>
                    <small class="text-muted">${formatDate(
                      order.NgayDat
                    )}</small>
                </td>
                <td>
                    <div class="customer-info">
                        <strong>${order.TenKhachHang || "N/A"}</strong>
                        <div class="text-muted small">${
                          order.SoDienThoai || ""
                        }</div>
                    </div>
                </td>
                <td>
                    <div class="order-details">
                        <div>${
                          order.TongTien
                            ? formatCurrency(order.TongTien)
                            : "0 VNĐ"
                        }</div>
                        <small class="text-muted">${
                          order.SoLuongSanPham || 0
                        } sản phẩm</small>
                    </div>
                </td>
                <td>
                    ${statusBadge}
                    ${priorityBadge}
                </td>
                <td>
                    <div class="time-info">
                        <div class="small">${timeInfo}</div>
                        <div class="text-muted small">
                            Cập nhật: ${formatDateTime(order.NgayCapNhat)}
                        </div>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewOrderDetails(${
                          order.ID_DonHang
                        })">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="editOrderStatus(${
                          order.ID_DonHang
                        })">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${getQuickActionButtons(
                          order.ID_DonHang,
                          order.TrangThai
                        )}
                    </div>
                </td>
            </tr>
        `;
  });
}

function getStatusBadge(status) {
  const statusConfig = {
    "Chờ xác nhận": { bg: "warning", icon: "clock" },
    "Đã xác nhận": { bg: "info", icon: "check" },
    "Đang chuẩn bị": { bg: "primary", icon: "box" },
    "Đang giao hàng": { bg: "secondary", icon: "truck" },
    "Đã giao hàng": { bg: "success", icon: "check-circle" },
    "Đã hủy": { bg: "danger", icon: "times-circle" },
    "Hoàn trả": { bg: "dark", icon: "undo" },
  };

  const config = statusConfig[status] || { bg: "secondary", icon: "question" };
  return `<span class="badge bg-${config.bg}">
        <i class="fas fa-${config.icon} me-1"></i>${status}
    </span>`;
}

function getPriorityBadge(priority) {
  if (!priority || priority === "Bình thường") return "";

  const priorityConfig = {
    Cao: { bg: "danger", icon: "exclamation-triangle" },
    "Trung bình": { bg: "warning", icon: "exclamation" },
  };

  const config = priorityConfig[priority];
  if (!config) return "";

  return `<span class="badge bg-${config.bg} ms-1">
        <i class="fas fa-${config.icon} me-1"></i>${priority}
    </span>`;
}

function getTimeInfo(orderDate, updateDate) {
  const now = new Date();
  const created = new Date(orderDate);
  const diffHours = Math.round((now - created) / (1000 * 60 * 60));

  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  } else {
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} ngày trước`;
  }
}

function getQuickActionButtons(orderId, status) {
  let buttons = "";

  switch (status) {
    case "Chờ xác nhận":
      buttons += `
                <button class="btn btn-sm btn-success ms-1" onclick="quickUpdateStatus(${orderId}, 'Đã xác nhận')">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-danger ms-1" onclick="quickUpdateStatus(${orderId}, 'Đã hủy')">
                    <i class="fas fa-times"></i>
                </button>
            `;
      break;
    case "Đã xác nhận":
      buttons += `
                <button class="btn btn-sm btn-primary ms-1" onclick="quickUpdateStatus(${orderId}, 'Đang chuẩn bị')">
                    <i class="fas fa-box"></i>
                </button>
            `;
      break;
    case "Đang chuẩn bị":
      buttons += `
                <button class="btn btn-sm btn-secondary ms-1" onclick="quickUpdateStatus(${orderId}, 'Đang giao hàng')">
                    <i class="fas fa-truck"></i>
                </button>
            `;
      break;
    case "Đang giao hàng":
      buttons += `
                <button class="btn btn-sm btn-success ms-1" onclick="quickUpdateStatus(${orderId}, 'Đã giao hàng')">
                    <i class="fas fa-check-circle"></i>
                </button>
            `;
      break;
  }

  return buttons;
}

function calculateStats(orders) {
  const stats = { total: 0, pending: 0, processing: 0, completed: 0 };
  if (!orders || orders.length === 0) return stats;

  stats.total = orders.length;
  orders.forEach((o) => {
    switch (o.TrangThai) {
      case "Chờ xác nhận":
        stats.pending++;
        break;
      case "Đã xác nhận":
      case "Đang chuẩn bị":
      case "Đang giao hàng":
        stats.processing++;
        break;
      case "Đã giao hàng":
        stats.completed++;
        break;
    }
  });
  return stats;
}

function updateOrderStats(stats) {
  if (!stats) return;

  document.getElementById("totalOrders").textContent = stats.total || 0;
  document.getElementById("pendingOrders").textContent = stats.pending || 0;
  document.getElementById("processingOrders").textContent =
    stats.processing || 0;
  document.getElementById("completedOrders").textContent = stats.completed || 0;

  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  document.getElementById("completionRate").textContent = `${completionRate}%`;
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

window.viewOrderDetails = async function (orderId) {
  const sample = sampleOrders.find((o) => o.ID_DonHang === String(orderId));
  if (sample) {
    showOrderDetailsModal(sample);
    return;
  }

  const result = await apiRequest(`/orders/${orderId}/details`);
  if (result.success) {
    showOrderDetailsModal(result.data);
  }
};

window.editOrderStatus = async function (orderId) {
  const sample = sampleOrders.find((o) => o.ID_DonHang === String(orderId));
  if (sample) {
    showEditStatusModal(sample);
    return;
  }

  const result = await apiRequest(`/orders/${orderId}`);
  if (result.success) {
    showEditStatusModal(result.data);
  }
};

window.quickUpdateStatus = async function (orderId, newStatus) {
  const sample = sampleOrders.find((o) => o.ID_DonHang === String(orderId));
  if (sample) {
    showNotification("Không thể thay đổi trạng thái mẫu", "error");
    return;
  }

  if (
    confirm(`Bạn có chắc chắn muốn cập nhật trạng thái thành "${newStatus}"?`)
  ) {
    const result = await apiRequest(`/orders/${orderId}/status`, "PUT", {
      status: newStatus,
    });
    if (result.success) {
      showNotification("Cập nhật trạng thái thành công!", "success");
      loadOrders();
    } else {
      showNotification(
        "Lỗi: " + (result.message || "Không thể cập nhật trạng thái"),
        "error"
      );
    }
  }
};

function showOrderDetailsModal(order) {
  const modal = document.getElementById("orderDetailsModal");
  const modalBody = modal.querySelector(".modal-body");

  modalBody.innerHTML = `
        <div class="order-details-content">
            <div class="row mb-3">
                <div class="col-md-6">
                    <h6>Thông tin đơn hàng</h6>
                    <p><strong>Mã đơn hàng:</strong> #${order.ID_DonHang}</p>
                    <p><strong>Ngày đặt:</strong> ${formatDateTime(
                      order.NgayDat
                    )}</p>
                    <p><strong>Trạng thái:</strong> ${order.TrangThai}</p>
                    <p><strong>Tổng tiền:</strong> ${formatCurrency(
                      order.TongTien
                    )}</p>
                </div>
                <div class="col-md-6">
                    <h6>Thông tin khách hàng</h6>
                    <p><strong>Tên:</strong> ${order.TenKhachHang || "N/A"}</p>
                    <p><strong>Điện thoại:</strong> ${
                      order.SoDienThoai || "N/A"
                    }</p>
                    <p><strong>Địa chỉ:</strong> ${
                      order.DiaChiGiaoHang || "N/A"
                    }</p>
                </div>
            </div>
            
            <h6>Lịch sử trạng thái</h6>
            <div class="status-timeline">
                ${generateStatusTimeline(order.LichSuTrangThai)}
            </div>
            
            <h6>Sản phẩm</h6>
            <div class="products-list">
                ${generateProductsList(order.SanPham)}
            </div>
        </div>
    `;

  new bootstrap.Modal(modal).show();
}

function showEditStatusModal(order) {
  const modal = document.getElementById("editStatusModal");
  const form = modal.querySelector("#editStatusForm");

  document.getElementById("editOrderId").value = order.ID_DonHang;
  document.getElementById("currentStatus").value = order.TrangThai;
  document.getElementById("priorityLevel").value =
    order.MucDoUuTien || "Bình thường";
  document.getElementById("statusNote").value = "";

  new bootstrap.Modal(modal).show();
}

function generateStatusTimeline(statusHistory) {
  if (!statusHistory || statusHistory.length === 0) {
    return '<p class="text-muted">Không có lịch sử trạng thái</p>';
  }

  return statusHistory
    .map(
      (item) => `
        <div class="timeline-item">
            <div class="timeline-time">${formatDateTime(item.ThoiGian)}</div>
            <div class="timeline-status">${item.TrangThai}</div>
            <div class="timeline-note">${item.GhiChu || ""}</div>
        </div>
    `
    )
    .join("");
}

function generateProductsList(products) {
  if (!products || products.length === 0) {
    return '<p class="text-muted">Không có sản phẩm</p>';
  }

  return products
    .map(
      (product) => `
        <div class="product-item d-flex justify-content-between">
            <div>
                <strong>${product.TenSP}</strong>
                <span class="text-muted"> x${product.SoLuong}</span>
            </div>
            <div>${formatCurrency(product.Gia * product.SoLuong)}</div>
        </div>
    `
    )
    .join("");
}

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("vi-VN");
}

function formatDateTime(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("vi-VN");
}

function formatCurrency(amount) {
  if (!amount) return "0 VNĐ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function showNotification(message, type = "info") {
  const alertClass =
    type === "success"
      ? "alert-success"
      : type === "error"
      ? "alert-danger"
      : "alert-info";

  const notification = document.createElement("div");
  notification.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
  notification.style.top = "20px";
  notification.style.right = "20px";
  notification.style.zIndex = "9999";
  notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}

document
  .getElementById("editStatusForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const orderId = document.getElementById("editOrderId").value;
    const newStatus = document.getElementById("currentStatus").value;
    const priority = document.getElementById("priorityLevel").value;
    const note = document.getElementById("statusNote").value;

    const updateData = {
      status: newStatus,
      priority: priority,
      note: note,
    };

    const result = await apiRequest(
      `/orders/${orderId}/status`,
      "PUT",
      updateData
    );
    if (result.success) {
      showNotification("Cập nhật đơn hàng thành công!", "success");
      bootstrap.Modal.getInstance(
        document.getElementById("editStatusModal")
      ).hide();
      loadOrders();
    } else {
      showNotification(
        "Lỗi: " + (result.message || "Không thể cập nhật đơn hàng"),
        "error"
      );
    }
  });

document
  .getElementById("searchInput")
  ?.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      searchOrders();
    }
  });

document
  .getElementById("statusFilter")
  ?.addEventListener("change", filterByStatus);

document.addEventListener("DOMContentLoaded", function () {
  loadOrders();

  setInterval(loadOrders, 30000);
});

window.exportOrders = function () {
  const params = new URLSearchParams({
    search: currentSearch,
    status: currentStatus,
    format: "excel",
  });

  window.open(`/api/orders/export?${params.toString()}`, "_blank");
};

window.printOrders = function () {
  window.print();
};
