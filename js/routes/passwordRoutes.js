const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

const resetTokens = new Map();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email là bắt buộc' });
  }

  const query = 'SELECT ID_TaiKhoan FROM TaiKhoan WHERE Gmail = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Lỗi kiểm tra email:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với email này' });
    }

    const code = generateCode();
    const expires = Date.now() + 15 * 60 * 1000; // 15 phút
    resetTokens.set(email, { code, expires });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your_email@example.com',
        pass: process.env.EMAIL_PASS || 'your_email_password'
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || 'petcare@example.com',
      to: email,
      subject: 'Mã xác nhận đặt lại mật khẩu',
      text: `Mã xác nhận của bạn là: ${code}`
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Lỗi gửi email:', err);
        return res.status(500).json({ success: false, message: 'Không thể gửi email. Vui lòng thử lại sau.' });
      }
      res.json({ success: true, message: 'Mã xác nhận đã được gửi tới email của bạn' });
    });
  });
});

router.post('/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
  }

  const token = resetTokens.get(email);
  if (!token || token.code !== code || Date.now() > token.expires) {
    return res.status(400).json({ success: false, message: 'Mã xác nhận không hợp lệ hoặc đã hết hạn' });
  }

  const updateQuery = 'UPDATE TaiKhoan SET MatKhau = ? WHERE Gmail = ?';
  db.query(updateQuery, [newPassword, email], (err) => {
    if (err) {
      console.error('Lỗi cập nhật mật khẩu:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
    resetTokens.delete(email);
    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  });
});

module.exports = router;
