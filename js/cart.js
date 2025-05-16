import { apiRequest, showMessage } from './utils.js';

async function loadCart() {
    const result = await apiRequest('/cart');
    if (result.success) {
        const cartItems = document.getElementById('cartItems');
        let total = 0;
        cartItems.innerHTML = '';
        result.data.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            cartItems.innerHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.price} VND</td>
                    <td>${item.quantity}</td>
                    <td>${itemTotal} VND</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item.id}')">Xóa</button>
                    </td>
                </tr>
            `;
        });
        document.getElementById('totalPrice').textContent = total;
    }
}

async function removeFromCart(itemId) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
        const result = await apiRequest(`/cart/${itemId}`, 'DELETE');
        if (result.success) loadCart();
    }
}

async function checkout() {
    const result = await apiRequest('/checkout', 'POST');
    if (result.success) {
        showMessage('message', 'Thanh toán thành công! Đơn hàng đã được tạo.', true);
        setTimeout(() => window.location.href = 'orders.html', 2000);
    } else {
        showMessage('message', result.message || 'Thanh toán thất bại');
    }
}

loadCart();