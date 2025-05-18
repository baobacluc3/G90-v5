const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/orders/tracking", (req, res) => {
  const { search, status, priority, page = 1, limit = 15 } = req.query;

  let query = `
        SELECT 
            dh.ID_DonHang,
            dh.NgayDat,
            dh.TrangThai,
            dh.TongTien,
            dh.MucDoUuTien,
            dh.NgayCapNhat,
            tk.HoTen as TenKhachHang,
            tk.DienThoai as SoDienThoai,
            tk.DiaChi as DiaChiGiaoHang,
            COUNT(ctdh.ID_ChiTietDonHang) as SoLuongSanPham
        FROM DonHang dh
        LEFT JOIN TaiKhoan tk ON dh.ID_TaiKhoan = tk.ID_TaiKhoan
        LEFT JOIN ChiTietDonHang ctdh ON dh.ID_DonHang = ctdh.ID_DonHang
        WHERE 1=1
    `;

  let countQuery = `
        SELECT COUNT(DISTINCT dh.ID_DonHang) as total
        FROM DonHang dh
        LEFT JOIN TaiKhoan tk ON dh.ID_TaiKhoan = tk.ID_TaiKhoan
        WHERE 1=1
    `;

  let params = [];
  let countParams = [];

  if (search) {
    query += ` AND (dh.ID_DonHang LIKE ? OR tk.HoTen LIKE ? OR tk.DienThoai LIKE ?)`;
    countQuery += ` AND (dh.ID_DonHang LIKE ? OR tk.HoTen LIKE ? OR tk.DienThoai LIKE ?)`;
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
    countParams.push(searchParam, searchParam, searchParam);
  }

  if (status && status !== "all") {
    query += ` AND dh.TrangThai = ?`;
    countQuery += ` AND dh.TrangThai = ?`;
    params.push(status);
    countParams.push(status);
  }

  if (priority && priority !== "all") {
    query += ` AND dh.MucDoUuTien = ?`;
    countQuery += ` AND dh.MucDoUuTien = ?`;
    params.push(priority);
    countParams.push(priority);
  }

  query += ` GROUP BY dh.ID_DonHang ORDER BY dh.NgayDat DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  const statsQuery = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN TrangThai IN ('Chờ xác nhận') THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN TrangThai IN ('Đã xác nhận', 'Đang chuẩn bị', 'Đang giao hàng') THEN 1 ELSE 0 END) as processing,
            SUM(CASE WHEN TrangThai = 'Đã giao hàng' THEN 1 ELSE 0 END) as completed
        FROM DonHang
    `;

  db.query(countQuery, countParams, (err, countResult) => {
    if (err) {
      console.error("Lỗi đếm đơn hàng:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    db.query(query, params, (err, orders) => {
      if (err) {
        console.error("Lỗi lấy đơn hàng:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      db.query(statsQuery, (err, statsResult) => {
        if (err) {
          console.error("Lỗi lấy thống kê:", err);
          return res
            .status(500)
            .json({ success: false, message: "Lỗi máy chủ" });
        }

        res.json({
          success: true,
          data: orders,
          total: countResult[0].total,
          page: parseInt(page),
          limit: parseInt(limit),
          stats: statsResult[0],
        });
      });
    });
  });
});

router.get("/orders/:id/details", (req, res) => {
  const { id } = req.params;

  const orderQuery = `
        SELECT 
            dh.*,
            tk.HoTen as TenKhachHang,
            tk.DienThoai as SoDienThoai,
            tk.DiaChi as DiaChiGiaoHang,
            tk.Gmail as EmailKhachHang
        FROM DonHang dh
        LEFT JOIN TaiKhoan tk ON dh.ID_TaiKhoan = tk.ID_TaiKhoan
        WHERE dh.ID_DonHang = ?
    `;

  const productsQuery = `
        SELECT 
            ctdh.*,
            sp.TenSP,
            sp.Gia
        FROM ChiTietDonHang ctdh
        JOIN SanPham sp ON ctdh.ID_SanPham = sp.ID_SanPham
        WHERE ctdh.ID_DonHang = ?
    `;

  const statusHistoryQuery = `
        SELECT *
        FROM LichSuTrangThaiDonHang
        WHERE ID_DonHang = ?
        ORDER BY ThoiGian DESC
    `;

  db.query(orderQuery, [id], (err, orderResult) => {
    if (err) {
      console.error("Lỗi lấy thông tin đơn hàng:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (orderResult.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    db.query(productsQuery, [id], (err, products) => {
      if (err) {
        console.error("Lỗi lấy sản phẩm:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      db.query(statusHistoryQuery, [id], (err, statusHistory) => {
        if (err) {
          console.error("Lỗi lấy lịch sử trạng thái:", err);
          statusHistory = [];
        }

        const orderData = {
          ...orderResult[0],
          SanPham: products,
          LichSuTrangThai: statusHistory,
        };

        res.json({
          success: true,
          data: orderData,
        });
      });
    });
  });
});

