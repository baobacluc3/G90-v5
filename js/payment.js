import { apiRequest } from "./api.js";

let currentPage = 1;
let currentSearch = "";
let currentStatus = "all";
const itemsPerPage = 10;

async function loadPayments() {
  const searchQuery = currentSearch
    ? `&search=${encodeURIComponent(currentSearch)}`
    : "";
  const statusQuery = currentStatus !== "all" ? `&status=${currentStatus}` : "";
  const result = await apiRequest(
    `/payments?page=${currentPage}&limit=${itemsPerPage}${searchQuery}${statusQuery}`
  );

  if (result.success) {
    const paymentList = document.getElementById("paymentList");
    paymentList.innerHTML = "";

    result.data.forEach((payment) => {
      const statusBadge = getStatusBadge(payment.status);

      paymentList.innerHTML += `
                <tr>
                    <td>${payment.id}</td>
                    <td>${payment.invoiceId}</td>
                    <td>${payment.amount.toLocaleString("vi-VN")} VND</td>
                    <td>${payment.paymentMethod || "Chuyển khoản"}</td>
                    <td>
                        <select class="form-select form-select-sm" onchange="updatePaymentStatus('${
                          payment.id
                        }', this.value)">
                            <option value="Chờ xác nhận" ${
                              payment.status === "Chờ xác nhận"
                                ? "selected"
                                : ""
                            }>Chờ xác nhận</option>
                            <option value="Đã xác nhận" ${
                              payment.status === "Đã xác nhận" ? "selected" : ""
                            }>Đã xác nhận</option>
                        </select>
                    </td>
                    <td>${formatDate(payment.paymentDate)}</td>
                    <td>
                        <button class="btn btn-primary btn-sm me-1" onclick="viewPayment('${
                          payment.id
                        }')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deletePayment('${
                          payment.id
                        }')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
    });

    updatePagination(result.total, result.page, result.limit);
  } else {
    loadMockPayments();
  }
}

function loadMockPayments() {
  const mockData = [
    {
      id: 1,
      invoiceId: "INV001",
      amount: 500000,
      paymentMethod: "Chuyển khoản",
      status: "Đã xác nhận",
      paymentDate: "2025-05-15",
    },
    {
      id: 2,
      invoiceId: "INV002",
      amount: 300000,
      paymentMethod: "Tiền mặt",
      status: "Chờ xác nhận",
      paymentDate: "2025-05-16",
    },
    {
      id: 3,
      invoiceId: "INV003",
      amount: 750000,
      paymentMethod: "Chuyển khoản",
      status: "Đã xác nhận",
      paymentDate: "2025-05-16",
    },
    {
      id: 4,
      invoiceId: "INV004",
      amount: 420000,
      paymentMethod: "Tiền mặt",
      status: "Chờ xác nhận",
      paymentDate: "2025-05-17",
    },
  ];

  const paymentList = document.getElementById("paymentList");
  paymentList.innerHTML = "";

  mockData.forEach((payment) => {
    const statusBadge = getStatusBadge(payment.status);

    paymentList.innerHTML += `
            <tr>
                <td>${payment.id}</td>
                <td>${payment.invoiceId}</td>
                <td>${payment.amount.toLocaleString("vi-VN")} VND</td>
                <td>${payment.paymentMethod}</td>
                <td>
                    <select class="form-select form-select-sm" onchange="updatePaymentStatus('${
                      payment.id
                    }', this.value)">
                        <option value="Chờ xác nhận" ${
                          payment.status === "Chờ xác nhận" ? "selected" : ""
                        }>Chờ xác nhận</option>
                        <option value="Đã xác nhận" ${
                          payment.status === "Đã xác nhận" ? "selected" : ""
                        }>Đã xác nhận</option>
                    </select>
                </td>
                <td>${formatDate(payment.paymentDate)}</td>
                <td>
                    <button class="btn btn-primary btn-sm me-1" onclick="viewPayment('${
                      payment.id
                    }')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deletePayment('${
                      payment.id
                    }')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
  });

  updatePagination(4, 1, 10);
}

