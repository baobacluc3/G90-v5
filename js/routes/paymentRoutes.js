const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const axios = require("axios");
const db = require("../db");

const momoConfig = {
  partnerCode: "MOMOBKUN20180529",
  accessKey: "klm05TvNBzhg7h7j",
  secretKey: "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa",
  endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
};

router.post("/payment/momo/create", async (req, res) => {
  try {
    const { amount, orderInfo, items, returnUrl, notifyUrl } = req.body;

    const orderId = `PETCARE_${Date.now()}`;
    const requestId = orderId;

    const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=&ipnUrl=${notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=captureWallet`;

    const signature = crypto
      .createHmac("sha256", momoConfig.secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode: momoConfig.partnerCode,
      accessKey: momoConfig.accessKey,
      requestId: requestId,
      amount: amount.toString(),
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: returnUrl,
      ipnUrl: notifyUrl,
      extraData: "",
      requestType: "captureWallet",
      signature: signature,
      lang: "vi",
    };

    const response = await axios.post(momoConfig.endpoint, requestBody);

    if (response.data.resultCode === 0) {
      const insertOrderQuery = `
                INSERT INTO DonHang (ID_DonHang, TongTien, TrangThai, PhuongThucThanhToan, NgayDat)
                VALUES (?, ?, 'Chờ thanh toán', 'MoMo', NOW())
            `;

      db.query(insertOrderQuery, [orderId, amount], (err) => {
        if (err) {
          console.error("Lỗi lưu đơn hàng:", err);
        }

        const insertItemsQuery = `
                    INSERT INTO ChiTietDonHang (ID_DonHang, ID_SanPham, SoLuong, Gia, ThanhTien)
                    VALUES ?
                `;

        const itemsData = items.map((item) => [
          orderId,
          item.id,
          item.quantity,
          item.price,
          item.price * item.quantity,
        ]);

        db.query(insertItemsQuery, [itemsData], (err) => {
          if (err) {
            console.error("Lỗi lưu chi tiết đơn hàng:", err);
          }
        });
      });

      res.json({
        success: true,
        payUrl: response.data.payUrl,
        orderId: orderId,
        message: "Tạo thanh toán thành công",
      });
    } else {
      throw new Error(response.data.message || "Không thể tạo thanh toán");
    }
  } catch (error) {
    console.error("MoMo payment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi tạo thanh toán MoMo",
    });
  }
});

router.post("/payment/momo/notify", async (req, res) => {
  try {
    const {
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.body;

    const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${momoConfig.partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const checkSignature = crypto
      .createHmac("sha256", momoConfig.secretKey)
      .update(rawSignature)
      .digest("hex");

    if (signature !== checkSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    if (resultCode === 0) {
      const updateQuery = `
                UPDATE DonHang 
                SET TrangThai = 'Đã thanh toán', 
                    MaGiaoDichMoMo = ?,
                    NgayCapNhat = NOW()
                WHERE ID_DonHang = ?
            `;

      db.query(updateQuery, [transId, orderId], (err) => {
        if (err) {
          console.error("Lỗi cập nhật đơn hàng:", err);
        }
      });
    } else {
      const updateQuery = `
                UPDATE DonHang 
                SET TrangThai = 'Thanh toán thất bại',
                    NgayCapNhat = NOW()
                WHERE ID_DonHang = ?
            `;

      db.query(updateQuery, [orderId], (err) => {
        if (err) {
          console.error("Lỗi cập nhật đơn hàng:", err);
        }
      });
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("MoMo callback error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xử lý callback",
    });
  }
});

router.get("/payment/check/:orderId", (req, res) => {
  const { orderId } = req.params;

  const query = "SELECT * FROM DonHang WHERE ID_DonHang = ?";
  db.query(query, [orderId], (err, results) => {
    if (err) {
      console.error("Lỗi kiểm tra đơn hàng:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    res.json({
      success: true,
      order: results[0],
    });
  });
});

module.exports = router;
