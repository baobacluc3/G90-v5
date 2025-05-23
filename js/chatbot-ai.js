// chatbot-ai.js
class PetcareChatbot {
  constructor() {
    this.messageInput = document.getElementById("messageInput");
    this.chatMessages = document.getElementById("chatMessages");
    this.suggestedQuestions = document.getElementById("suggestedQuestions");
    this.inputSuggestions = document.getElementById("inputSuggestions");

    this.isTyping = false;
    this.conversationHistory = [];
    this.currentUser = {
      name: "Khách hàng",
      avatar: "/assets/images/user-avatar.png",
    };

    this.init();
  }

  init() {
    this.loadConversationHistory();
    this.showWelcomeMessage();
    this.setupEventListeners();
    this.setupInputSuggestions();
  }

  knowledgeBase = {
    greeting: {
      keywords: ["xin chào", "hello", "hi", "chào", "hế lô"],
      responses: [
        "Xin chào! Tôi là trợ lý ảo của Petcare. Tôi có thể giúp bạn tìm hiểu về các dịch vụ chăm sóc thú cưng. Bạn cần hỗ trợ gì?",
        "Chào bạn! Rất vui được hỗ trợ bạn. Petcare cung cấp đầy đủ dịch vụ chăm sóc thú cưng. Bạn muốn biết thông tin gì?",
        "Hello! Tôi là chatbot của Petcare. Hãy cho tôi biết bạn cần tư vấn về dịch vụ nào nhé!",
      ],
    },
    services: {
      keywords: ["dịch vụ", "làm gì", "cung cấp", "có gì", "service"],
      responses: [
        "Petcare cung cấp các dịch vụ:\n\n🏥 **Khám và điều trị bệnh**\n🔬 **Xét nghiệm - Chẩn đoán hình ảnh**\n⚕️ **Phẫu thuật**\n💉 **Tiêm phòng**\n✨ **Spa - Grooming**\n🚗 **Vận chuyển thú cưng**\n📋 **Dịch vụ xuất nhập cảnh**\n\nBạn muốn tìm hiểu chi tiết dịch vụ nào?",
      ],
    },
    booking: {
      keywords: ["đặt lịch", "booking", "hẹn khám", "đăng ký", "lịch hẹn"],
      responses: [
        "Để đặt lịch khám cho thú cưng, bạn có thể:\n\n📱 **Online**: Truy cập trang đặt lịch trên website\n📞 **Hotline**: 0395.560.056\n💬 **Chatbot**: Tôi có thể hỗ trợ đặt lịch ngay\n\n**Thông tin cần có:**\n• Tên và số điện thoại\n• Tên và loại thú cưng\n• Dịch vụ cần sử dụng\n• Thời gian mong muốn\n\nBạn muốn đặt lịch ngay không?",
        "Tôi có thể giúp bạn đặt lịch khám! Vui lòng cung cấp:\n\n👤 Họ tên của bạn\n📱 Số điện thoại\n🐕 Tên và loại thú cưng\n🏥 Dịch vụ cần sử dụng\n📅 Thời gian mong muốn\n\nBạn có sẵn sàng cung cấp thông tin không?",
      ],
    },
    pricing: {
      keywords: ["giá", "chi phí", "phí", "tiền", "bao nhiêu", "cost", "price"],
      responses: [
        "💰 **Bảng giá dịch vụ Petcare:**\n\n🏥 Khám tổng quát: 200.000đ - 300.000đ\n💉 Tiêm phòng: 150.000đ - 400.000đ\n✨ Spa cơ bản: 150.000đ - 250.000đ\n✂️ Cắt tỉa tạo kiểu: 250.000đ - 500.000đ\n🔬 Xét nghiệm: 100.000đ - 800.000đ\n⚕️ Phẫu thuật: Tùy theo ca\n\n*Giá có thể thay đổi theo từng trường hợp cụ thể. Liên hệ để được tư vấn chính xác!*",
      ],
    },
    location: {
      keywords: ["địa chỉ", "ở đâu", "chi nhánh", "cơ sở", "location"],
      responses: [
        "📍 **Hệ thống chi nhánh Petcare:**\n\n🏢 **Chi nhánh Cẩm Lệ**\n📍 010 Trần Phước Thành, Quận Cẩm Lệ, TP. Đà Nẵng\n📞 0961.555.911\n\n🏢 **Chi nhánh Hải Châu**\n📍 015 Quang Trung, Quận Hải Châu, TP. Đà Nẵng\n📞 0862.555.911\n\n🕐 **Giờ làm việc**: 8:00 - 20:00 (Thứ 2 - Chủ Nhật)",
      ],
    },
    hours: {
      keywords: ["giờ", "mở cửa", "làm việc", "hoạt động", "time", "hours"],
      responses: [
        "🕐 **Giờ hoạt động của Petcare:**\n\n⏰ **Thứ 2 - Chủ Nhật**: 8:00 - 20:00\n🆘 **Cấp cứu 24/7**: Có nhận cấp cứu ngoài giờ\n📞 **Hotline**: 0395.560.056\n\n*Để đảm bảo có bác sĩ, vui lòng đặt lịch trước khi đến!*",
      ],
    },
    emergency: {
      keywords: ["cấp cứu", "khẩn cấp", "emergency", "gấp", "nguy hiểm"],
      responses: [
        "🆘 **TRƯỜNG HỢP CẤP CỨU**\n\n📞 **Gọi ngay**: 0395.560.056\n🏥 **Địa chỉ gần nhất**:\n• Cẩm Lệ: 010 Trần Phước Thành\n• Hải Châu: 015 Quang Trung\n\n⚠️ **Những dấu hiệu cần cấp cứu ngay:**\n• Khó thở, thở gấp\n• Nôn mửa liên tục\n• Co giật\n• Chảy máu nhiều\n• Bất tỉnh\n\n**Hãy giữ bình tĩnh và đưa thú cưng đến ngay!**",
      ],
    },
    vaccine: {
      keywords: ["tiêm phòng", "vaccine", "vắc xin", "chủng ngừa"],
      responses: [
        "💉 **Dịch vụ tiêm phòng tại Petcare:**\n\n🐕 **Cho chó:**\n• 5 trong 1 (Care, Parvo, Adeno, Para, Distemper)\n• 7 trong 1 (bổ sung Lepto, Corona)\n• Dại\n• Kennel Cough\n\n🐱 **Cho mèo:**\n• 3 trong 1 (Panleukopenia, Calici, Rhinotracheitis)\n• 4 trong 1 (bổ sung Chlamydia)\n• Dại\n\n📅 **Lịch tiêm**: 6-8 tuần tuổi, nhắc lại hàng năm\n💰 **Giá**: 150.000đ - 400.000đ/mũi",
      ],
    },
    spa: {
      keywords: ["spa", "grooming", "tắm", "cắt lông", "làm đẹp"],
      responses: [
        "✨ **Dịch vụ Spa - Grooming:**\n\n🛁 **Combo tắm (150k-250k):**\n• Vệ sinh tai, cắt móng\n• Tắm, sấy, massage\n• Xịt nước hoa\n\n✂️ **Combo cắt tỉa (250k-500k):**\n• Tất cả dịch vụ combo tắm\n• Cắt tỉa theo yêu cầu\n• Tạo kiểu chuyên nghiệp\n\n👨‍⚕️ **Groomer chuyên nghiệp**\n🏆 **Đào tạo bài bản**\n💯 **An toàn, vệ sinh**",
      ],
    },
    contact: {
      keywords: ["liên hệ", "contact", "gọi", "điện thoại", "phone"],
      responses: [
        "📞 **Thông tin liên hệ Petcare:**\n\n☎️ **Hotline**: 0395.560.056\n📧 **Email**: PetCare@gmail.com\n🌐 **Website**: petcare.vn\n📱 **Zalo**: 0395.560.056\n\n**Chi nhánh:**\n🏢 Cẩm Lệ: 0961.555.911\n🏢 Hải Châu: 0862.555.911\n\n*Chúng tôi luôn sẵn sàng hỗ trợ bạn!*",
      ],
    },
  };

