const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/users", (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  let query =
    "SELECT ID_TaiKhoan, HoTen, Gmail, DienThoai, ID_ChucVu, NamSinh FROM TaiKhoan";
  let countQuery = "SELECT COUNT(*) as total FROM TaiKhoan";
  let params = [];

  if (search) {
    query += " WHERE HoTen LIKE ?";
    countQuery += " WHERE HoTen LIKE ?";
    params.push(`%${search}%`);
  }

  query += " ORDER BY ID_TaiKhoan DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  db.query(countQuery, search ? [`%${search}%`] : [], (err, countResult) => {
    if (err) {
      console.error("Lỗi đếm users:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Lỗi lấy users:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      res.json({
        success: true,
        data: results,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    });
  });
});

router.post("/users", (req, res) => {
  const { hoTen, gmail, dienThoai, matKhau, chucVu } = req.body;

  db.query(
    "SELECT ID_TaiKhoan FROM TaiKhoan WHERE Gmail = ?",
    [gmail],
    (err, existing) => {
      if (err) {
        console.error("Lỗi kiểm tra email:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      if (existing.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Email đã tồn tại" });
      }

      const query =
        "INSERT INTO TaiKhoan (HoTen, Gmail, DienThoai, MatKhau, ID_ChucVu) VALUES (?, ?, ?, ?, ?)";
      db.query(
        query,
        [hoTen, gmail, dienThoai, matKhau, chucVu || 3],
        (err, result) => {
          if (err) {
            console.error("Lỗi thêm user:", err);
            return res
              .status(500)
              .json({ success: false, message: "Lỗi máy chủ" });
          }
          res.json({
            success: true,
            message: "Thêm người dùng thành công",
            id: result.insertId,
          });
        }
      );
    }
  );
});

router.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { hoTen, gmail, dienThoai, chucVu } = req.body;

  const query =
    "UPDATE TaiKhoan SET HoTen = ?, Gmail = ?, DienThoai = ?, ID_ChucVu = ? WHERE ID_TaiKhoan = ?";
  db.query(query, [hoTen, gmail, dienThoai, chucVu, id], (err, result) => {
    if (err) {
      console.error("Lỗi cập nhật user:", err);
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

router.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM TaiKhoan WHERE ID_TaiKhoan = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Lỗi xóa user:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    res.json({ success: true, message: "Xóa thành công" });
  });
});

