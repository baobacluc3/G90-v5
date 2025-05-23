function initializeProduct(productId, productName, productPrice, productImage) {
  const productInfo = {
    id: productId,
    name: productName,
    price: productPrice,
    image: productImage,
  };

  window.decreaseQuantity = function () {
    const input = document.getElementById("quantity");
    const value = parseInt(input.value);
    if (value > 1) {
      input.value = value - 1;
    }
  };

  window.increaseQuantity = function () {
    const input = document.getElementById("quantity");
    const value = parseInt(input.value);
    input.value = value + 1;
  };

  window.addToCart = function () {
    const quantity = parseInt(document.getElementById("quantity").value);

    const product = {
      ...productInfo,
      quantity: quantity,
    };

    if (cartHandler.addToCart(product)) {
      showNotification(
        "Đã thêm " + quantity + " sản phẩm vào giỏ hàng!",
        "success"
      );
      document.getElementById("quantity").value = 1;
    }
  };

  window.buyNow = function () {
    const quantity = parseInt(document.getElementById("quantity").value);

    const product = {
      ...productInfo,
      quantity: quantity,
    };

    cartHandler.clearCart();
    cartHandler.addToCart(product);
    window.location.href = "/pages/user/cart.html";
  };

  document.addEventListener("DOMContentLoaded", function () {
    cartHandler.updateCartBadge();
  });
}
window.showNotification = function (message, type = "info") {
  const alertClass =
    {
      success: "alert-success",
      error: "alert-danger",
      warning: "alert-warning",
      info: "alert-info",
    }[type] || "alert-info";

  const notification = document.createElement("div");
  notification.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
  notification.style.cssText =
    "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
};
