import { apiRequest, showMessage } from "./utils.js";
function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItemsContainer = document.getElementById("cartItems");

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5">
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <h4>Giỏ hàng trống</h4>
                        <p class="text-muted">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                        <a href="../user/food.html" class="btn btn-primary mt-3">
                            <i class="fas fa-shopping-bag me-2"></i>Tiếp tục mua sắm
                        </a>
                    </div>
                </td>
            </tr>
        `;
    return;
  }

  let total = 0;
  cartItemsContainer.innerHTML = "";

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
  });
}

document.addEventListener("DOMContentLoaded", loadCart);