router.get("/users/roles", (req, res) => {
  const query = `
    SELECT tk.ID_TaiKhoan, tk.HoTen, tk.Gmail, cv.TenCV as role_name, tk.ID_ChucVu
    FROM TaiKhoan tk
    LEFT JOIN ChucVu cv ON tk.ID_ChucVu = cv.ID_ChucVu
    ORDER BY tk.ID_TaiKhoan DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Lỗi lấy danh sách roles:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
    res.json({ success: true, data: results });
  });
});

router.put("/users/:id/role", (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  let roleId = 3;
  if (role === "admin") roleId = 1;
  else if (role === "manager") roleId = 2;

  const query = "UPDATE TaiKhoan SET ID_ChucVu = ? WHERE ID_TaiKhoan = ?";
  db.query(query, [roleId, id], (err, result) => {
    if (err) {
      console.error("Lỗi cập nhật role:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
    res.json({ success: true, message: "Cập nhật quyền thành công" });
  });
});

router.get("/appointments", (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;

  let query = `
    SELECT 
      lh.*,
      tk.HoTen as userName,
      DATE_FORMAT(lh.Ngay, '%Y-%m-%d') as Ngay,
      DATE_FORMAT(lh.ThoiGianDat, '%Y-%m-%d %H:%i:%s') as ThoiGianDat
    FROM LichSuDatLich lh
    LEFT JOIN TaiKhoan tk ON lh.ID_TaiKhoan = tk.ID_TaiKhoan
    WHERE 1=1
  `;
  let countQuery = `
    SELECT COUNT(*) as total
    FROM LichSuDatLich lh
    LEFT JOIN TaiKhoan tk ON lh.ID_TaiKhoan = tk.ID_TaiKhoan
    WHERE 1=1
  `;
  let params = [];
  let countParams = [];

  if (search) {
    query +=
      " AND (lh.HoTen LIKE ? OR lh.TenThuCung LIKE ? OR tk.HoTen LIKE ?)";
    countQuery +=
      " AND (lh.HoTen LIKE ? OR lh.TenThuCung LIKE ? OR tk.HoTen LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (status && status !== "all") {
    query += " AND lh.TrangThai = ?";
    countQuery += " AND lh.TrangThai = ?";
    params.push(status);
    countParams.push(status);
  }

  query += " ORDER BY lh.ThoiGianDat DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  db.query(countQuery, countParams, (err, countResult) => {
    if (err) {
      console.error("Lỗi đếm appointments:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Lỗi lấy appointments:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      res.json({
        success: true,
        data: results,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    });
  });
});

router.post("/appointments", (req, res) => {
  const {
    hoTen,
    soDienThoai,
    dichVu,
    chiNhanh,
    tenThuCung,
    ngay,
    gio,
    ghiChu,
    idTaiKhoan,
  } = req.body;

  if (
    !hoTen ||
    !soDienThoai ||
    !dichVu ||
    !chiNhanh ||
    !tenThuCung ||
    !ngay ||
    !gio
  ) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin bắt buộc",
    });
  }

  const query = `
    INSERT INTO LichSuDatLich 
    (HoTen, SoDienThoai, DichVu, ChiNhanh, TenThuCung, Ngay, Gio, GhiChu, ID_TaiKhoan, TrangThai) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Chờ xác nhận')
  `;

  db.query(
    query,
    [
      hoTen,
      soDienThoai,
      dichVu,
      chiNhanh,
      tenThuCung,
      ngay,
      gio,
      ghiChu || null,
      idTaiKhoan || null,
    ],
    (err, result) => {
      if (err) {
        console.error("Lỗi thêm lịch hẹn:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      console.log(
        `Đặt lịch thành công - ID: ${result.insertId}, Khách hàng: ${hoTen}, Dịch vụ: ${dichVu}`
      );

      res.json({
        success: true,
        message: "Đặt lịch thành công",
        id: result.insertId,
      });
    }
  );
});

router.put("/appointments/:id", (req, res) => {
  const { id } = req.params;
  const {
    hoTen,
    soDienThoai,
    dichVu,
    chiNhanh,
    tenThuCung,
    ngay,
    gio,
    ghiChu,
  } = req.body;

  const query = `
    UPDATE LichSuDatLich 
    SET HoTen = ?, SoDienThoai = ?, DichVu = ?, ChiNhanh = ?, TenThuCung = ?, Ngay = ?, Gio = ?, GhiChu = ?
    WHERE ID_LichSu = ?
  `;

  db.query(
    query,
    [hoTen, soDienThoai, dichVu, chiNhanh, tenThuCung, ngay, gio, ghiChu, id],
    (err, result) => {
      if (err) {
        console.error("Lỗi cập nhật lịch hẹn:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy lịch hẹn" });
      }

      res.json({ success: true, message: "Cập nhật thành công" });
    }
  );
});

router.put("/appointments/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["Chờ xác nhận", "Đã xác nhận", "Hoàn thành", "Đã hủy"];
  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Trạng thái không hợp lệ" });
  }

  const query = "UPDATE LichSuDatLich SET TrangThai = ? WHERE ID_LichSu = ?";
  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lịch hẹn" });
    }

    res.json({ success: true, message: "Cập nhật trạng thái thành công" });
  });
});

router.delete("/appointments/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM LichSuDatLich WHERE ID_LichSu = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Lỗi xóa lịch hẹn:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lịch hẹn" });
    }

    res.json({ success: true, message: "Xóa thành công" });
  });
});

router.get("/appointments/stats", (req, res) => {
  const query = `
    SELECT 
      TrangThai,
      COUNT(*) as count
    FROM LichSuDatLich
    GROUP BY TrangThai
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Lỗi lấy thống kê lịch hẹn:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    res.json({ success: true, data: results });
  });
});

router.get("/roles", (req, res) => {
  const query = 'SELECT * FROM ChucVu WHERE TrangThai = "Hoạt động"';
  db.query(query, (err, results) => {
    if (err) {
      console.error("Lỗi lấy danh sách chức vụ:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
    res.json({ success: true, data: results });
  });
});

router.get("/categories", (req, res) => {
  const query = "SELECT * FROM DonMucSP ORDER BY ID_DonMuc DESC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Lỗi lấy danh mục:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
    res.json({ success: true, data: results });
  });
});

