const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/profile", (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, message: "Missing user id" });
  }

  const query = `SELECT ID_TaiKhoan, HoTen, Gmail, DienThoai FROM TaiKhoan WHERE ID_TaiKhoan = ?`;
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Lỗi lấy thông tin người dùng:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const user = results[0];
    res.json({
      success: true,
      data: {
        id: user.ID_TaiKhoan,
        name: user.HoTen,
        email: user.Gmail,
        phone: user.DienThoai,
      },
    });
  });
});

router.put("/profile", (req, res) => {
  const { id, name, phone } = req.body;
  if (!id || !name) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin bắt buộc" });
  }

  const query = "UPDATE TaiKhoan SET HoTen = ?, DienThoai = ? WHERE ID_TaiKhoan = ?";
  db.query(query, [name, phone || null, id], (err, result) => {
    if (err) {
      console.error("Lỗi cập nhật thông tin người dùng:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    res.json({ success: true, message: "Cập nhật thành công" });
  });
});

module.exports = router;
