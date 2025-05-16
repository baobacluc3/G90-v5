const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/users', (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  let query = 'SELECT ID_TaiKhoan, HoTen, Gmail, DienThoai, ID_ChucVu, NamSinh FROM TaiKhoan';
  let countQuery = 'SELECT COUNT(*) as total FROM TaiKhoan';
  let params = [];

  if (search) {
    query += ' WHERE HoTen LIKE ?';
    countQuery += ' WHERE HoTen LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY ID_TaiKhoan DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  db.query(countQuery, search ? [`%${search}%`] : [], (err, countResult) => {
    if (err) {
      console.error('Lỗi đếm users:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }

    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Lỗi lấy users:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
      }

      res.json({
        success: true,
        data: results,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    });
  });
});

router.post('/users', (req, res) => {
  const { hoTen, gmail, dienThoai, matKhau, chucVu } = req.body;

  db.query('SELECT ID_TaiKhoan FROM TaiKhoan WHERE Gmail = ?', [gmail], (err, existing) => {
    if (err) {
      console.error('Lỗi kiểm tra email:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
    }

    const query = 'INSERT INTO TaiKhoan (HoTen, Gmail, DienThoai, MatKhau, ID_ChucVu) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [hoTen, gmail, dienThoai, matKhau, chucVu || 3], (err, result) => {
      if (err) {
        console.error('Lỗi thêm user:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
      }
      res.json({ success: true, message: 'Thêm người dùng thành công', id: result.insertId });
    });
  });
});

router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { hoTen, gmail, dienThoai, chucVu } = req.body;

  const query = 'UPDATE TaiKhoan SET HoTen = ?, Gmail = ?, DienThoai = ?, ID_ChucVu = ? WHERE ID_TaiKhoan = ?';
  db.query(query, [hoTen, gmail, dienThoai, chucVu, id], (err, result) => {
    if (err) {
      console.error('Lỗi cập nhật user:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.json({ success: true, message: 'Cập nhật thành công' });
  });
});

router.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM TaiKhoan WHERE ID_TaiKhoan = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Lỗi xóa user:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.json({ success: true, message: 'Xóa thành công' });
  });
});

