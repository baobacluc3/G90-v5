const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/cart", (req, res) => {
  const cart = req.session?.cart || [];

  res.json({
    success: true,
    data: cart,
  });
});

router.post("/cart/add", (req, res) => {
  const { productId, quantity, userId } = req.body;

  if (!productId || !quantity) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin sản phẩm" });
  }

  const query = `
    SELECT sp.*, dm.TenDonMuc 
    FROM SanPham sp
    LEFT JOIN DonMucSP dm ON sp.ID_DonMuc = dm.ID_DonMuc
    WHERE sp.ID_SanPham = ?
  `;

  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error("Lỗi lấy sản phẩm:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    const product = results[0];
    res.json({
      success: true,
      message: "Thêm vào giỏ hàng thành công",
      product: {
        id: product.ID_SanPham,
        name: product.TenSP,
        price: product.Gia,
        quantity: quantity,
        image: `/assets/images/food${productId === 1 ? "" : productId}.png`,
      },
    });
  });
});

router.post("/orders/create", (req, res) => {
  const { items, totalAmount, customerInfo } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: "Giỏ hàng trống" });
  }

  const insertOrderQuery = `
    INSERT INTO DonHang (TongTien, TrangThai, DiaChiGiaoHang, PhuongThucThanhToan)
    VALUES (?, 'Chờ xác nhận', ?, 'Tiền mặt')
  `;

  db.query(
    insertOrderQuery,
    [totalAmount, customerInfo?.address || ""],
    (err, orderResult) => {
      if (err) {
        console.error("Lỗi tạo đơn hàng:", err);
        return res
          .status(500)
          .json({ success: false, message: "Lỗi tạo đơn hàng" });
      }

      const orderId = orderResult.insertId;
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
          console.error("Lỗi thêm chi tiết đơn hàng:", err);
          return res
            .status(500)
            .json({ success: false, message: "Lỗi tạo đơn hàng" });
        }

        res.json({
          success: true,
          message: "Đặt hàng thành công",
          orderId: orderId,
        });
      });
    }
  );
});

module.exports = router;
