import { apiRequest } from './api.js';

async function loadChatbotConfig() {
    const result = await apiRequest('/chatbot/config');
    if (result.success) {
        document.getElementById('chatbotStatus').value = result.data.status;
        document.getElementById('welcomeMessage').value = result.data.welcomeMessage;
    }
}

document.getElementById('chatbotForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('chatbotStatus').value;
    const welcomeMessage = document.getElementById('welcomeMessage').value;

    const result = await apiRequest('/chatbot/config', 'PUT', { status, welcomeMessage });
    if (result.success) {
        alert('Cấu hình chatbot đã được cập nhật!');
    }
});

loadChatbotConfig();