function checkAuthAndRedirect() {
    const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
    
    if (!currentUser && !window.location.pathname.includes('/auth/')) {
        window.location.href = '/pages/auth/login.html';
        return false;
    }
    
    if (currentUser && window.location.pathname.includes('/auth/')) {
        if (currentUser.role === 'admin') {
            window.location.href = '/pages/admin/project.html';
        } else {
            window.location.href = '/pages/home.html';
        }
        return false;
    }
    
    return true;
}

function getCurrentUser() {
    const userStr = localStorage.getItem('loggedInUser');
    return userStr ? JSON.parse(userStr) : null;
}

function updateUserInfo(userInfo) {
    localStorage.setItem('loggedInUser', JSON.stringify(userInfo));
}

function logout() {
    localStorage.removeItem('loggedInUser');
    sessionStorage.clear();
    window.location.href = '/pages/auth/login.html';
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    return re.test(phone);
}

function showLoading(element, text = 'Đang xử lý...') {
    if (element) {
        element.disabled = true;
        element.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    }
}

function hideLoading(element, originalText) {
    if (element) {
        element.disabled = false;
        element.innerHTML = originalText;
    }
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

function createToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(container);
    }
    return container;
}

function showMessage(elementId, message, isSuccess = false) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = `alert ${isSuccess ? 'alert-success' : 'alert-danger'} mt-3 text-center`;
        element.style.display = 'block';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndRedirect();
    
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    const currentUser = getCurrentUser();
    if (currentUser) {
        const nameFields = document.querySelectorAll('input[type="text"][placeholder*="tên"], input[type="text"][placeholder*="Tên"]');
        nameFields.forEach(field => {
            if (!field.value && field.id !== 'petName' && field.id !== 'tenThuCung') {
                field.value = currentUser.HoTen || '';
            }
        });
        
        const phoneFields = document.querySelectorAll('input[type="tel"], input[placeholder*="điện thoại"], input[placeholder*="Điện thoại"]');
        phoneFields.forEach(field => {
            if (!field.value) {
                field.value = currentUser.DienThoai || '';
            }
        });
        
        const emailFields = document.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            if (!field.value) {
                field.value = currentUser.Gmail || '';
            }
        });
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkAuthAndRedirect,
        getCurrentUser,
        updateUserInfo,
        logout,
        formatDate,
        formatDateTime,
        formatCurrency,
        validateEmail,
        validatePhone,
        showLoading,
        hideLoading,
        showToast,
        showMessage,
        debounce
    };
}