router.post("/categories", (req, res) => {
  const { name, description } = req.body;
  const query =
    'INSERT INTO DonMucSP (TenDonMuc, MoTa, TrangThai) VALUES (?, ?, "Hoạt động")';
  db.query(query, [name, description], (err, result) => {
    if (err) {
      console.error("Lỗi thêm danh mục:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
    res.json({
      success: true,
      message: "Thêm danh mục thành công",
      id: result.insertId,
    });
  });
});

//category

router.get("/inventory", (req, res) => {
  const { search, category, page = 1, limit = 10 } = req.query;

  let query = `
        SELECT sp.*, dm.TenDonMuc 
        FROM SanPham sp
        LEFT JOIN DonMucSP dm ON sp.ID_DonMuc = dm.ID_DonMuc
        WHERE 1=1
    `;
  let countQuery = `
        SELECT COUNT(*) as total,
        SUM(CASE WHEN sp.SoLuong < 10 THEN 1 ELSE 0 END) as lowStockItems,
        SUM(CASE WHEN sp.SoLuong = 0 THEN 1 ELSE 0 END) as outOfStockItems,
        SUM(sp.Gia * sp.SoLuong) as totalValue
        FROM SanPham sp
        WHERE 1=1
    `;
  let params = [];
  let countParams = [];

  if (search) {
    query += " AND sp.TenSP LIKE ?";
    countQuery += " AND sp.TenSP LIKE ?";
    params.push(`%${search}%`);
    countParams.push(`%${search}%`);
  }

  if (category) {
    query += " AND sp.ID_DonMuc = ?";
    countQuery += " AND sp.ID_DonMuc = ?";
    params.push(category);
    countParams.push(category);
  }

  query += " ORDER BY sp.ID_SanPham DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  db.query(countQuery, countParams, (err, countResult) => {
    if (err) {
      console.error("Lỗi đếm inventory:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Lỗi lấy inventory:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      res.json({
        success: true,
        data: results,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        stats: {
          totalItems: countResult[0].total,
          lowStockItems: countResult[0].lowStockItems,
          outOfStockItems: countResult[0].outOfStockItems,
          totalValue: countResult[0].totalValue,
        },
      });
    });
  });
});

// Get single product
router.get("/inventory/:id", (req, res) => {
  const { id } = req.params;

  const query = `
        SELECT sp.*, dm.TenDonMuc 
        FROM SanPham sp
        LEFT JOIN DonMucSP dm ON sp.ID_DonMuc = dm.ID_DonMuc
        WHERE sp.ID_SanPham = ?
    `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Lỗi lấy sản phẩm:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    res.json({ success: true, data: results[0] });
  });
});

// Create new product
router.post("/inventory", (req, res) => {
  const { TenSP, MoTa, ID_DonMuc, Gia, SoLuong, TrangThai } = req.body;

  if (!TenSP || !Gia || SoLuong === undefined) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin bắt buộc: Tên sản phẩm, giá và số lượng",
    });
  }

  const query = `
        INSERT INTO SanPham (TenSP, MoTa, ID_DonMuc, Gia, SoLuong, TrangThai) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

  db.query(
    query,
    [TenSP, MoTa, ID_DonMuc || null, Gia, SoLuong, TrangThai || "Còn hàng"],
    (err, result) => {
      if (err) {
        console.error("Lỗi thêm sản phẩm:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      res.json({
        success: true,
        message: "Thêm sản phẩm thành công",
        id: result.insertId,
      });
    }
  );
});

// Update product
router.put("/inventory/:id", (req, res) => {
  const { id } = req.params;
  const { TenSP, MoTa, ID_DonMuc, Gia, SoLuong, TrangThai } = req.body;

  const query = `
        UPDATE SanPham 
        SET TenSP = ?, MoTa = ?, ID_DonMuc = ?, Gia = ?, SoLuong = ?, TrangThai = ?
        WHERE ID_SanPham = ?
    `;

  db.query(
    query,
    [TenSP, MoTa, ID_DonMuc || null, Gia, SoLuong, TrangThai, id],
    (err, result) => {
      if (err) {
        console.error("Lỗi cập nhật sản phẩm:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy sản phẩm" });
      }

      res.json({ success: true, message: "Cập nhật thành công" });
    }
  );
});

// Update stock
router.put("/inventory/:id/stock", (req, res) => {
  const { id } = req.params;
  const { type, change, note } = req.body;

  db.query(
    "SELECT SoLuong FROM SanPham WHERE ID_SanPham = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("Lỗi lấy tồn kho:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy sản phẩm" });
      }

      let currentStock = results[0].SoLuong;
      let newStock = currentStock;

      switch (type) {
        case "in":
          newStock = currentStock + Math.abs(change);
          break;
        case "out":
          newStock = Math.max(0, currentStock - Math.abs(change));
          break;
        case "adjust":
          newStock = Math.max(0, change);
          break;
        default:
          return res
            .status(400)
            .json({ success: false, message: "Loại cập nhật không hợp lệ" });
      }

      // Update stock
      const updateQuery = "UPDATE SanPham SET SoLuong = ? WHERE ID_SanPham = ?";
      db.query(updateQuery, [newStock, id], (err, result) => {
        if (err) {
          console.error("Lỗi cập nhật tồn kho:", err);
          return res
            .status(500)
            .json({ success: false, message: "Lỗi máy chủ" });
        }

        res.json({
          success: true,
          message: "Cập nhật tồn kho thành công",
          oldStock: currentStock,
          newStock: newStock,
        });
      });
    }
  );
});

// Delete product
router.delete("/inventory/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM SanPham WHERE ID_SanPham = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Lỗi xóa sản phẩm:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    res.json({ success: true, message: "Xóa thành công" });
  });
});

router.get("/inventory/export", (req, res) => {
  const query = `
        SELECT sp.ID_SanPham, sp.TenSP, dm.TenDonMuc, sp.SoLuong, sp.Gia, sp.TrangThai
        FROM SanPham sp
        LEFT JOIN DonMucSP dm ON sp.ID_DonMuc = dm.ID_DonMuc
        ORDER BY sp.ID_SanPham
    `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Lỗi xuất dữ liệu:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    let csvContent = "Mã SP,Tên Sản Phẩm,Danh Mục,Số Lượng,Giá,Trạng Thái\n";
    results.forEach((item) => {
      csvContent += `${item.ID_SanPham},"${item.TenSP}","${
        item.TenDonMuc || ""
      }",${item.SoLuong},${item.Gia},"${item.TrangThai}"\n`;
    });

    res.json({ success: true, data: csvContent });
  });
});