router.get('/users/roles', (req, res) => {
  const query = `
    SELECT tk.ID_TaiKhoan, tk.HoTen, tk.Gmail, cv.TenCV as role_name, tk.ID_ChucVu
    FROM TaiKhoan tk
    LEFT JOIN ChucVu cv ON tk.ID_ChucVu = cv.ID_ChucVu
    ORDER BY tk.ID_TaiKhoan DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Lỗi lấy danh sách roles:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
    res.json({ success: true, data: results });
  });
});

router.put('/users/:id/role', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;


  let roleId = 3;
  if (role === 'admin') roleId = 1;
  else if (role === 'manager') roleId = 2;

  const query = 'UPDATE TaiKhoan SET ID_ChucVu = ? WHERE ID_TaiKhoan = ?';
  db.query(query, [roleId, id], (err, result) => {
    if (err) {
      console.error('Lỗi cập nhật role:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
    res.json({ success: true, message: 'Cập nhật quyền thành công' });
  });
});


router.get('/appointments', (req, res) => {
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
    query += ' AND (lh.HoTen LIKE ? OR lh.TenThuCung LIKE ? OR tk.HoTen LIKE ?)';
    countQuery += ' AND (lh.HoTen LIKE ? OR lh.TenThuCung LIKE ? OR tk.HoTen LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (status && status !== 'all') {
    query += ' AND lh.TrangThai = ?';
    countQuery += ' AND lh.TrangThai = ?';
    params.push(status);
    countParams.push(status);
  }

  query += ' ORDER BY lh.ThoiGianDat DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  db.query(countQuery, countParams, (err, countResult) => {
    if (err) {
      console.error('Lỗi đếm appointments:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }

    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Lỗi lấy appointments:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
      }

      res.json({
        success: true,
        data: results,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    });
  });
});

router.post('/appointments', (req, res) => {
  const {
    hoTen,
    soDienThoai,
    dichVu,
    chiNhanh,
    tenThuCung,
    ngay,
    gio,
    ghiChu,
    idTaiKhoan
  } = req.body;

  if (!hoTen || !soDienThoai || !dichVu || !chiNhanh || !tenThuCung || !ngay || !gio) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu thông tin bắt buộc'
    });
  }

  const query = `
    INSERT INTO LichSuDatLich 
    (HoTen, SoDienThoai, DichVu, ChiNhanh, TenThuCung, Ngay, Gio, GhiChu, ID_TaiKhoan, TrangThai) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Chờ xác nhận')
  `;

  db.query(query, [
    hoTen,
    soDienThoai,
    dichVu,
    chiNhanh,
    tenThuCung,
    ngay,
    gio,
    ghiChu || null,
    idTaiKhoan || null
  ], (err, result) => {
    if (err) {
      console.error('Lỗi thêm lịch hẹn:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }

    console.log(`Đặt lịch thành công - ID: ${result.insertId}, Khách hàng: ${hoTen}, Dịch vụ: ${dichVu}`);

    res.json({
      success: true,
      message: 'Đặt lịch thành công',
      id: result.insertId
    });
  });
});

router.put('/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { hoTen, soDienThoai, dichVu, chiNhanh, tenThuCung, ngay, gio, ghiChu } = req.body;

  const query = `
    UPDATE LichSuDatLich 
    SET HoTen = ?, SoDienThoai = ?, DichVu = ?, ChiNhanh = ?, TenThuCung = ?, Ngay = ?, Gio = ?, GhiChu = ?
    WHERE ID_LichSu = ?
  `;

  db.query(query, [hoTen, soDienThoai, dichVu, chiNhanh, tenThuCung, ngay, gio, ghiChu, id], (err, result) => {
    if (err) {
      console.error('Lỗi cập nhật lịch hẹn:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch hẹn' });
    }

    res.json({ success: true, message: 'Cập nhật thành công' });
  });
});

router.put('/appointments/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Chờ xác nhận', 'Đã xác nhận', 'Hoàn thành', 'Đã hủy'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
  }

  const query = 'UPDATE LichSuDatLich SET TrangThai = ? WHERE ID_LichSu = ?';
  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch hẹn' });
    }

    res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
  });
});

router.delete('/appointments/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM LichSuDatLich WHERE ID_LichSu = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Lỗi xóa lịch hẹn:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch hẹn' });
    }

    res.json({ success: true, message: 'Xóa thành công' });
  });
});

router.get('/appointments/stats', (req, res) => {
  const query = `
    SELECT 
      TrangThai,
      COUNT(*) as count
    FROM LichSuDatLich
    GROUP BY TrangThai
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Lỗi lấy thống kê lịch hẹn:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }

    res.json({ success: true, data: results });
  });
});

router.get('/roles', (req, res) => {
  const query = 'SELECT * FROM ChucVu WHERE TrangThai = "Hoạt động"';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Lỗi lấy danh sách chức vụ:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
    res.json({ success: true, data: results });
  });
});

router.get('/categories', (req, res) => {
  const query = 'SELECT * FROM DonMucSP ORDER BY ID_DonMuc DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Lỗi lấy danh mục:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
    res.json({ success: true, data: results });
  });
});

router.post('/categories', (req, res) => {
  const { name, description } = req.body;
  const query = 'INSERT INTO DonMucSP (TenDonMuc, MoTa, TrangThai) VALUES (?, ?, "Hoạt động")';
  db.query(query, [name, description], (err, result) => {
    if (err) {
      console.error('Lỗi thêm danh mục:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
    res.json({ success: true, message: 'Thêm danh mục thành công', id: result.insertId });
  });
});

module.exports = router;