router.get("/orders/:id", (req, res) => {
  const { id } = req.params;

  const query = `
        SELECT 
            dh.*,
            tk.HoTen as TenKhachHang,
            tk.DienThoai as SoDienThoai
        FROM DonHang dh
        LEFT JOIN TaiKhoan tk ON dh.ID_TaiKhoan = tk.ID_TaiKhoan
        WHERE dh.ID_DonHang = ?
    `;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Lỗi lấy đơn hàng:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    res.json({
      success: true,
      data: result[0],
    });
  });
});

router.put("/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, priority, note } = req.body;

  const updateData = {
    TrangThai: status,
    NgayCapNhat: new Date(),
  };

  if (priority) {
    updateData.MucDoUuTien = priority;
  }

  const fields = Object.keys(updateData)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(updateData);
  values.push(id);

  const updateQuery = `UPDATE DonHang SET ${fields} WHERE ID_DonHang = ?`;

  db.query(updateQuery, values, (err, result) => {
    if (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    const historyQuery = `
            INSERT INTO LichSuTrangThaiDonHang (ID_DonHang, TrangThai, GhiChu, ThoiGian)
            VALUES (?, ?, ?, NOW())
        `;

    db.query(historyQuery, [id, status, note || null], (err) => {
      if (err) {
        console.error("Lỗi lưu lịch sử trạng thái:", err);
      }

      res.json({
        success: true,
        message: "Cập nhật trạng thái thành công",
      });
    });
  });
});

router.get("/orders/export", (req, res) => {
  const { search, status, format = "excel" } = req.query;

  let query = `
        SELECT 
            dh.ID_DonHang as 'Mã Đơn Hàng',
            tk.HoTen as 'Tên Khách Hàng',
            tk.DienThoai as 'Số Điện Thoại',
            dh.TongTien as 'Tổng Tiền',
            dh.TrangThai as 'Trạng Thái',
            dh.MucDoUuTien as 'Mức Độ Ưu Tiên',
            dh.NgayDat as 'Ngày Đặt',
            dh.NgayCapNhat as 'Ngày Cập Nhật'
        FROM DonHang dh
        LEFT JOIN TaiKhoan tk ON dh.ID_TaiKhoan = tk.ID_TaiKhoan
        WHERE 1=1
    `;

  let params = [];

  if (search) {
    query += ` AND (dh.ID_DonHang LIKE ? OR tk.HoTen LIKE ? OR tk.DienThoai LIKE ?)`;
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  if (status && status !== "all") {
    query += ` AND dh.TrangThai = ?`;
    params.push(status);
  }

  query += ` ORDER BY dh.NgayDat DESC`;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Lỗi xuất báo cáo:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (format === "excel") {
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=don-hang-" + Date.now() + ".xlsx"
      );

      const workbook = require("xlsx").utils.book_new();
      const worksheet = require("xlsx").utils.json_to_sheet(results);
      require("xlsx").utils.book_append_sheet(workbook, worksheet, "Đơn Hàng");
      const excelBuffer = require("xlsx").write(workbook, {
        bookType: "xlsx",
        type: "buffer",
      });

      res.send(excelBuffer);
    } else {
      res.json({
        success: true,
        data: results,
      });
    }
  });
});

router.get("/orders/stats/dashboard", (req, res) => {
  const queries = {
    total: "SELECT COUNT(*) as count FROM DonHang",
    today: `SELECT COUNT(*) as count FROM DonHang WHERE DATE(NgayDat) = CURDATE()`,
    thisWeek: `SELECT COUNT(*) as count FROM DonHang WHERE WEEK(NgayDat) = WEEK(NOW()) AND YEAR(NgayDat) = YEAR(NOW())`,
    thisMonth: `SELECT COUNT(*) as count FROM DonHang WHERE MONTH(NgayDat) = MONTH(NOW()) AND YEAR(NgayDat) = YEAR(NOW())`,
    byStatus: `
            SELECT TrangThai, COUNT(*) as count
            FROM DonHang
            GROUP BY TrangThai
        `,
    revenue: `
            SELECT 
                SUM(CASE WHEN TrangThai = 'Đã giao hàng' THEN TongTien ELSE 0 END) as totalRevenue,
                SUM(CASE WHEN TrangThai = 'Đã giao hàng' AND DATE(NgayDat) = CURDATE() THEN TongTien ELSE 0 END) as todayRevenue
            FROM DonHang
        `,
  };

  const results = {};
  const queryKeys = Object.keys(queries);
  let completed = 0;

  queryKeys.forEach((key) => {
    db.query(queries[key], (err, result) => {
      if (err) {
        console.error(`Lỗi thống kê ${key}:`, err);
        results[key] = null;
      } else {
        results[key] = result;
      }

      completed++;
      if (completed === queryKeys.length) {
        res.json({
          success: true,
          data: results,
        });
      }
    });
  });
});

module.exports = router;