router.get("/orders/process", (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;

  let query = `
    SELECT dh.*, tk.HoTen
    FROM DonHang dh
    LEFT JOIN TaiKhoan tk ON dh.ID_TaiKhoan = tk.ID_TaiKhoan
    WHERE 1=1
  `;

  let countQuery = `
    SELECT COUNT(*) as total
    FROM DonHang dh
    LEFT JOIN TaiKhoan tk ON dh.ID_TaiKhoan = tk.ID_TaiKhoan
    WHERE 1=1
  `;

  let params = [];
  let countParams = [];

  if (search) {
    query += " AND (dh.ID_DonHang LIKE ? OR tk.HoTen LIKE ?)";
    countQuery += " AND (dh.ID_DonHang LIKE ? OR tk.HoTen LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
    countParams.push(`%${search}%`, `%${search}%`);
  }

  if (status && status !== "all") {
    query += " AND dh.TrangThai = ?";
    countQuery += " AND dh.TrangThai = ?";
    params.push(status);
    countParams.push(status);
  }

  query += " ORDER BY dh.NgayDat DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  db.query(countQuery, countParams, (err, countResult) => {
    if (err) {
      console.error("Lỗi đếm đơn hàng:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Lỗi lấy đơn hàng:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      res.json({
        success: true,
        data: results,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    });
  });
});

router.get("/orders/:id", (req, res) => {
  const { id } = req.params;

  const orderQuery = `
    SELECT dh.*, tk.HoTen, tk.DienThoai, tk.DiaChi 
    FROM DonHang dh
    LEFT JOIN TaiKhoan tk ON dh.ID_TaiKhoan = tk.ID_TaiKhoan
    WHERE dh.ID_DonHang = ?
  `;

  const itemsQuery = `
    SELECT ct.*, sp.TenSP
    FROM ChiTietDonHang ct
    JOIN SanPham sp ON ct.ID_SanPham = sp.ID_SanPham
    WHERE ct.ID_DonHang = ?
  `;

  db.query(orderQuery, [id], (err, orderResults) => {
    if (err) {
      console.error("Lỗi lấy thông tin đơn hàng:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (orderResults.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    db.query(itemsQuery, [id], (err, itemResults) => {
      if (err) {
        console.error("Lỗi lấy thông tin sản phẩm đơn hàng:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      res.json({
        success: true,
        data: orderResults[0],
        items: itemResults,
      });
    });
  });
});