  showWelcomeMessage() {
    setTimeout(() => {
      this.removeTypingIndicator();
      this.addBotMessage(
        "Xin chào! Tôi là trợ lý ảo của Petcare 🐾\n\nTôi có thể giúp bạn:\n• Tìm hiểu về dịch vụ\n• Đặt lịch khám\n• Tư vấn giá cả\n• Thông tin liên hệ\n\nBạn cần hỗ trợ gì ạ?"
      );
    }, 1500);
  }

  setupEventListeners() {
    this.messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.messageInput.addEventListener("input", () => {
      this.messageInput.style.height = "auto";
      this.messageInput.style.height = this.messageInput.scrollHeight + "px";
    });

    this.messageInput.addEventListener("input", (e) => {
      this.handleInputSuggestions(e.target.value);
    });
  }

  handleInputSuggestions(input) {
    if (input.length < 2) {
      this.hideInputSuggestions();
      return;
    }

    const suggestions = this.getSuggestions(input.toLowerCase());
    if (suggestions.length > 0) {
      this.showInputSuggestions(suggestions);
    } else {
      this.hideInputSuggestions();
    }
  }

  getSuggestions(input) {
    const commonQuestions = [
      "Petcare có những dịch vụ gì?",
      "Làm thế nào để đặt lịch khám?",
      "Chi phí khám bệnh là bao nhiêu?",
      "Petcare có mấy chi nhánh?",
      "Giờ làm việc của Petcare?",
      "Dịch vụ tiêm phòng như thế nào?",
      "Spa grooming giá bao nhiêu?",
      "Số điện thoại liên hệ?",
      "Địa chỉ chi nhánh Cẩm Lệ?",
      "Dịch vụ cấp cứu 24/7?",
    ];

    return commonQuestions
      .filter(
        (q) =>
          q.toLowerCase().includes(input) ||
          this.removeVietnameseAccents(q.toLowerCase()).includes(
            this.removeVietnameseAccents(input)
          )
      )
      .slice(0, 5);
  }

