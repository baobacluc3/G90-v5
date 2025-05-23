const express = require("express");
const router = express.Router();
const db = require("../db");

const chatbotResponses = {
  greeting: [
    "Xin chào! Tôi là trợ lý ảo của Petcare. Tôi có thể giúp gì cho bạn?",
    "Chào bạn! Tôi có thể hỗ trợ bạn về các dịch vụ chăm sóc thú cưng.",
    "Hello! Tôi là chatbot của Petcare. Bạn cần tư vấn gì không?",
  ],
  services: {
    spa: "Dịch vụ Spa-Grooming của chúng tôi bao gồm: tắm gội, cắt tỉa lông, vệ sinh tai, cắt móng, và massage thư giãn. Giá từ 100k-250k tùy gói.",
    "khám bệnh":
      "Chúng tôi có dịch vụ khám sức khỏe định kỳ và điều trị bệnh cho thú cưng. Bác sĩ thú y chuyên nghiệp với thiết bị hiện đại.",
    "tiêm phòng":
      "Dịch vụ tiêm phòng đầy đủ cho chó mèo: vaccine 5-in-1, vaccine dại, vaccine theo độ tuổi. Lịch tiêm được nhắc nhở tự động.",
    "khách sạn":
      "Dịch vụ khách sạn thú cưng khi bạn đi xa. Chăm sóc 24/7, ăn uống đầy đủ, vui chơi và tập thể dục.",
  },
  booking:
    "Để đặt lịch, bạn có thể:\n1. Truy cập trang Đặt Lịch\n2. Gọi hotline: 0395560056\n3. Nhắn tin qua Zalo\nChúng tôi sẽ xác nhận lịch hẹn trong 30 phút.",
  location:
    "Petcare có 2 chi nhánh:\n🏥 Cẩm Lệ: 010 Trần Phước Thành, Quận Cẩm Lệ\n🏥 Hải Châu: 015 Quang Trung, Quận Hải Châu\nGiờ làm việc: 8:00-20:00 hàng ngày",
  price:
    "Bảng giá dịch vụ:\n💰 Tắm gội cơ bản: 100k\n💰 Combo cắt tắm: 150k  \n💰 Combo cao cấp: 250k\n💰 Khám sức khỏe: 200k\n💰 Tiêm phòng: theo loại vaccine",
  emergency:
    "🚨 KHẨN CẤP: Nếu thú cưng có tình trạng nguy hiểm, vui lòng:\n1. Gọi ngay: 0395560056\n2. Đến ngay cơ sở gần nhất\n3. Mô tả triệu chứng qua điện thoại để được hướng dẫn sơ cứu",
  default: [
    "Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể hỏi về: dịch vụ, đặt lịch, giá cả, địa điểm, hoặc tình huống khẩn cấp.",
    "Tôi cần thêm thông tin để hỗ trợ bạn tốt hơn. Bạn quan tâm đến dịch vụ nào của Petcare?",
    "Để tôi có thể hỗ trợ chính xác, bạn có thể nói rõ hơn về nhu cầu của mình không?",
  ],
};

function analyzeMessage(message) {
  const msg = message.toLowerCase().trim();

  if (/^(xin chào|chào|hello|hi|hey)$/i.test(msg)) {
    return { intent: "greeting", confidence: 1.0 };
  }

  if (
    msg.includes("spa") ||
    msg.includes("grooming") ||
    msg.includes("tắm") ||
    msg.includes("cắt lông")
  ) {
    return { intent: "services", subtype: "spa", confidence: 0.8 };
  }

  if (
    msg.includes("khám") ||
    msg.includes("bệnh") ||
    msg.includes("sức khỏe") ||
    msg.includes("bác sĩ")
  ) {
    return { intent: "services", subtype: "khám bệnh", confidence: 0.8 };
  }

  if (
    msg.includes("tiêm") ||
    msg.includes("vaccine") ||
    msg.includes("phòng bệnh")
  ) {
    return { intent: "services", subtype: "tiêm phòng", confidence: 0.8 };
  }

  if (
    msg.includes("khách sạn") ||
    msg.includes("gửi thú cưng") ||
    msg.includes("đi xa")
  ) {
    return { intent: "services", subtype: "khách sạn", confidence: 0.8 };
  }

  if (msg.includes("đặt lịch") || msg.includes("hẹn") || msg.includes("book")) {
    return { intent: "booking", confidence: 0.9 };
  }

  if (
    msg.includes("địa chỉ") ||
    msg.includes("chi nhánh") ||
    msg.includes("ở đâu") ||
    msg.includes("đường đến")
  ) {
    return { intent: "location", confidence: 0.9 };
  }

  if (
    msg.includes("giá") ||
    msg.includes("phí") ||
    msg.includes("tiền") ||
    msg.includes("chi phí")
  ) {
    return { intent: "price", confidence: 0.8 };
  }

  if (
    msg.includes("khẩn cấp") ||
    msg.includes("cấp cứu") ||
    msg.includes("nguy hiểm") ||
    msg.includes("nghiêm trọng")
  ) {
    return { intent: "emergency", confidence: 1.0 };
  }

  return { intent: "default", confidence: 0.3 };
}

