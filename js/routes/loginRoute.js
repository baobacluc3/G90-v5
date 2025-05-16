const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Thiếu email hoặc password' });
  }

  const query = 'SELECT * FROM TaiKhoan WHERE Gmail = ? AND MatKhau = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Lỗi login:', err);
      return res.status(500).json({ success: false, message: 'Lỗi database' });
    }

    if (results.length > 0) {
      const user = results[0];
      const role = user.ID_ChucVu === 1 ? 'admin' : 'user';
      return res.json({ 
        success: true, 
        user: { ...user, role } 
      });
    } else {
      return res.json({ success: false, message: 'Sai email hoặc password' });
    }
  });
});

router.post('/register', (req, res) => {
  const { hoTen, gmail, dienThoai, matKhau, chucVu } = req.body;

  if (!hoTen || !gmail || !matKhau) {
    return res.status(400).json({ 
      success: false, 
      message: 'Thiếu thông tin bắt buộc: Họ tên, email và mật khẩu' 
    });
  }

  const checkEmailQuery = 'SELECT ID_TaiKhoan FROM TaiKhoan WHERE Gmail = ?';
  db.query(checkEmailQuery, [gmail], (err, existing) => {
    if (err) {
      console.error('Lỗi kiểm tra email:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Lỗi kiểm tra email' 
      });
    }

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email này đã được sử dụng' 
      });
    }

    const insertQuery = `
      INSERT INTO TaiKhoan (HoTen, Gmail, DienThoai, MatKhau, ID_ChucVu) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.query(insertQuery, [
      hoTen, 
      gmail, 
      dienThoai || null, 
      matKhau, 
      chucVu || 3  
    ], (err, result) => {
      if (err) {
        console.error('Lỗi tạo tài khoản:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Lỗi tạo tài khoản' 
        });
      }

      console.log('Tạo tài khoản thành công, ID:', result.insertId);
      return res.json({ 
        success: true, 
        message: 'Đăng ký tài khoản thành công',
        userId: result.insertId
      });
    });
  });
});

module.exports = router;