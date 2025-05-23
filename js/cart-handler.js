class CartHandler {
  constructor() {
    this.cart = this.loadCart();
  }

  loadCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }

  saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.cart));
  }

  addToCart(product) {
    const existingItemIndex = this.cart.findIndex(
      (item) => item.id === product.id
    );

    if (existingItemIndex > -1) {
      this.cart[existingItemIndex].quantity += product.quantity;
    } else {
      this.cart.push(product);
    }

    this.saveCart();
    this.updateCartBadge();
    return true;
  }

  updateCartBadge() {
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.querySelector(".cart-badge");
    if (cartBadge) {
      cartBadge.textContent = totalItems;
      cartBadge.style.display = totalItems > 0 ? "block" : "none";
    }
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter((item) => item.id !== productId);
    this.saveCart();
    this.updateCartBadge();
  }

  updateQuantity(productId, quantity) {
    const item = this.cart.find((item) => item.id === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        this.saveCart();
      }
    }
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartBadge();
  }

  getTotal() {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}

const cartHandler = new CartHandler();