function generateResponse(intent, subtype = null) {
  switch (intent) {
    case "greeting":
      return chatbotResponses.greeting[
        Math.floor(Math.random() * chatbotResponses.greeting.length)
      ];

    case "services":
      return (
        chatbotResponses.services[subtype] ||
        "Chúng tôi có các dịch vụ: Spa-Grooming, Khám sức khỏe, Tiêm phòng, Khách sạn thú cưng. Bạn muốn biết về dịch vụ nào?"
      );

    case "booking":
      return chatbotResponses.booking;

    case "location":
      return chatbotResponses.location;

    case "price":
      return chatbotResponses.price;

    case "emergency":
      return chatbotResponses.emergency;

    default:
      return chatbotResponses.default[
        Math.floor(Math.random() * chatbotResponses.default.length)
      ];
  }
}

router.post("/chatbot/start", (req, res) => {
  const { userId } = req.body;

  const createRoomQuery = `
    INSERT INTO ChatRooms (TenRoom, LoaiRoom, MoTa, TrangThai)
    VALUES (?, 'support', ?, 'active')
  `;

  const roomName = `Support Chat ${Date.now()}`;
  const description = `Chatbot support session for user ${
    userId || "anonymous"
  }`;

  db.query(createRoomQuery, [roomName, description], (err, roomResult) => {
    if (err) {
      console.error("Error creating chat room:", err);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi tạo phòng chat" });
    }

    const roomId = roomResult.insertId;

    if (userId) {
      const addMemberQuery = `
        INSERT INTO ChatRoomMembers (ID_Room, ID_TaiKhoan, VaiTro)
        VALUES (?, ?, 'member')
      `;

      db.query(addMemberQuery, [roomId, userId], (err) => {
        if (err) console.error("Error adding user to chat room:", err);
      });
    }

    const welcomeMessage =
      "Xin chào! Tôi là trợ lý ảo của Petcare. Tôi có thể giúp bạn tìm hiểu về các dịch vụ chăm sóc thú cưng. Bạn cần hỗ trợ gì hôm nay?";

    const insertMessageQuery = `
      INSERT INTO ChatMessages (ID_Room, ID_TaiKhoan, NoiDung, LoaiTinNhan, TrangThai)
      VALUES (?, 1, ?, 'text', 'sent')
    `;

    db.query(insertMessageQuery, [roomId, welcomeMessage], (err) => {
      if (err) console.error("Error inserting welcome message:", err);

      res.json({
        success: true,
        roomId: roomId,
        message: welcomeMessage,
      });
    });
  });
});

router.post("/chatbot/message", (req, res) => {
  const { roomId, message, userId } = req.body;

  if (!roomId || !message) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin roomId hoặc message",
    });
  }

  const insertUserMessageQuery = `
    INSERT INTO ChatMessages (ID_Room, ID_TaiKhoan, NoiDung, LoaiTinNhan, TrangThai)
    VALUES (?, ?, ?, 'text', 'sent')
  `;

  db.query(
    insertUserMessageQuery,
    [roomId, userId || null, message],
    (err, userMessageResult) => {
      if (err) {
        console.error("Error saving user message:", err);
        return res
          .status(500)
          .json({ success: false, message: "Lỗi lưu tin nhắn" });
      }

      const analysis = analyzeMessage(message);
      const botResponse = generateResponse(analysis.intent, analysis.subtype);

      let quickActions = [];
      if (analysis.intent === "services") {
        quickActions = [
          { text: "Đặt lịch ngay", action: "booking" },
          { text: "Xem bảng giá", action: "price" },
          { text: "Địa chỉ chi nhánh", action: "location" },
        ];
      } else if (analysis.intent === "default") {
        quickActions = [
          { text: "Dịch vụ Spa", action: "services_spa" },
          { text: "Đặt lịch khám", action: "booking" },
          { text: "Bảng giá", action: "price" },
          { text: "Liên hệ nhân viên", action: "human_support" },
        ];
      }

      const insertBotMessageQuery = `
      INSERT INTO ChatMessages (ID_Room, ID_TaiKhoan, NoiDung, LoaiTinNhan, TrangThai)
      VALUES (?, 1, ?, 'text', 'sent')
    `;

      db.query(insertBotMessageQuery, [roomId, botResponse], (err) => {
        if (err) {
          console.error("Error saving bot message:", err);
          return res
            .status(500)
            .json({ success: false, message: "Lỗi lưu phản hồi" });
        }

        res.json({
          success: true,
          response: botResponse,
          quickActions: quickActions,
          analysis: analysis,
        });
      });
    }
  );
});

