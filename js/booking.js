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

function showMessage(elementId, message, isSuccess = false) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.className = `text-${
      isSuccess ? "success" : "danger"
    } mt-3 text-center`;
    element.style.display = "block";
  }
}

async function loadPets() {
  const result = await apiRequest("/pets");
  if (result.success) {
    const petSelect = document.getElementById("petSelect");
    result.data.forEach((pet) => {
      const option = document.createElement("option");
      option.value = pet.id;
      option.textContent = pet.name;
      petSelect.appendChild(option);
    });
  }
}

async function loadServices() {
  const result = await apiRequest("/services");
  if (result.success) {
    const serviceSelect = document.getElementById("serviceSelect");
    result.data.forEach((service) => {
      const option = document.createElement("option");
      option.value = service.id;
      option.textContent = service.name;
      serviceSelect.appendChild(option);
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fullName = document.getElementById("fullName").value;
      const phoneNumber = document.getElementById("phoneNumber").value;
      const service = document.getElementById("serviceSelect").value;
      const branch = document.getElementById("branchSelect").value;
      const petName = document.getElementById("petName").value;
      const date = document.getElementById("date").value;
      const time = document.getElementById("time").value;
      const notes = document.getElementById("notes").value;

      if (
        !fullName ||
        !phoneNumber ||
        !service ||
        !branch ||
        !petName ||
        !date ||
        !time
      ) {
        showMessage("message", "Vui lòng điền đầy đủ thông tin bắt buộc!");
        return;
      }

      const bookingData = {
        hoTen: fullName,
        soDienThoai: phoneNumber,
        dichVu: service,
        chiNhanh: branch,
        tenThuCung: petName,
        ngay: date,
        gio: time,
        ghiChu: notes || "",
      };

      try {
        const result = await apiRequest("/appointments", "POST", bookingData);

        if (result.success) {
          showMessage("message", "Đặt lịch thành công!", true);
          bookingForm.reset();

          setTimeout(() => {
            if (typeof openModal === "function") {
              openModal(
                "Đặt Lịch Thành Công",
                `Đã đặt lịch ${service} tại ${branch} vào ${date} lúc ${time} cho thú cưng ${petName}.`,
                function () {
                  window.location.reload();
                }
              );
            }
          }, 1000);
        } else {
          showMessage(
            "message",
            result.message || "Đặt lịch thất bại. Vui lòng thử lại."
          );
        }
      } catch (error) {
        console.error("Booking error:", error);
        showMessage("message", "Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    });
  }

  loadPets();
  loadServices();
});