  showInputSuggestions(suggestions) {
    this.inputSuggestions.innerHTML = suggestions
      .map(
        (suggestion) =>
          `<div class="suggestion-item" onclick="chatbot.selectSuggestion('${suggestion}')">${suggestion}</div>`
      )
      .join("");
    this.inputSuggestions.classList.add("show");
  }

  hideInputSuggestions() {
    this.inputSuggestions.classList.remove("show");
  }

  selectSuggestion(suggestion) {
    this.messageInput.value = suggestion;
    this.hideInputSuggestions();
    this.messageInput.focus();
  }

  setupInputSuggestions() {
    document.addEventListener("click", (e) => {
      if (
        !this.inputSuggestions.contains(e.target) &&
        e.target !== this.messageInput
      ) {
        this.hideInputSuggestions();
      }
    });
  }

  sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message || this.isTyping) return;

    this.addUserMessage(message);
    this.messageInput.value = "";
    this.messageInput.style.height = "auto";
    this.hideInputSuggestions();

    if (this.conversationHistory.length === 1) {
      this.hideSuggestedQuestions();
    }

    this.processMessage(message);
  }

  sendQuickMessage(message) {
    this.messageInput.value = message;
    this.sendMessage();
  }

  sendSuggestion(message) {
    this.sendQuickMessage(message);
  }

  processMessage(message) {
    this.showTypingIndicator();

    setTimeout(() => {
      const response = this.generateResponse(message);
      this.removeTypingIndicator();
      this.addBotMessage(response);
    }, 1000 + Math.random() * 1500);
  }

  generateResponse(message) {
    const lowerMessage = message.toLowerCase();
    const messageWithoutAccents = this.removeVietnameseAccents(lowerMessage);

    for (const [category, data] of Object.entries(this.knowledgeBase)) {
      for (const keyword of data.keywords) {
        if (
          lowerMessage.includes(keyword) ||
          messageWithoutAccents.includes(keyword)
        ) {
          const responses = data.responses;
          return responses[Math.floor(Math.random() * responses.length)];
        }
      }
    }

    return this.getDefaultResponse();
  }

  getDefaultResponse() {
    const defaultResponses = [
      "Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể hỏi về:\n\n• Dịch vụ của Petcare\n• Cách đặt lịch khám\n• Giá cả dịch vụ\n• Địa chỉ chi nhánh\n• Giờ làm việc\n\nHoặc gọi hotline 0395.560.056 để được hỗ trợ trực tiếp!",
      "Tôi chưa thể trả lời chính xác câu hỏi này. Vui lòng liên hệ:\n\n📞 Hotline: 0395.560.056\n📧 Email: PetCare@gmail.com\n\nHoặc hỏi tôi về các chủ đề khác như dịch vụ, giá cả, địa chỉ...",
      "Để được hỗ trợ tốt nhất, bạn có thể:\n\n• Hỏi về dịch vụ Petcare\n• Tìm hiểu cách đặt lịch\n• Xem bảng giá dịch vụ\n• Tìm địa chỉ chi nhánh\n\nHoặc gọi trực tiếp: 0395.560.056",
    ];

    return defaultResponses[
      Math.floor(Math.random() * defaultResponses.length)
    ];
  }

  addUserMessage(message) {
    const messageElement = this.createMessageElement(message, "user");
    this.chatMessages.appendChild(messageElement);
    this.scrollToBottom();
    this.saveToHistory(message, "user");
  }

  addBotMessage(message) {
    const messageElement = this.createMessageElement(message, "bot");
    this.chatMessages.appendChild(messageElement);
    this.scrollToBottom();
    this.saveToHistory(message, "bot");
  }

  createMessageElement(message, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}-message`;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";

    const avatarImg = document.createElement("img");
    avatarImg.src =
      sender === "user"
        ? this.currentUser.avatar
        : "/assets/images/chatbot-avatar.png";
    avatarImg.alt = sender === "user" ? "User" : "Bot";
    avatarImg.onerror = () => {
      avatarImg.src =
        sender === "user"
          ? "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiM2Yzc1N2QiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNGMwIDIuMjEgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg=="
          : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiM0ZTg1ZmQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMmM1LjUgMCAxMCA0LjUgMTAgMTBzLTQuNSAxMC0xMCAxMFMyIDE3LjUgMiAxMlM2LjUgMiAxMiAyek05LjUgOWExIDEgMCAwMC0xIDEgMSAxIDAgMDAxIDFoNWExIDEgMCAwMDEtMSAxIDEgMCAwMC0xLTFoLTV6TTkgMTRhMSAxIDAgMDAwIDJoNmExIDEgMCAwMDAtMkg5eiIvPjwvc3ZnPg==";
    };
    avatar.appendChild(avatarImg);

    const content = document.createElement("div");
    content.className = "message-content";

    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${sender}-bubble`;

    const formattedMessage = this.formatMessage(message);
    bubble.innerHTML = formattedMessage;

    const time = document.createElement("div");
    time.className = "message-time";
    time.textContent = this.getCurrentTime();

    if (sender === "bot") {
      const actions = this.createMessageActions();
      content.appendChild(bubble);
      content.appendChild(time);
      content.appendChild(actions);
    } else {
      content.appendChild(bubble);
      content.appendChild(time);
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    return messageDiv;
  }

  createMessageActions() {
    const actions = document.createElement("div");
    actions.className = "message-actions";

    const copyBtn = document.createElement("button");
    copyBtn.className = "message-action";
    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
    copyBtn.title = "Sao chép";
    copyBtn.onclick = (e) => this.copyMessage(e);

    const likeBtn = document.createElement("button");
    likeBtn.className = "message-action";
    likeBtn.innerHTML = '<i class="fas fa-thumbs-up"></i>';
    likeBtn.title = "Hữu ích";
    likeBtn.onclick = (e) => this.likeMessage(e);

    actions.appendChild(copyBtn);
    actions.appendChild(likeBtn);

    return actions;
  }

  copyMessage(e) {
    const messageText = e.target
      .closest(".message")
      .querySelector(".message-bubble").textContent;
    navigator.clipboard.writeText(messageText).then(() => {
      this.showToast("Đã sao chép tin nhắn");
    });
  }

  likeMessage(e) {
    const btn = e.target.closest(".message-action");
    btn.classList.toggle("liked");
    btn.innerHTML = btn.classList.contains("liked")
      ? '<i class="fas fa-thumbs-up" style="color: #4e85fd;"></i>'
      : '<i class="fas fa-thumbs-up"></i>';
  }

  formatMessage(message) {
    return message
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>")
      .replace(/• /g, "• ");
  }

  showTypingIndicator() {
    this.isTyping = true;

    const typingDiv = document.createElement("div");
    typingDiv.className = "message bot-message typing-message";
    typingDiv.innerHTML = `
            <div class="message-avatar">
                <img src="/assets/images/chatbot-avatar.png" alt="Bot" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiM0ZTg1ZmQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMmM1LjUgMCAxMCA0LjUgMTAgMTBzLTQuNSAxMC0xMCAxMFMyIDE3LjUgMiAxMlM2LjUgMiAxMiAyek05LjUgOWExIDEgMCAwMC0xIDEgMSAxIDAgMDAxIDFoNWExIDEgMCAwMDEtMSAxIDEgMCAwMC0xLTFoLTV6TTkgMTRhMSAxIDAgMDAwIDJoNmExIDEgMCAwMDAtMkg5eiIvPjwvc3ZnPg=='">
            </div>
            <div class="message-content">
                <div class="message-bubble bot-bubble">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;

    this.chatMessages.appendChild(typingDiv);
    this.scrollToBottom();
  }

  removeTypingIndicator() {
    const typingMessage = this.chatMessages.querySelector(".typing-message");
    if (typingMessage) {
      typingMessage.remove();
    }
    this.isTyping = false;
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatMessages.scrollTo({
        top: this.chatMessages.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  }

  getCurrentTime() {
    return new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  saveToHistory(message, sender) {
    this.conversationHistory.push({
      message,
      sender,
      timestamp: Date.now(),
    });
    this.saveConversationHistory();
  }

  saveConversationHistory() {
    try {
      localStorage.setItem(
        "petcare_chat_history",
        JSON.stringify(this.conversationHistory)
      );
    } catch (e) {
      console.warn("Không thể lưu lịch sử chat:", e);
    }
  }

  loadConversationHistory() {
    try {
      const history = localStorage.getItem("petcare_chat_history");
      if (history) {
        this.conversationHistory = JSON.parse(history);
        this.restoreConversation();
      }
    } catch (e) {
      console.warn("Không thể load lịch sử chat:", e);
      this.conversationHistory = [];
    }
  }

  restoreConversation() {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentHistory = this.conversationHistory.filter(
      (item) => item.timestamp > oneDayAgo
    );

    if (recentHistory.length > 0) {
      this.chatMessages.innerHTML = "";

      recentHistory.forEach((item) => {
        if (item.sender === "user") {
          this.addUserMessage(item.message);
        } else {
          this.addBotMessage(item.message);
        }
      });
    }
  }

  clearChat() {
    if (confirm("Bạn có chắc muốn xóa toàn bộ cuộc trò chuyện?")) {
      this.chatMessages.innerHTML = "";
      this.conversationHistory = [];
      this.saveConversationHistory();
      this.showSuggestedQuestions();
      this.showWelcomeMessage();
    }
  }

  hideSuggestedQuestions() {
    this.suggestedQuestions.style.display = "none";
  }

  showSuggestedQuestions() {
    this.suggestedQuestions.style.display = "block";
  }

  removeVietnameseAccents(str) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  }

  showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 100);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  showAttachmentOptions() {
    const options = [
      {
        icon: "fas fa-image",
        text: "Hình ảnh",
        action: () => this.handleImageUpload(),
      },
      {
        icon: "fas fa-file",
        text: "Tài liệu",
        action: () => this.handleFileUpload(),
      },
      {
        icon: "fas fa-map-marker-alt",
        text: "Vị trí",
        action: () => this.handleLocationShare(),
      },
    ];

    const dropdown = document.createElement("div");
    dropdown.className = "attachment-dropdown";
    dropdown.innerHTML = options
      .map(
        (option) =>
          `<div class="attachment-option" onclick="${option.action.name}()">
               <i class="${option.icon}"></i>
               <span>${option.text}</span>
           </div>`
      )
      .join("");

    document.body.appendChild(dropdown);

    setTimeout(() => {
      if (document.body.contains(dropdown)) {
        document.body.removeChild(dropdown);
      }
    }, 5000);
  }

  handleImageUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.sendImageMessage(e.target.result, file.name);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  sendImageMessage(imageSrc, fileName) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message user-message";
    messageDiv.innerHTML = `
           <div class="message-avatar">
               <img src="${this.currentUser.avatar}" alt="User">
           </div>
           <div class="message-content">
               <div class="message-bubble user-bubble">
                   <div class="image-message">
                       <img src="${imageSrc}" alt="${fileName}" style="max-width: 200px; border-radius: 8px;">
                       <p>${fileName}</p>
                   </div>
               </div>
               <div class="message-time">${this.getCurrentTime()}</div>
           </div>
       `;

    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();

    setTimeout(() => {
      this.addBotMessage(
        "Tôi đã nhận được hình ảnh của bạn! Tuy nhiên, tôi chưa thể phân tích hình ảnh. Vui lòng mô tả vấn đề của thú cưng bằng văn bản để tôi có thể hỗ trợ tốt hơn."
      );
    }, 1000);
  }

  showEmojiPicker() {
    const emojis = [
      "😊",
      "😢",
      "😍",
      "😂",
      "👍",
      "👎",
      "❤️",
      "🐕",
      "🐱",
      "🏥",
      "💉",
      "✨",
    ];

    const picker = document.createElement("div");
    picker.className = "emoji-picker";
    picker.innerHTML = emojis
      .map(
        (emoji) =>
          `<span class="emoji-item" onclick="chatbot.insertEmoji('${emoji}')">${emoji}</span>`
      )
      .join("");

    const inputRect = this.messageInput.getBoundingClientRect();
    picker.style.position = "absolute";
    picker.style.bottom = "60px";
    picker.style.right = "10px";

    document.body.appendChild(picker);

    setTimeout(() => {
      if (document.body.contains(picker)) {
        document.body.removeChild(picker);
      }
    }, 5000);
  }

  insertEmoji(emoji) {
    const currentValue = this.messageInput.value;
    const cursorPos = this.messageInput.selectionStart;

    this.messageInput.value =
      currentValue.slice(0, cursorPos) + emoji + currentValue.slice(cursorPos);
    this.messageInput.focus();

    setTimeout(() => {
      this.messageInput.setSelectionRange(
        cursorPos + emoji.length,
        cursorPos + emoji.length
      );
    }, 10);

    const picker = document.querySelector(".emoji-picker");
    if (picker) {
      document.body.removeChild(picker);
    }
  }

  handleKeyPress(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  exportChat() {
    const chatData = {
      timestamp: new Date().toISOString(),
      messages: this.conversationHistory,
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `petcare-chat-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    this.showToast("Đã xuất file chat thành công!");
  }
}

