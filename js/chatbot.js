class PetcareChatbot {
  constructor() {
    this.roomId = null;
    this.isOpen = false;
    this.userId = this.getUserId();
    this.init();
  }

  init() {
    this.createChatWidget();
    this.bindEvents();
    this.loadChatHistory();
  }

  getUserId() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.ID_TaiKhoan || null;
  }

  createChatWidget() {
    const widget = document.createElement("div");
    widget.innerHTML = `
      <div id="chatbot-widget" class="chatbot-widget">
        <!-- Chat Toggle Button -->
        <div id="chat-toggle" class="chat-toggle">
          <i class="fas fa-comments"></i>
          <span class="chat-badge" id="chat-badge" style="display: none;">1</span>
        </div>
        
        <!-- Chat Window -->
        <div id="chat-window" class="chat-window" style="display: none;">
          <div class="chat-header">
            <div class="chat-avatar">
              <img src="/assets/images/bot-avatar.png" alt="Bot" onerror="this.style.display='none'">
              <i class="fas fa-robot" style="display: none;"></i>
            </div>
            <div class="chat-info">
              <h5>Trợ lý ảo Petcare</h5>
              <span class="status online">Đang hoạt động</span>
            </div>
            <div class="chat-controls">
              <button id="minimize-chat" class="btn-minimize">
                <i class="fas fa-minus"></i>
              </button>
              <button id="close-chat" class="btn-close">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div class="chat-body" id="chat-messages">
            <div class="message-container">
              <div class="typing-indicator" id="typing-indicator" style="display: none;">
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>Đang nhập...</span>
              </div>
            </div>
          </div>
          
          <div class="quick-actions" id="quick-actions" style="display: none;">
            <!-- Quick action buttons will be inserted here -->
          </div>
          
          <div class="chat-footer">
            <div class="chat-input-container">
              <input 
                type="text" 
                id="chat-input" 
                placeholder="Nhập tin nhắn..." 
                maxlength="500"
              >
              <button id="send-message" class="btn-send">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
            <div class="chat-footer-actions">
              <button id="request-human" class="btn-human" title="Chuyển cho nhân viên">
                <i class="fas fa-user-tie"></i>
              </button>
              <button id="clear-chat" class="btn-clear" title="Xóa cuộc trò chuyện">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(widget);
    this.addChatStyles();
  }

  addChatStyles() {
    if (document.getElementById("chatbot-styles")) return;

    const styles = document.createElement("style");
    styles.id = "chatbot-styles";
    styles.textContent = `
    .chatbot-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: 'Poppins', sans-serif;
    }
    
    .chat-toggle {
      width: 65px;
      height: 65px;
      background: linear-gradient(45deg, #16a085, #1abc9c);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      box-shadow: 0 8px 25px rgba(22, 160, 133, 0.4);
      transition: all 0.3s ease;
      position: relative;
      border: 3px solid rgba(255, 255, 255, 0.2);
    }
    
    .chat-toggle:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 12px 35px rgba(22, 160, 133, 0.5);
    }
    
    .chat-toggle i {
      font-size: 26px;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    .chat-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: linear-gradient(45deg, #e74c3c, #c0392b);
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      border: 2px solid white;
      animation: bounce 1s infinite;
    }
    
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
      40%, 43% { transform: translate3d(0,-8px,0); }
      70% { transform: translate3d(0,-4px,0); }
      90% { transform: translate3d(0,-2px,0); }
    }
    
    .chat-window {
      position: absolute;
      bottom: 85px;
      right: 0;
      width: 380px;
      height: 550px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 15px 50px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid rgba(22, 160, 133, 0.1);
      animation: slideUp 0.3s ease-out;
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    .chat-header {
      background: linear-gradient(135deg, #1a3c34 0%, #2d4a5e 100%);
      color: white;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
      overflow: hidden;
    }
    
    .chat-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="paw" patternUnits="userSpaceOnUse" width="20" height="20"><circle cx="4" cy="4" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="8" cy="2" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="12" cy="4" r="1" fill="rgba(255,255,255,0.1)"/><ellipse cx="8" cy="8" rx="2" ry="3" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23paw)"/></svg>');
      opacity: 0.3;
    }
    
    .chat-avatar {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background: linear-gradient(45deg, #16a085, #1abc9c);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 2px solid rgba(255,255,255,0.3);
      position: relative;
      z-index: 1;
    }
    
    .chat-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .chat-avatar i {
      font-size: 22px;
      color: white;
    }
    
    .chat-info {
      flex: 1;
      position: relative;
      z-index: 1;
    }
    
    .chat-info h5 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .status {
      font-size: 13px;
      opacity: 0.9;
      display: flex;
      align-items: center;
    }
    
    .status.online:before {
      content: '';
      width: 8px;
      height: 8px;
      background: #2ed573;
      border-radius: 50%;
      margin-right: 6px;
      animation: pulse-dot 2s infinite;
    }
    
    @keyframes pulse-dot {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
      100% { opacity: 1; transform: scale(1); }
    }
    
    .chat-controls {
      display: flex;
      gap: 8px;
      position: relative;
      z-index: 1;
    }
    
    .btn-minimize, .btn-close {
      background: rgba(255,255,255,0.15);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      backdrop-filter: blur(10px);
    }
    
    .btn-minimize:hover {
      background: rgba(255,255,255,0.25);
      transform: scale(1.1);
    }
    
    .btn-close:hover {
      background: rgba(231, 76, 60, 0.8);
      transform: scale(1.1);
    }
    
    .chat-body {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      position: relative;
    }
    
    .chat-body::-webkit-scrollbar {
      width: 6px;
    }
    
    .chat-body::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.05);
      border-radius: 10px;
    }
    
    .chat-body::-webkit-scrollbar-thumb {
      background: linear-gradient(45deg, #16a085, #1abc9c);
      border-radius: 10px;
    }
    
    .message {
      margin-bottom: 20px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      animation: fadeInUp 0.3s ease-out;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .message.user {
      flex-direction: row-reverse;
    }
    
    .message-avatar {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
      border: 2px solid rgba(255,255,255,0.5);
    }
    
    .message.bot .message-avatar {
      background: linear-gradient(45deg, #16a085, #1abc9c);
      color: white;
    }
    
    .message.user .message-avatar {
      background: linear-gradient(45deg, #3498db, #2980b9);
      color: white;
    }
    
    .message-content {
      max-width: 75%;
      padding: 12px 18px;
      border-radius: 20px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
      position: relative;
    }
    
    .message.bot .message-content {
      background: white;
      color: #2d4a5e;
      border-bottom-left-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: 1px solid rgba(22, 160, 133, 0.1);
    }
    
    .message.bot .message-content::before {
      content: '';
      position: absolute;
      left: -8px;
      top: 15px;
      width: 0;
      height: 0;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      border-right: 8px solid white;
    }
    
    .message.user .message-content {
      background: linear-gradient(45deg, #3498db, #2980b9);
      color: white;
      border-bottom-right-radius: 8px;
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
    }
    
    .message.user .message-content::before {
      content: '';
      position: absolute;
      right: -8px;
      top: 15px;
      width: 0;
      height: 0;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      border-left: 8px solid #3498db;
    }
    
    .message-time {
      font-size: 11px;
      opacity: 0.6;
      margin-top: 6px;
      text-align: center;
    }
    
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 15px;
      color: #16a085;
      font-size: 13px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 15px;
      width: fit-content;
    }
    
    .typing-dots {
      display: flex;
      gap: 4px;
    }
    
    .typing-dots span {
      width: 8px;
      height: 8px;
      background: #16a085;
      border-radius: 50%;
      animation: typing 1.5s infinite;
    }
    
    .typing-dots span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .typing-dots span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes typing {
      0%, 60%, 100% {
        transform: scale(1);
        opacity: 0.5;
      }
      30% {
        transform: scale(1.3);
        opacity: 1;
      }
    }
    
    .quick-actions {
      padding: 15px 20px;
      background: white;
      border-top: 1px solid rgba(22, 160, 133, 0.1);
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .quick-action-btn {
      background: linear-gradient(45deg, #ecf0f1, #bdc3c7);
      border: none;
      padding: 10px 16px;
      border-radius: 20px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #2d4a5e;
      font-weight: 500;
      border: 1px solid rgba(22, 160, 133, 0.2);
    }
    
    .quick-action-btn:hover {
      background: linear-gradient(45deg, #16a085, #1abc9c);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(22, 160, 133, 0.3);
    }
    
    .chat-footer {
      background: white;
      border-top: 1px solid rgba(22, 160, 133, 0.1);
      padding: 20px;
    }
    
    .chat-input-container {
      display: flex;
      gap: 12px;
      margin-bottom: 15px;
      position: relative;
    }
    
    #chat-input {
      flex: 1;
      border: 2px solid #ecf0f1;
      border-radius: 25px;
      padding: 12px 20px;
      font-size: 14px;
      outline: none;
      transition: all 0.3s ease;
      font-family: 'Poppins', sans-serif;
      background: #f8f9fa;
    }
    
    #chat-input:focus {
      border-color: #16a085;
      background: white;
      box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.1);
    }
    
    #chat-input::placeholder {
      color: #95a5a6;
    }
    
    .btn-send {
      width: 45px;
      height: 45px;
      background: linear-gradient(45deg, #16a085, #1abc9c);
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      font-size: 16px;
    }
    
    .btn-send:hover {
      background: linear-gradient(45deg, #138d75, #17a2b8);
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(22, 160, 133, 0.4);
    }
    
    .btn-send:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    .chat-footer-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .footer-left-actions, .footer-right-actions {
      display: flex;
      gap: 12px;
    }
    
    .btn-human, .btn-clear, .btn-voice, .btn-attachment {
      background: none;
      border: none;
      color: #7f8c8d;
      cursor: pointer;
      font-size: 16px;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.2s;
      position: relative;
    }
    
    .btn-human:hover {
      color: #27ae60;
      background: rgba(39, 174, 96, 0.1);
      transform: scale(1.1);
    }
    
    .btn-clear:hover {
      color: #e74c3c;
      background: rgba(231, 76, 60, 0.1);
      transform: scale(1.1);
    }
    
    .btn-voice:hover {
      color: #f39c12;
      background: rgba(243, 156, 18, 0.1);
      transform: scale(1.1);
    }
    
    .btn-attachment:hover {
      color: #9b59b6;
      background: rgba(155, 89, 182, 0.1);
      transform: scale(1.1);
    }
    
    .recording {
      color: #e74c3c !important;
      animation: pulse-recording 1s infinite;
    }
    
    @keyframes pulse-recording {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    
    /* File upload styles */
    .file-upload-area {
      display: none;
      border: 2px dashed #16a085;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
      margin-bottom: 15px;
      background: rgba(22, 160, 133, 0.05);
      transition: all 0.3s ease;
    }
    
    .file-upload-area.dragover {
      background: rgba(22, 160, 133, 0.1);
      border-color: #1abc9c;
    }
    
    /* Powered by */
    .chat-powered {
      text-align: center;
      font-size: 11px;
      color: #95a5a6;
      margin-top: 8px;
    }
    
    /* Mobile responsive */
    @media (max-width: 480px) {
      .chat-window {
        width: calc(100vw - 20px);
        height: calc(100vh - 100px);
        right: 10px;
        bottom: 80px;
      }
      
      .chat-toggle {
        width: 55px;
        height: 55px;
        bottom: 15px;
        right: 15px;
      }
      
      .chat-toggle i {
        font-size: 22px;
      }
      
      .message-content {
        max-width: 85%;
      }
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .chat-window {
        background: #2c3e50;
        border: 1px solid #34495e;
      }
      
      .chat-body {
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      }
      
      .message.bot .message-content {
        background: #34495e;
        color: #ecf0f1;
        border: 1px solid #4a5f7a;
      }
      
      .chat-footer {
        background: #34495e;
        border-top: 1px solid #4a5f7a;
      }
      
      #chat-input {
        background: #2c3e50;
        border-color: #4a5f7a;
        color: #ecf0f1;
      }
      
      #chat-input:focus {
        background: #34495e;
      }
    }
  `;

    document.head.appendChild(styles);
  }

  bindEvents() {
    document.getElementById("chat-toggle").addEventListener("click", () => {
      this.toggleChat();
    });

    document.getElementById("close-chat").addEventListener("click", () => {
      this.closeChat();
    });

    document.getElementById("minimize-chat").addEventListener("click", () => {
      this.minimizeChat();
    });

    document.getElementById("send-message").addEventListener("click", () => {
      this.sendMessage();
    });

    document.getElementById("chat-input").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.sendMessage();
      }
    });

    document.getElementById("request-human").addEventListener("click", () => {
      this.requestHumanSupport();
    });

    document.getElementById("clear-chat").addEventListener("click", () => {
      this.clearChat();
    });
  }

  async toggleChat() {
    const chatWindow = document.getElementById("chat-window");
    const chatBadge = document.getElementById("chat-badge");

    if (this.isOpen) {
      chatWindow.style.display = "none";
      this.isOpen = false;
    } else {
      chatWindow.style.display = "flex";
      this.isOpen = true;
      chatBadge.style.display = "none";

      if (!this.roomId) {
        await this.startChatSession();
      }

      document.getElementById("chat-input").focus();
    }
  }

  closeChat() {
    document.getElementById("chat-window").style.display = "none";
    this.isOpen = false;
  }

  minimizeChat() {
    this.closeChat();
  }

  async startChatSession() {
    try {
      const response = await fetch("/api/chatbot/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: this.userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        this.roomId = data.roomId;
        this.displayMessage(data.message, "bot");
        localStorage.setItem("chatbot_room_id", this.roomId);
      }
    } catch (error) {
      console.error("Error starting chat session:", error);
      this.displayMessage(
        "Xin lỗi, có lỗi xảy ra khi kết nối. Vui lòng thử lại sau.",
        "bot"
      );
    }
  }

  async loadChatHistory() {
    const savedRoomId = localStorage.getItem("chatbot_room_id");
    if (savedRoomId) {
      this.roomId = savedRoomId;

      try {
        const response = await fetch(`/api/chatbot/history/${this.roomId}`);
        const data = await response.json();

        if (data.success && data.messages.length > 0) {
          data.messages.forEach((msg) => {
            this.displayMessage(msg.content, msg.sender, msg.timestamp);
          });
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    }
  }

  async sendMessage() {
    const input = document.getElementById("chat-input");
    const message = input.value.trim();

    if (!message) return;

    this.displayMessage(message, "user");
    input.value = "";

    this.showTyping();

    try {
      const response = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: this.roomId,
          message: message,
          userId: this.userId,
        }),
      });

      const data = await response.json();

      this.hideTyping();

      if (data.success) {
        setTimeout(() => {
          this.displayMessage(data.response, "bot");

          if (data.quickActions && data.quickActions.length > 0) {
            this.showQuickActions(data.quickActions);
          }
        }, 500);
      } else {
        this.displayMessage("Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.", "bot");
      }
    } catch (error) {
      this.hideTyping();
      console.error("Error sending message:", error);
      this.displayMessage(
        "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        "bot"
      );
    }
  }

  displayMessage(content, sender, timestamp = null) {
    const messagesContainer = document.getElementById("chat-messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;

    const time =
      timestamp ||
      new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });

    const avatar =
      sender === "bot"
        ? '<i class="fas fa-robot"></i>'
        : '<i class="fas fa-user"></i>';

    messageDiv.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div>
        <div class="message-content">${this.formatMessage(content)}</div>
        <div class="message-time">${time}</div>
      </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  formatMessage(content) {
    content = content.replace(/\n/g, "<br>");

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    content = content.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');

    const phoneRegex = /(\d{10,11})/g;
    content = content.replace(phoneRegex, '<a href="tel:$1">$1</a>');

    return content;
  }

  showTyping() {
    document.getElementById("typing-indicator").style.display = "flex";
    const messagesContainer = document.getElementById("chat-messages");
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTyping() {
    document.getElementById("typing-indicator").style.display = "none";
  }

  showQuickActions(actions) {
    const quickActionsContainer = document.getElementById("quick-actions");
    quickActionsContainer.innerHTML = "";

    actions.forEach((action) => {
      const button = document.createElement("button");
      button.className = "quick-action-btn";
      button.textContent = action.text;
      button.addEventListener("click", () => {
        this.handleQuickAction(action.action, action.text);
      });
      quickActionsContainer.appendChild(button);
    });

    quickActionsContainer.style.display = "flex";

    setTimeout(() => {
      quickActionsContainer.style.display = "none";
    }, 30000);
  }

  async handleQuickAction(action, text) {
    document.getElementById("quick-actions").style.display = "none";

    document.getElementById("chat-input").value = text;
    await this.sendMessage();
  }

  async requestHumanSupport() {
    if (!this.roomId) {
      alert("Vui lòng bắt đầu cuộc trò chuyện trước.");
      return;
    }

    const issue = prompt("Vui lòng mô tả vấn đề bạn cần hỗ trợ:");
    if (!issue) return;

    try {
      const response = await fetch("/api/chatbot/request-human", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: this.roomId,
          userId: this.userId,
          issue: issue,
        }),
      });

      const data = await response.json();

      if (data.success) {
        this.displayMessage(data.message, "bot");
      }
    } catch (error) {
      console.error("Error requesting human support:", error);
      this.displayMessage(
        "Không thể kết nối nhân viên hỗ trợ. Vui lòng gọi hotline: 0395560056",
        "bot"
      );
    }
  }

  clearChat() {
    if (confirm("Bạn có chắc muốn xóa toàn bộ cuộc trò chuyện?")) {
      document.getElementById("chat-messages").innerHTML = `
        <div class="message-container">
          <div class="typing-indicator" id="typing-indicator" style="display: none;">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Đang nhập...</span>
          </div>
        </div>
      `;

      this.roomId = null;
      localStorage.removeItem("chatbot_room_id");
      this.startChatSession();
    }
  }

  showNotification() {
    if (!this.isOpen) {
      document.getElementById("chat-badge").style.display = "flex";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.petcareChatbot = new PetcareChatbot();
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = PetcareChatbot;
}