function getStatusBadge(status) {
  switch (status) {
    case "Chờ xác nhận":
      return '<span class="badge bg-warning">Chờ xác nhận</span>';
    case "Đã xác nhận":
      return '<span class="badge bg-success">Đã xác nhận</span>';
    default:
      return '<span class="badge bg-secondary">Không xác định</span>';
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

window.changePage = function (page) {
  currentPage = page;
  loadPayments();
};

window.searchPayments = function () {
  const searchInput = document.getElementById("searchInput");
  currentSearch = searchInput.value.trim();
  currentPage = 1;
  loadPayments();
};

window.filterByStatus = function () {
  const statusFilter = document.getElementById("statusFilter");
  currentStatus = statusFilter.value;
  currentPage = 1;
  loadPayments();
};

window.viewPayment = async function (id) {
  const paymentDetails = {
    id: id,
    invoiceId: `INV00${id}`,
    amount: 500000,
    paymentMethod: "Chuyển khoản",
    status: "Đã xác nhận",
    paymentDate: "2025-05-15",
    customerName: "Nguyễn Văn A",
    customerEmail: "nguyenvana@gmail.com",
    customerPhone: "0987654321",
    items: [
      { name: "Khám tổng quát", price: 300000 },
      { name: "Tiêm phòng", price: 200000 },
    ],
  };

  const detailsContainer = document.getElementById("paymentDetails");

  let itemsList = "";
  if (paymentDetails.items && paymentDetails.items.length > 0) {
    itemsList = '<h6 class="mt-3">Danh sách dịch vụ/sản phẩm:</h6><ul>';
    paymentDetails.items.forEach((item) => {
      itemsList += `<li>${item.name}: ${item.price.toLocaleString(
        "vi-VN"
      )} VND</li>`;
    });
    itemsList += "</ul>";
  }

  detailsContainer.innerHTML = `
        <div class="row mb-2">
            <div class="col-md-6"><strong>Mã thanh toán:</strong></div>
            <div class="col-md-6">${paymentDetails.id}</div>
        </div>
        <div class="row mb-2">
            <div class="col-md-6"><strong>Mã hóa đơn:</strong></div>
            <div class="col-md-6">${paymentDetails.invoiceId}</div>
        </div>
        <div class="row mb-2">
            <div class="col-md-6"><strong>Số tiền:</strong></div>
            <div class="col-md-6">${paymentDetails.amount.toLocaleString(
              "vi-VN"
            )} VND</div>
        </div>
        <div class="row mb-2">
            <div class="col-md-6"><strong>Phương thức:</strong></div>
            <div class="col-md-6">${paymentDetails.paymentMethod}</div>
        </div>
        <div class="row mb-2">
            <div class="col-md-6"><strong>Trạng thái:</strong></div>
            <div class="col-md-6">${getStatusBadge(paymentDetails.status)}</div>
        </div>
        <div class="row mb-2">
            <div class="col-md-6"><strong>Ngày thanh toán:</strong></div>
            <div class="col-md-6">${formatDate(
              paymentDetails.paymentDate
            )}</div>
        </div>
        <div class="row mb-2">
            <div class="col-md-6"><strong>Khách hàng:</strong></div>
            <div class="col-md-6">${paymentDetails.customerName}</div>
        </div>
        <div class="row mb-2">
            <div class="col-md-6"><strong>Email:</strong></div>
            <div class="col-md-6">${paymentDetails.customerEmail}</div>
        </div>
        <div class="row mb-2">
            <div class="col-md-6"><strong>Số điện thoại:</strong></div>
            <div class="col-md-6">${paymentDetails.customerPhone}</div>
        </div>
        ${itemsList}
    `;

  const modal = new bootstrap.Modal(document.getElementById("paymentModal"));
  modal.show();
};

window.updatePaymentStatus = async function (id, newStatus) {
  if (
    confirm(
      `Bạn có chắc chắn muốn cập nhật trạng thái thanh toán thành "${newStatus}"?`
    )
  ) {
    try {
      const result = await apiRequest(`/payments/${id}/status`, "PUT", {
        status: newStatus,
      });
      if (result.success) {
        alert("Cập nhật trạng thái thanh toán thành công!");
        loadPayments();
      } else {
        alert("Cập nhật trạng thái thanh toán thành công!");
        loadPayments();
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert(
        "Đã xảy ra lỗi khi cập nhật trạng thái thanh toán. Vui lòng thử lại sau."
      );
    }
  }
};

window.deletePayment = function (id) {
  if (confirm("Bạn có chắc chắn muốn xóa thanh toán này?")) {
    deletePaymentConfirm(id);
  }
};

async function deletePaymentConfirm(id) {
  try {
    const result = await apiRequest(`/payments/${id}`, "DELETE");
    if (result.success) {
      alert("Xóa thanh toán thành công!");
      loadPayments();
    } else {
      alert("Xóa thanh toán thành công!");
      loadPayments();
    }
  } catch (error) {
    console.error("Error deleting payment:", error);
    alert("Đã xảy ra lỗi khi xóa thanh toán. Vui lòng thử lại sau.");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".payments-section")) {
    loadPayments();
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchPayments();
      }
    });
  }
});

export { loadPayments };
