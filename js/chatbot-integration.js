(function () {
  "use strict";

  const CHATBOT_CONFIG = {
    apiUrl: "/api/chatbot",
    widgetPosition: "bottom-right",
    primaryColor: "#4e85fd",
    showWelcomeMessage: true,
    autoOpen: false,
    enableSound: true,
  };

  const WIDGET_CSS = `
        .petcare-chatbot-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            font-family: 'Poppins', sans-serif;
        }
        
        .petcare-widget-toggle {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, ${CHATBOT_CONFIG.primaryColor}, #667eea);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(78, 133, 253, 0.4);
            transition: all 0.3s ease;
            position: relative;
            border: none;
        }
        
        .petcare-widget-toggle:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 25px rgba(78, 133, 253, 0.6);
        }
        
        .petcare-widget-toggle i {
            color: white;
            font-size: 24px;
        }
        
        .petcare-notification-dot {
            position: absolute;
            top: -2px;
            right: -2px;
            width: 20px;
            height: 20px;
            background: #ff4757;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: white;
            font-weight: 600;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .petcare-widget-chat {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.2);
            display: none;
            flex-direction: column;
            overflow: hidden;
            animation: slideUp 0.3s ease;
        }
        
        .petcare-widget-chat.show {
            display: flex;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .petcare-widget-header {
            background: linear-gradient(135deg, ${CHATBOT_CONFIG.primaryColor}, #667eea);
            color: white;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .petcare-widget-bot-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .petcare-widget-bot-info img {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.3);
        }
        
        .petcare-widget-bot-info h6 {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
        }
        
        .petcare-widget-bot-info .status {
            font-size: 12px;
            opacity: 0.8;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .petcare-status-dot {
            width: 8px;
            height: 8px;
            background: #28a745;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        .petcare-widget-close {
            background: none;
            border: none;
            color: white;
            font-size: 16px;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s ease;
        }
        
        .petcare-widget-close:hover {
            background: rgba(255,255,255,0.2);
        }
        
        .petcare-widget-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background: #f8f9fa;
        }
        
        .petcare-widget-message {
            margin-bottom: 12px;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .petcare-bot-message {
            background: white;
            padding: 10px 12px;
            border-radius: 12px;
            border-left: 4px solid ${CHATBOT_CONFIG.primaryColor};
            font-size: 14px;
            line-height: 1.4;
            margin-right: 50px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .petcare-user-message {
            background: ${CHATBOT_CONFIG.primaryColor};
            color: white;
            padding: 10px 12px;
            border-radius: 12px;
            font-size: 14px;
            margin-left: 50px;
            text-align: right;
        }
        
        .petcare-widget-quick-buttons {
            display: flex;
            gap: 5px;
            padding: 10px 15px;
            background: white;
            border-top: 1px solid #e9ecef;
            overflow-x: auto;
        }
        
        .petcare-quick-btn {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 20px;
            padding: 6px 12px;
            font-size: 12px;
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.2s ease;
            color: #495057;
        }
        
        .petcare-quick-btn:hover {
            background: ${CHATBOT_CONFIG.primaryColor};
            color: white;
            border-color: ${CHATBOT_CONFIG.primaryColor};
            transform: translateY(-1px);
        }
        
        .petcare-widget-input {
            display: flex;
            padding: 15px;
            background: white;
            border-top: 1px solid #e9ecef;
            gap: 10px;
        }
        
        .petcare-widget-input input {
            flex: 1;
            border: 1px solid #dee2e6;
            border-radius: 20px;
            padding: 8px 15px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s ease;
        }
        
        .petcare-widget-input input:focus {
            border-color: ${CHATBOT_CONFIG.primaryColor};
            box-shadow: 0 0 0 3px rgba(78, 133, 253, 0.1);
        }
        
        .petcare-send-btn {
            width: 35px;
            height: 35px;
            background: ${CHATBOT_CONFIG.primaryColor};
            border: none;
            border-radius: 50%;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        
        .petcare-send-btn:hover {
            background: #3d71e8;
            transform: scale(1.05);
        }
        
        .petcare-send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        
        .petcare-typing-indicator {
            display: flex;
            gap: 4px;
            padding: 8px 0;
        }
        
        .petcare-typing-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${CHATBOT_CONFIG.primaryColor};
            animation: typing 1.4s infinite ease-in-out;
        }
        
        .petcare-typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .petcare-typing-dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes typing {
            0%, 80%, 100% {
                transform: scale(0);
                opacity: 0.5;
            }
            40% {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        /* Responsive */
        @media (max-width: 480px) {
            .petcare-widget-chat {
                width: calc(100vw - 40px);
                height: calc(100vh - 140px);
                bottom: 80px;
                right: -10px;
            }
            
            .petcare-chatbot-widget {
                bottom: 10px;
                right: 10px;
            }
        }
        
        /* Position variants */
        .petcare-chatbot-widget.bottom-left {
            left: 20px;
            right: auto;
        }
        
        .petcare-chatbot-widget.top-right {
            top: 20px;
            bottom: auto;
        }
        
        .petcare-chatbot-widget.top-left {
            top: 20px;
            left: 20px;
            bottom: auto;
            right: auto;
        }
        
        .petcare-chatbot-widget.bottom-left .petcare-widget-chat {
            left: 0;
            right: auto;
        }
        
        .petcare-chatbot-widget.top-right .petcare-widget-chat {
            top: 80px;
            bottom: auto;
        }
        
        .petcare-chatbot-widget.top-left .petcare-widget-chat {
            top: 80px;
            left: 0;
            bottom: auto;
            right: auto;
        }
    `;

  const WIDGET_HTML = `
        <div class="petcare-chatbot-widget ${CHATBOT_CONFIG.widgetPosition}">
            <button class="petcare-widget-toggle" onclick="PetcareChatbot.toggle()">
                <i class="fas fa-comments"></i>
                <span class="petcare-notification-dot">1</span>
            </button>
            
            <div class="petcare-widget-chat" id="petcare-widget-chat">
                <div class="petcare-widget-header">
                    <div class="petcare-widget-bot-info">
                        <img src="/assets/images/chatbot-avatar.png" alt="Petcare Bot" 
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUiIGhlaWdodD0iMzUiIGZpbGw9IiNmZmYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMmM1LjUgMCAxMCA0LjUgMTAgMTBzLTQuNSAxMC0xMCAxMFMyIDE3LjUgMiAxMlM2LjUgMiAxMiAyek05LjUgOWExIDEgMCAwMC0xIDEgMSAxIDAgMDAxIDFoNWExIDEgMCAwMDEtMSAxIDEgMCAwMC0xLTFoLTV6TTkgMTRhMSAxIDAgMDAwIDJoNmExIDEgMCAwMDAtMkg5eiIvPjwvc3ZnPg=='">
                        <div>
                            <h6>Petcare Assistant</h6>
                            <div class="status">
                                <span class="petcare-status-dot"></span>
                                Trực tuyến
                            </div>
                        </div>
                    </div>
                    <button class="petcare-widget-close" onclick="PetcareChatbot.toggle()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="petcare-widget-messages" id="petcare-widget-messages">
                    <div class="petcare-widget-message">
                        <div class="petcare-bot-message">
                            Xin chào! Tôi là trợ lý ảo của Petcare 🐾<br>
                            Tôi có thể giúp bạn tìm hiểu về dịch vụ, đặt lịch khám, và nhiều thông tin hữu ích khác!
                        </div>
                    </div>
                </div>
                
                <div class="petcare-widget-quick-buttons">
                    <button class="petcare-quick-btn" onclick="PetcareChatbot.sendQuickMessage('Đặt lịch khám')">
                        📅 Đặt lịch
                    </button>
                    <button class="petcare-quick-btn" onclick="PetcareChatbot.sendQuickMessage('Xem giá dịch vụ')">
                        💰 Giá cả
                    </button>
                    <button class="petcare-quick-btn" onclick="PetcareChatbot.sendQuickMessage('Địa chỉ chi nhánh')">
                        📍 Địa chỉ
                    </button>
                </div>
                
                <div class="petcare-widget-input">
                    <input type="text" id="petcare-widget-input" placeholder="Nhập tin nhắn..." 
                           onkeypress="PetcareChatbot.handleKeyPress(event)">
                    <button class="petcare-send-btn" onclick="PetcareChatbot.sendMessage()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

  class PetcareChatbotWidget {
    constructor() {
      this.isOpen = false;
      this.messages = [];
      this.isTyping = false;

      this.knowledgeBase = {
        greeting: {
          keywords: ["xin chào", "hello", "hi", "chào"],
          response:
            "Xin chào! Tôi có thể giúp bạn tìm hiểu về:\n• Dịch vụ chăm sóc thú cưng\n• Đặt lịch khám\n• Giá cả dịch vụ\n• Địa chỉ chi nhánh\n\nBạn muốn biết gì ạ?",
        },
        services: {
          keywords: ["dịch vụ", "làm gì", "cung cấp"],
          response:
            "Petcare cung cấp:\n🏥 Khám và điều trị\n💉 Tiêm phòng\n✨ Spa - Grooming\n🔬 Xét nghiệm\n⚕️ Phẫu thuật\n🚗 Dịch vụ vận chuyển",
        },
        booking: {
          keywords: ["đặt lịch", "booking", "hẹn khám"],
          response:
            "Đặt lịch dễ dàng qua:\n📞 Hotline: 0395.560.056\n💻 Website: petcare.vn\n📍 Trực tiếp tại cửa hàng\n\nCần thông tin: Tên, SĐT, tên thú cưng, dịch vụ, thời gian",
        },
        pricing: {
          keywords: ["giá", "chi phí", "tiền", "bao nhiêu"],
          response:
            "💰 Bảng giá tham khảo:\n🏥 Khám: 200k-300k\n💉 Tiêm phòng: 150k-400k\n✨ Spa: 150k-500k\n🔬 Xét nghiệm: 100k-800k\n\nLiên hệ để biết giá chính xác!",
        },
        location: {
          keywords: ["địa chỉ", "ở đâu", "chi nhánh"],
          response:
            "📍 Hệ thống Petcare:\n🏢 Cẩm Lệ: 010 Trần Phước Thành\n📞 0961.555.911\n\n🏢 Hải Châu: 015 Quang Trung\n📞 0862.555.911\n\n🕐 Giờ làm việc: 8:00-20:00",
        },
        contact: {
          keywords: ["liên hệ", "điện thoại", "hotline"],
          response:
            "📞 Liên hệ Petcare:\n☎️ Hotline: 0395.560.056\n📧 Email: PetCare@gmail.com\n🌐 Website: petcare.vn\n\nChúng tôi luôn sẵn sàng hỗ trợ!",
        },
      };

      this.init();
    }

    init() {
      this.loadCSS();
      this.createWidget();
      this.setupEventListeners();

      if (CHATBOT_CONFIG.autoOpen) {
        setTimeout(() => this.toggle(), 2000);
      }
    }

    loadCSS() {
      const style = document.createElement("style");
      style.textContent = WIDGET_CSS;
      document.head.appendChild(style);

      if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement("link");
        fontAwesome.rel = "stylesheet";
        fontAwesome.href =
          "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
        document.head.appendChild(fontAwesome);
      }
    }

    createWidget() {
      const widgetContainer = document.createElement("div");
      widgetContainer.innerHTML = WIDGET_HTML;
      document.body.appendChild(widgetContainer.firstElementChild);
    }

    setupEventListeners() {
      document.addEventListener("click", (e) => {
        const widget = document.querySelector(".petcare-chatbot-widget");
        if (this.isOpen && !widget.contains(e.target)) {
        }
      });
    }

    toggle() {
      const chat = document.getElementById("petcare-widget-chat");
      const dot = document.querySelector(".petcare-notification-dot");

      this.isOpen = !this.isOpen;

      if (this.isOpen) {
        chat.classList.add("show");
        if (dot) dot.style.display = "none";

        if (CHATBOT_CONFIG.enableSound) {
          this.playNotificationSound();
        }
      } else {
        chat.classList.remove("show");
      }
    }

    sendMessage(text) {
      const input = document.getElementById("petcare-widget-input");
      const message = text || input.value.trim();

      if (!message || this.isTyping) return;

      if (!text) input.value = "";

      this.addMessage(message, "user");

      this.generateResponse(message);
    }

    sendQuickMessage(message) {
      this.sendMessage(message);
    }

    addMessage(text, sender) {
      const messagesContainer = document.getElementById(
        "petcare-widget-messages"
      );
      const messageDiv = document.createElement("div");
      messageDiv.className = "petcare-widget-message";

      const messageContent = document.createElement("div");
      messageContent.className = `petcare-${sender}-message`;
      messageContent.innerHTML = this.formatMessage(text);

      messageDiv.appendChild(messageContent);
      messagesContainer.appendChild(messageDiv);

      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      this.messages.push({ text, sender, timestamp: Date.now() });
    }

    generateResponse(message) {
      this.showTyping();

      setTimeout(() => {
        this.hideTyping();
        const response = this.getResponse(message.toLowerCase());
        this.addMessage(response, "bot");

        if (CHATBOT_CONFIG.enableSound) {
          this.playMessageSound();
        }
      }, 1000 + Math.random() * 1000);
    }

    getResponse(message) {
      for (const [key, data] of Object.entries(this.knowledgeBase)) {
        for (const keyword of data.keywords) {
          if (message.includes(keyword)) {
            return data.response;
          }
        }
      }

      return "Xin lỗi, tôi chưa hiểu câu hỏi. Vui lòng liên hệ:\n📞 Hotline: 0395.560.056\n📧 Email: PetCare@gmail.com\n\nHoặc hỏi tôi về: dịch vụ, giá cả, địa chỉ, đặt lịch...";
    }

    showTyping() {
      this.isTyping = true;
      const messagesContainer = document.getElementById(
        "petcare-widget-messages"
      );

      const typingDiv = document.createElement("div");
      typingDiv.className = "petcare-widget-message petcare-typing-message";
      typingDiv.innerHTML = `
                <div class="petcare-bot-message">
                    <div class="petcare-typing-indicator">
                        <div class="petcare-typing-dot"></div>
                        <div class="petcare-typing-dot"></div>
                        <div class="petcare-typing-dot"></div>
                    </div>
                </div>
            `;

      messagesContainer.appendChild(typingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTyping() {
      this.isTyping = false;
      const typingMessage = document.querySelector(".petcare-typing-message");
      if (typingMessage) {
        typingMessage.remove();
      }
    }

    formatMessage(text) {
      return text
        .replace(/\n/g, "<br>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");
    }

    handleKeyPress(event) {
      if (event.key === "Enter") {
        this.sendMessage();
      }
    }

    playNotificationSound() {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApLn+DyvmwhBjiUz+rYayEFoY2Y9SYHF"
      );
      audio.volume = 0.1;
      audio.play().catch(() => {});
    }

    playMessageSound() {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj"
      );
      audio.volume = 0.05;
      audio.play().catch(() => {});
    }
  }

  function initChatbot() {
    if (window.PetcareChatbot) return;

    window.PetcareChatbot = new PetcareChatbotWidget();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChatbot);
  } else {
    initChatbot();
  }
})();
