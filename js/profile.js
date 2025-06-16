import { showMessage } from './utils.js';

async function apiRequest(endpoint, method = "GET", data = null) {
  const options = { method, headers: { "Content-Type": "application/json" } };
  if (data) options.body = JSON.stringify(data);
  const response = await fetch(`/api${endpoint}`, options);
  return response.json();
}

function getCurrentUser() {
  const str = localStorage.getItem("loggedInUser");
  return str ? JSON.parse(str) : null;
}

async function loadProfile() {
  const user = getCurrentUser();
  if (!user) return;
  const result = await apiRequest(`/profile?id=${user.ID_TaiKhoan}`);
  if (result.success) {
    document.getElementById("name").value = result.data.name;
    document.getElementById("email").value = result.data.email;
    document.getElementById("phone").value = result.data.phone || "";
  }
}

document.getElementById("profileForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user) return;
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;

  const result = await apiRequest("/profile", "PUT", {
    id: user.ID_TaiKhoan,
    name,
    phone,
  });
  if (result.success) {
    showMessage("message", "Cập nhật thông tin thành công!", true);
  } else {
    showMessage("message", result.message || "Cập nhật thất bại");
  }
});

loadProfile();
