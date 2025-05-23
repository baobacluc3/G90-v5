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
let currentCategory = "";
const itemsPerPage = 10;

async function loadInventory() {
  const searchQuery = currentSearch
    ? `&search=${encodeURIComponent(currentSearch)}`
    : "";
  const categoryQuery = currentCategory ? `&category=${currentCategory}` : "";
  const result = await apiRequest(
    `/inventory?page=${currentPage}&limit=${itemsPerPage}${searchQuery}${categoryQuery}`
  );

  if (result.success) {
    const inventoryList = document.getElementById("inventoryList");
    inventoryList.innerHTML = "";

    result.data.forEach((item) => {
      const statusBadge = getStatusBadge(item.TrangThai);
      const lowStockWarning = item.SoLuong < 10 ? "table-warning" : "";

      inventoryList.innerHTML += `
                <tr class="${lowStockWarning}">
                    <td>${item.ID_SanPham}</td>
                    <td>${item.TenSP}</td>
                    <td>${item.TenDonMuc || "Chưa phân loại"}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <span class="me-2">${item.SoLuong}</span>
                            ${
                              item.SoLuong < 10
                                ? '<span class="badge bg-warning">Sắp hết</span>'
                                : ""
                            }
                        </div>
                    </td>
                    <td>${formatPrice(item.Gia)}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-primary btn-sm me-1" onclick="viewItem(${
                          item.ID_SanPham
                        })">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-warning btn-sm me-1" onclick="editItem(${
                          item.ID_SanPham
                        })">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-info btn-sm me-1" onclick="updateStock(${
                          item.ID_SanPham
                        })">
                            <i class="fas fa-boxes"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteItem(${
                          item.ID_SanPham
                        })">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
    });

    updatePagination(result.total, result.page, result.limit);

    updateSummaryStats(result.stats);
  }
}

async function loadCategories() {
  const result = await apiRequest("/categories");
  if (result.success) {
    const categorySelects = document.querySelectorAll(
      "#categoryFilter, #itemCategory"
    );
    categorySelects.forEach((select) => {
      const firstOption = select.querySelector("option");
      select.innerHTML = "";
      select.appendChild(firstOption);

      result.data.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.ID_DonMuc;
        option.textContent = category.TenDonMuc;
        select.appendChild(option);
      });
    });
  }
}

function getStatusBadge(status) {
  switch (status) {
    case "Còn hàng":
      return '<span class="badge bg-success">Còn hàng</span>';
    case "Hết hàng":
      return '<span class="badge bg-danger">Hết hàng</span>';
    case "Ngừng kinh doanh":
      return '<span class="badge bg-secondary">Ngừng kinh doanh</span>';
    default:
      return '<span class="badge bg-info">Không xác định</span>';
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
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

function updateSummaryStats(stats) {
  if (stats) {
    document.getElementById("totalItems").textContent = stats.totalItems || 0;
    document.getElementById("lowStockItems").textContent =
      stats.lowStockItems || 0;
    document.getElementById("outOfStockItems").textContent =
      stats.outOfStockItems || 0;
    document.getElementById("totalValue").textContent = formatPrice(
      stats.totalValue || 0
    );
  }
}

window.changePage = function (page) {
  currentPage = page;
  loadInventory();
};

window.searchInventory = function () {
  const searchInput = document.getElementById("searchInput");
  currentSearch = searchInput.value.trim();
  currentPage = 1;
  loadInventory();
};

window.filterByCategory = function () {
  const categoryFilter = document.getElementById("categoryFilter");
  currentCategory = categoryFilter.value;
  currentPage = 1;
  loadInventory();
};

window.viewItem = async function (id) {
  const result = await apiRequest(`/inventory/${id}`);
  if (result.success) {
    const item = result.data;
    const details = `
            Mã sản phẩm: ${item.ID_SanPham}
            Tên sản phẩm: ${item.TenSP}
            Danh mục: ${item.TenDonMuc || "Chưa phân loại"}
            Mô tả: ${item.MoTa || "Không có mô tả"}
            Số lượng: ${item.SoLuong}
            Giá: ${formatPrice(item.Gia)}
            Trạng thái: ${item.TrangThai}
        `;
    alert(details);
  }
};

window.addItem = function () {
  document.getElementById("itemModalLabel").textContent = "Thêm Sản Phẩm";
  document.getElementById("itemForm").reset();
  document.getElementById("itemId").value = "";
  new bootstrap.Modal(document.getElementById("itemModal")).show();
};

window.editItem = async function (id) {
  const result = await apiRequest(`/inventory/${id}`);
  if (result.success) {
    const item = result.data;
    document.getElementById("itemModalLabel").textContent = "Sửa Sản Phẩm";
    document.getElementById("itemId").value = item.ID_SanPham;
    document.getElementById("itemName").value = item.TenSP;
    document.getElementById("itemDescription").value = item.MoTa || "";
    document.getElementById("itemCategory").value = item.ID_DonMuc || "";
    document.getElementById("itemPrice").value = item.Gia;
    document.getElementById("itemQuantity").value = item.SoLuong;
    document.getElementById("itemStatus").value = item.TrangThai;

    new bootstrap.Modal(document.getElementById("itemModal")).show();
  }
};

window.updateStock = async function (id) {
  const result = await apiRequest(`/inventory/${id}`);
  if (result.success) {
    const item = result.data;
    document.getElementById("stockItemName").textContent = item.TenSP;
    document.getElementById("currentStock").textContent = item.SoLuong;
    document.getElementById("stockItemId").value = item.ID_SanPham;
    document.getElementById("stockChange").value = "";
    document.getElementById("stockNote").value = "";

    new bootstrap.Modal(document.getElementById("stockModal")).show();
  }
};

window.deleteItem = function (id) {
  if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi kho?")) {
    deleteItemConfirm(id);
  }
};

async function deleteItemConfirm(id) {
  const result = await apiRequest(`/inventory/${id}`, "DELETE");
  if (result.success) {
    alert("Xóa sản phẩm thành công!");
    loadInventory();
  } else {
    alert("Lỗi: " + (result.message || "Không thể xóa sản phẩm"));
  }
}

window.exportInventory = async function () {
  const result = await apiRequest("/inventory/export");
  if (result.success) {
    const csvContent = result.data;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kho-hang-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  } else {
    alert("Lỗi xuất dữ liệu: " + result.message);
  }
};

document.addEventListener("DOMContentLoaded", function () {
  loadInventory();
  loadCategories();

  const itemForm = document.getElementById("itemForm");
  if (itemForm) {
    itemForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const itemId = document.getElementById("itemId").value;
      const itemName = document.getElementById("itemName").value;
      const itemDescription = document.getElementById("itemDescription").value;
      const itemCategory = document.getElementById("itemCategory").value;
      const itemPrice = document.getElementById("itemPrice").value;
      const itemQuantity = document.getElementById("itemQuantity").value;
      const itemStatus = document.getElementById("itemStatus").value;

      const itemData = {
        TenSP: itemName,
        MoTa: itemDescription,
        ID_DonMuc: itemCategory || null,
        Gia: parseFloat(itemPrice),
        SoLuong: parseInt(itemQuantity),
        TrangThai: itemStatus,
      };

      let result;
      if (itemId) {
        result = await apiRequest(`/inventory/${itemId}`, "PUT", itemData);
      } else {
        result = await apiRequest("/inventory", "POST", itemData);
      }

      if (result.success) {
        alert(itemId ? "Cập nhật thành công!" : "Thêm sản phẩm thành công!");
        bootstrap.Modal.getInstance(
          document.getElementById("itemModal")
        ).hide();
        loadInventory();
      } else {
        alert("Lỗi: " + (result.message || "Không thể lưu sản phẩm"));
      }
    });
  }

  const stockForm = document.getElementById("stockForm");
  if (stockForm) {
    stockForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const itemId = document.getElementById("stockItemId").value;
      const stockType = document.getElementById("stockType").value;
      const stockChange = parseInt(
        document.getElementById("stockChange").value
      );
      const stockNote = document.getElementById("stockNote").value;

      const stockData = {
        type: stockType,
        change: stockChange,
        note: stockNote,
      };

      const result = await apiRequest(
        `/inventory/${itemId}/stock`,
        "PUT",
        stockData
      );

      if (result.success) {
        alert("Cập nhật tồn kho thành công!");
        bootstrap.Modal.getInstance(
          document.getElementById("stockModal")
        ).hide();
        loadInventory();
      } else {
        alert("Lỗi: " + (result.message || "Không thể cập nhật tồn kho"));
      }
    });
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchInventory();
      }
    });
  }

  const categoryFilter = document.getElementById("categoryFilter");
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterByCategory);
  }
});

export { loadInventory };
