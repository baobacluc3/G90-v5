import { apiRequest } from './api.js';

document.getElementById('chatForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = document.getElementById('chatInput').value;
    appendMessage('Bạn', message);

    const result = await apiRequest('/chatbot/support', 'POST', { message });
    if (result.success) {
        appendMessage('Chatbot', result.response);
    } else {
        appendMessage('Chatbot', 'Xin lỗi, tôi không thể trả lời ngay bây giờ.');
    }

    document.getElementById('chatInput').value = '';
});

function appendMessage(sender, text) {
    const chatbox = document.getElementById('chatbox');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `${sender}: ${text}`;
    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}