router.put("/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin trạng thái" });
  }

  const query = "UPDATE DonHang SET TrangThai = ? WHERE ID_DonHang = ?";
  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error("Lỗi cập nhật trạng thái đơn hàng:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
    });
  });
});

router.put("/orders/:id/cancel", (req, res) => {
  const { id } = req.params;

  const query = "UPDATE DonHang SET TrangThai = 'Đã hủy' WHERE ID_DonHang = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Lỗi hủy đơn hàng:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    res.json({ success: true, message: "Hủy đơn hàng thành công" });
  });
});

// Payment routes
router.get("/payments", (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;
  let query = `
    SELECT p.*, i.ID_HoaDon as invoiceId
    FROM ThanhToan p
    LEFT JOIN HoaDon i ON p.ID_HoaDon = i.ID_HoaDon
    WHERE 1=1
  `;
  let countQuery = `
    SELECT COUNT(*) as total
    FROM ThanhToan p
    LEFT JOIN HoaDon i ON p.ID_HoaDon = i.ID_HoaDon
    WHERE 1=1
  `;
  let params = [];
  let countParams = [];

  if (search) {
    query += " AND (i.ID_HoaDon LIKE ? OR p.ID_ThanhToan LIKE ?)";
    countQuery += " AND (i.ID_HoaDon LIKE ? OR p.ID_ThanhToan LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
    countParams.push(`%${search}%`, `%${search}%`);
  }

  if (status && status !== "all") {
    query += " AND p.TrangThai = ?";
    countQuery += " AND p.TrangThai = ?";
    params.push(status);
    countParams.push(status);
  }

  query += " ORDER BY p.NgayThanhToan DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  db.query(countQuery, countParams, (err, countResult) => {
    if (err) {
      console.error("Lỗi đếm payments:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Lỗi lấy payments:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      const formattedResults = results.map((payment) => ({
        id: payment.ID_ThanhToan,
        invoiceId: payment.invoiceId,
        amount: payment.SoTien,
        paymentMethod: payment.PhuongThuc,
        status: payment.TrangThai,
        paymentDate: payment.NgayThanhToan,
      }));

      res.json({
        success: true,
        data: formattedResults,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    });
  });
});

router.get("/payments/:id", (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT p.*, i.ID_HoaDon as invoiceId, i.TongTien as totalAmount, 
           c.HoTen as customerName, c.Gmail as customerEmail, c.DienThoai as customerPhone
    FROM ThanhToan p
    LEFT JOIN HoaDon i ON p.ID_HoaDon = i.ID_HoaDon
    LEFT JOIN TaiKhoan c ON i.ID_TaiKhoan = c.ID_TaiKhoan
    WHERE p.ID_ThanhToan = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Lỗi lấy chi tiết payment:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy thanh toán" });
    }

    const itemsQuery = `
      SELECT sp.TenSP as name, ct.SoLuong as quantity, ct.Gia as price
      FROM ChiTietHoaDon ct
      LEFT JOIN SanPham sp ON ct.ID_SanPham = sp.ID_SanPham
      WHERE ct.ID_HoaDon = ?
    `;

    db.query(itemsQuery, [results[0].ID_HoaDon], (err, itemResults) => {
      if (err) {
        console.error("Lỗi lấy chi tiết hóa đơn:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      const payment = results[0];
      const formattedPayment = {
        id: payment.ID_ThanhToan,
        invoiceId: payment.invoiceId,
        amount: payment.SoTien,
        paymentMethod: payment.PhuongThuc,
        status: payment.TrangThai,
        paymentDate: payment.NgayThanhToan,
        customerName: payment.customerName,
        customerEmail: payment.customerEmail,
        customerPhone: payment.customerPhone,
        items: itemResults.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      res.json({ success: true, data: formattedPayment });
    });
  });
});

router.put("/payments/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin trạng thái" });
  }

  const query = "UPDATE ThanhToan SET TrangThai = ? WHERE ID_ThanhToan = ?";
  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error("Lỗi cập nhật trạng thái thanh toán:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy thanh toán" });
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái thanh toán thành công",
    });
  });
});

// Delete payment
router.delete("/payments/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM ThanhToan WHERE ID_ThanhToan = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Lỗi xóa thanh toán:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy thanh toán" });
    }

    res.json({ success: true, message: "Xóa thanh toán thành công" });
  });
});

