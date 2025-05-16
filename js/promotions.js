import { apiRequest } from './api.js';

async function loadPromotions() {
    const result = await apiRequest('/promotions');
    if (result.success) {
        const promotionList = document.getElementById('promotionList');
        promotionList.innerHTML = '';
        result.data.forEach(promo => {
            promotionList.innerHTML += `
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <img src="${promo.image || '../../assets/images/pet-icon.png'}" class="card-img-top" alt="${promo.name}">
                        <div class="card-body">
                            <h5 class="card-title">${promo.name}</h5>
                            <p class="card-text">${promo.description}</p>
                            <p class="card-text"><strong>Thời gian:</strong> ${promo.startDate} - ${promo.endDate}</p>
                            <button class="btn btn-primary" onclick="applyPromotion('${promo.id}')">Áp Dụng</button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
}

function applyPromotion(promoId) {
    alert(`Áp dụng khuyến mãi ID: ${promoId}`);
    // Logic áp dụng khuyến mãi vào giỏ hàng có thể thêm sau
}

loadPromotions();