function toggleChatSettings() {
  const settings = document.createElement("div");
  settings.className = "chat-settings-popup";
  settings.innerHTML = `
       <div class="settings-header">
           <h5>Cài đặt Chat</h5>
           <button onclick="this.parentElement.parentElement.remove()">×</button>
       </div>
       <div class="settings-body">
           <div class="setting-item">
               <label>
                   <input type="checkbox" id="soundEnabled" checked>
                   Âm thanh thông báo
               </label>
           </div>
           <div class="setting-item">
               <label>
                   <input type="checkbox" id="typingIndicator" checked>
                   Hiện trạng thái đang nhập
               </label>
           </div>
           <div class="setting-item">
               <button onclick="chatbot.exportChat()" class="btn btn-sm btn-primary">
                   <i class="fas fa-download"></i> Xuất chat
               </button>
           </div>
           <div class="setting-item">
               <button onclick="chatbot.clearChat()" class="btn btn-sm btn-danger">
                   <i class="fas fa-trash"></i> Xóa chat
               </button>
           </div>
       </div>
   `;

  document.body.appendChild(settings);
}

function clearChat() {
  chatbot.clearChat();
}

function sendQuickMessage(message) {
  chatbot.sendQuickMessage(message);
}

function sendSuggestion(message) {
  chatbot.sendSuggestion(message);
}