router.get("/customers", (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  let query = `
    SELECT 
      kh.ID_KhachHang, 
      kh.HoTen, 
      kh.Email, 
      kh.DienThoai, 
      COUNT(DISTINCT dh.ID_DonHang) AS TongDonHang,
      IFNULL(SUM(dh.TongTien), 0) AS TongThanhToan
    FROM KhachHang kh
    LEFT JOIN TaiKhoan tk ON kh.Email = tk.Gmail
    LEFT JOIN DonHang dh ON tk.ID_TaiKhoan = dh.ID_TaiKhoan
  `;

  let countQuery = "SELECT COUNT(*) as total FROM KhachHang";
  let params = [];
  let groupBy = " GROUP BY kh.ID_KhachHang";

  if (search) {
    query += " WHERE kh.HoTen LIKE ? OR kh.Email LIKE ? OR kh.DienThoai LIKE ?";
    countQuery += " WHERE HoTen LIKE ? OR Email LIKE ? OR DienThoai LIKE ?";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += groupBy + " ORDER BY kh.ID_KhachHang DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  db.query(
    countQuery,
    search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [],
    (err, countResult) => {
      if (err) {
        console.error("Lỗi đếm khách hàng:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      db.query(query, params, (err, results) => {
        if (err) {
          console.error("Lỗi lấy danh sách khách hàng:", err);
          return res
            .status(500)
            .json({ success: false, message: "Lỗi máy chủ" });
        }

        res.json({
          success: true,
          data: results,
          total: countResult[0].total,
          page: parseInt(page),
          limit: parseInt(limit),
        });
      });
    }
  );
});

router.get("/customers/:id", (req, res) => {
  const { id } = req.params;
  const customerQuery = "SELECT * FROM KhachHang WHERE ID_KhachHang = ?";

  db.query(customerQuery, [id], (err, customerResults) => {
    if (err) {
      console.error("Lỗi lấy thông tin khách hàng:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (customerResults.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khách hàng" });
    }

    const customer = customerResults[0];

    const ordersQuery = `
      SELECT ID_DonHang, NgayDat, TongTien, TrangThai
      FROM DonHang
      WHERE ID_KhachHang = ?
      ORDER BY NgayDat DESC
      LIMIT 5
    `;

    db.query(ordersQuery, [id], (err, orderResults) => {
      if (err) {
        console.error("Lỗi lấy đơn hàng của khách hàng:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      customer.DonHang = orderResults;

      res.json({
        success: true,
        data: customer,
      });
    });
  });
});

router.post("/customers", (req, res) => {
  const { hoTen, email, dienThoai, diaChi } = req.body;

  if (!hoTen || !email) {
    return res
      .status(400)
      .json({ success: false, message: "Họ tên và email là bắt buộc" });
  }

  db.query(
    "SELECT ID_KhachHang FROM KhachHang WHERE Email = ?",
    [email],
    (err, existing) => {
      if (err) {
        console.error("Lỗi kiểm tra email:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      if (existing.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Email đã tồn tại" });
      }

      const query = `
      INSERT INTO KhachHang (HoTen, Email, DienThoai, DiaChi, NgayTao)
      VALUES (?, ?, ?, ?, NOW())
    `;

      db.query(query, [hoTen, email, dienThoai, diaChi], (err, result) => {
        if (err) {
          console.error("Lỗi thêm khách hàng:", err);
          return res
            .status(500)
            .json({ success: false, message: "Lỗi máy chủ" });
        }

        res.json({
          success: true,
          message: "Thêm khách hàng thành công",
          id: result.insertId,
        });
      });
    }
  );
});

router.put("/customers/:id", (req, res) => {
  const { id } = req.params;
  const { hoTen, email, dienThoai, diaChi } = req.body;

  if (!hoTen || !email) {
    return res
      .status(400)
      .json({ success: false, message: "Họ tên và email là bắt buộc" });
  }

  const query = `
    UPDATE KhachHang
    SET HoTen = ?, Email = ?, DienThoai = ?, DiaChi = ?
    WHERE ID_KhachHang = ?
  `;

  db.query(query, [hoTen, email, dienThoai, diaChi, id], (err, result) => {
    if (err) {
      console.error("Lỗi cập nhật khách hàng:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khách hàng" });
    }

    res.json({
      success: true,
      message: "Cập nhật khách hàng thành công",
    });
  });
});

router.delete("/customers/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM KhachHang WHERE ID_KhachHang = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Lỗi xóa khách hàng:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khách hàng" });
    }

    res.json({
      success: true,
      message: "Xóa khách hàng thành công",
    });
  });
});

module.exports = router;