router.get("/chatbot/history/:roomId", (req, res) => {
  const { roomId } = req.params;
  const { limit = 50 } = req.query;

  const query = `
    SELECT 
      cm.*,
      tk.HoTen as SenderName,
      DATE_FORMAT(cm.NgayGui, '%H:%i %d/%m') as FormattedTime
    FROM ChatMessages cm
    LEFT JOIN TaiKhoan tk ON cm.ID_TaiKhoan = tk.ID_TaiKhoan
    WHERE cm.ID_Room = ?
    ORDER BY cm.NgayGui ASC
    LIMIT ?
  `;

  db.query(query, [roomId, parseInt(limit)], (err, results) => {
    if (err) {
      console.error("Error fetching chat history:", err);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi lấy lịch sử chat" });
    }

    const messages = results.map((msg) => ({
      id: msg.ID_Message,
      content: msg.NoiDung,
      sender: msg.ID_TaiKhoan === 1 ? "bot" : "user",
      senderName: msg.SenderName || "Chatbot",
      timestamp: msg.FormattedTime,
      type: msg.LoaiTinNhan,
    }));

    res.json({
      success: true,
      messages: messages,
    });
  });
});

router.post("/chatbot/request-human", (req, res) => {
  const { roomId, userId, issue } = req.body;

  const createSupportQuery = `
    INSERT INTO ChatSupport (ID_KhachHang, ID_Room, TieuDe, TinhTrang, DoUuTien)
    VALUES (?, ?, ?, 'waiting', 'medium')
  `;

  const title = `Yêu cầu hỗ trợ: ${issue || "Tư vấn trực tiếp"}`;

  db.query(createSupportQuery, [userId, roomId, title], (err, result) => {
    if (err) {
      console.error("Error creating support ticket:", err);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi tạo yêu cầu hỗ trợ" });
    }

    const notificationMessage =
      "Đã chuyển cuộc trò chuyện cho nhân viên hỗ trợ. Vui lòng chờ trong giây lát, nhân viên sẽ phản hồi sớm nhất có thể.";

    const insertMessageQuery = `
      INSERT INTO ChatMessages (ID_Room, ID_TaiKhoan, NoiDung, LoaiTinNhan, TrangThai)
      VALUES (?, 1, ?, 'system', 'sent')
    `;

    db.query(insertMessageQuery, [roomId, notificationMessage], (err) => {
      if (err) console.error("Error saving notification message:", err);

      res.json({
        success: true,
        message: notificationMessage,
        supportTicketId: result.insertId,
      });
    });
  });
});

router.get("/chatbot/stats", (req, res) => {
  const queries = {
    totalChats: `
      SELECT COUNT(*) as count
      FROM ChatRooms
      WHERE LoaiRoom = 'support'
    `,
    todayChats: `
      SELECT COUNT(*) as count
      FROM ChatRooms
      WHERE LoaiRoom = 'support' 
      AND DATE(NgayTao) = CURDATE()
    `,
    totalMessages: `
      SELECT COUNT(*) as count
      FROM ChatMessages cm
      JOIN ChatRooms cr ON cm.ID_Room = cr.ID_Room
      WHERE cr.LoaiRoom = 'support'
    `,
    humanRequests: `
      SELECT COUNT(*) as count
      FROM ChatSupport
      WHERE TinhTrang IN ('waiting', 'active')
    `,
  };

  const results = {};
  const queryKeys = Object.keys(queries);
  let completed = 0;

  queryKeys.forEach((key) => {
    db.query(queries[key], (err, result) => {
      if (err) {
        console.error(`Error in ${key} query:`, err);
        results[key] = 0;
      } else {
        results[key] = result[0].count;
      }

      completed++;
      if (completed === queryKeys.length) {
        res.json({
          success: true,
          stats: results,
        });
      }
    });
  });
});

module.exports = router;