function handleKeyPress(event) {
  chatbot.handleKeyPress(event);
}

function sendMessage() {
  chatbot.sendMessage();
}

function showAttachmentOptions() {
  chatbot.showAttachmentOptions();
}

function showEmojiPicker() {
  chatbot.showEmojiPicker();
}

document.addEventListener("DOMContentLoaded", function () {
  window.chatbot = new PetcareChatbot();
});

const additionalCSS = `
/* Toast Notifications */
.toast-notification {
   position: fixed;
   top: 20px;
   right: 20px;
   padding: 12px 20px;
   border-radius: 8px;
   color: white;
   font-weight: 500;
   transform: translateX(400px);
   transition: transform 0.3s ease;
   z-index: 10000;
   box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.toast-notification.show {
   transform: translateX(0);
}

.toast-success {
   background: linear-gradient(135deg, #28a745, #20c997);
}

.toast-error {
   background: linear-gradient(135deg, #dc3545, #e83e8c);
}

.toast-info {
   background: linear-gradient(135deg, #17a2b8, #6f42c1);
}

/* Attachment Dropdown */
.attachment-dropdown {
   position: fixed;
   bottom: 120px;
   left: 50%;
   transform: translateX(-50%);
   background: white;
   border-radius: 12px;
   box-shadow: 0 8px 25px rgba(0,0,0,0.2);
   padding: 8px;
   z-index: 1001;
   animation: slideUp 0.3s ease;
}

@keyframes slideUp {
   from {
       opacity: 0;
       transform: translateX(-50%) translateY(20px);
   }
   to {
       opacity: 1;
       transform: translateX(-50%) translateY(0);
   }
}

.attachment-option {
   display: flex;
   align-items: center;
   gap: 12px;
   padding: 12px 16px;
   border-radius: 8px;
   cursor: pointer;
   transition: background 0.2s ease;
   font-size: 14px;
   white-space: nowrap;
}

.attachment-option:hover {
   background: #f8f9fa;
}

.attachment-option i {
   color: #4e85fd;
   width: 16px;
}

/* Emoji Picker */
.emoji-picker {
   position: fixed;
   bottom: 120px;
   right: 20px;
   background: white;
   border-radius: 12px;
   box-shadow: 0 8px 25px rgba(0,0,0,0.2);
   padding: 12px;
   display: grid;
   grid-template-columns: repeat(6, 1fr);
   gap: 8px;
   z-index: 1001;
   animation: fadeIn 0.3s ease;
}

.emoji-item {
   font-size: 20px;
   cursor: pointer;
   padding: 8px;
   border-radius: 8px;
   text-align: center;
   transition: background 0.2s ease;
}

.emoji-item:hover {
   background: #f8f9fa;
   transform: scale(1.2);
}

/* Chat Settings Popup */
.chat-settings-popup {
   position: fixed;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
   background: white;
   border-radius: 12px;
   box-shadow: 0 8px 25px rgba(0,0,0,0.3);
   z-index: 1002;
   min-width: 300px;
   animation: fadeIn 0.3s ease;
}

.settings-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 20px;
   border-bottom: 1px solid #e9ecef;
}

.settings-header h5 {
   margin: 0;
   font-weight: 600;
}

.settings-header button {
   background: none;
   border: none;
   font-size: 20px;
   cursor: pointer;
   color: #6c757d;
   padding: 0;
   width: 24px;
   height: 24px;
   display: flex;
   align-items: center;
   justify-content: center;
}

.settings-body {
   padding: 20px;
}

.setting-item {
   margin-bottom: 15px;
}

.setting-item:last-child {
   margin-bottom: 0;
}

.setting-item label {
   display: flex;
   align-items: center;
   gap: 8px;
   cursor: pointer;
   font-size: 14px;
}

.setting-item input[type="checkbox"] {
   width: 16px;
   height: 16px;
}

.setting-item .btn {
   width: 100%;
   justify-content: center;
   display: flex;
   align-items: center;
   gap: 8px;
}

/* Image Messages */
.image-message {
   text-align: center;
}

.image-message img {
   display: block;
   margin: 0 auto 8px;
   max-width: 100%;
   height: auto;
   border-radius: 8px;
   box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.image-message p {
   margin: 0;
   font-size: 12px;
   color: rgba(255,255,255,0.8);
}

/* Responsive cho mobile */
@media (max-width: 480px) {
   .attachment-dropdown {
       left: 20px;
       right: 20px;
       transform: none;
       width: auto;
   }
   
   .emoji-picker {
       left: 20px;
       right: 20px;
       grid-template-columns: repeat(8, 1fr);
   }
   
   .chat-settings-popup {
       left: 20px;
       right: 20px;
       transform: translateY(-50%);
       width: auto;
   }
   
   .toast-notification {
       left: 20px;
       right: 20px;
       transform: translateY(-100px);
   }
   
   .toast-notification.show {
       transform: translateY(0);
   }
}
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);
