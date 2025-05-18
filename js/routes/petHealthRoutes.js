const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/pet-health", (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;

  let query = `
    SELECT 
      tc.ID_ThuCung,
      tc.TenThuCung,
      tc.TenChuSoHuu,
      tc.Loai,
      tc.Giong,
      tc.Tuoi,
      tc.GioiTinh,
      tc.CanNang,
      tc.SoDienThoai,
      tc.DiaChi,
      tc.TrangThaiSucKhoe,
      tc.NgayCapNhatCuoi,
      COUNT(lsk.ID_LichSu) as SoLanKham
    FROM ThuCung tc
    LEFT JOIN LichSuSucKhoe lsk ON tc.ID_ThuCung = lsk.ID_ThuCung
    WHERE 1=1
  `;

  let countQuery = `
    SELECT COUNT(DISTINCT tc.ID_ThuCung) as total
    FROM ThuCung tc
    WHERE 1=1
  `;

  let params = [];
  let countParams = [];

  if (search) {
    const searchCondition = " AND (tc.TenThuCung LIKE ? OR tc.TenChuSoHuu LIKE ?)";
    query += searchCondition;
    countQuery += searchCondition;
    params.push(`%${search}%`, `%${search}%`);
    countParams.push(`%${search}%`, `%${search}%`);
  }

  if (status && status !== "all") {
    const statusCondition = " AND tc.TrangThaiSucKhoe = ?";
    query += statusCondition;
    countQuery += statusCondition;
    params.push(status);
    countParams.push(status);
  }

  query += ` 
    GROUP BY tc.ID_ThuCung 
    ORDER BY tc.NgayCapNhatCuoi DESC 
    LIMIT ? OFFSET ?
  `;
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  let statsQuery = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN TrangThaiSucKhoe = 'Khỏe mạnh' THEN 1 ELSE 0 END) as healthy,
      SUM(CASE WHEN TrangThaiSucKhoe = 'Cần theo dõi' THEN 1 ELSE 0 END) as needCheckup,
      SUM(CASE WHEN TrangThaiSucKhoe = 'Đang điều trị' THEN 1 ELSE 0 END) as treatment
    FROM ThuCung
  `;

  db.query(countQuery, countParams, (err, countResult) => {
    if (err) {
      console.error("Lỗi đếm thú cưng:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Lỗi lấy danh sách thú cưng:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      db.query(statsQuery, (err, statsResult) => {
        if (err) {
          console.error("Lỗi lấy thống kê:", err);
          return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
        }

        res.json({
          success: true,
          data: results,
          total: countResult[0].total,
          page: parseInt(page),
          limit: parseInt(limit),
          stats: statsResult[0]
        });
      });
    });
  });
});

router.get("/pet-health/:id", (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT * FROM ThuCung 
    WHERE ID_ThuCung = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Lỗi lấy thông tin thú cưng:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thú cưng" });
    }

    res.json({
      success: true,
      data: results[0]
    });
  });
});

router.post("/pet-health", (req, res) => {
  const {
    petName,
    ownerName,
    petSpecies,
    petBreed,
    petAge,
    petGender,
    petWeight,
    ownerPhone,
    ownerAddress
  } = req.body;

  if (!petName || !ownerName || !petSpecies || !petAge) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin bắt buộc: Tên thú cưng, chủ sở hữu, loài và tuổi"
    });
  }

  const query = `
    INSERT INTO ThuCung (
      TenThuCung, TenChuSoHuu, Loai, Giong, Tuoi, 
      GioiTinh, CanNang, SoDienThoai, DiaChi, TrangThaiSucKhoe
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Chưa cập nhật')
  `;

  db.query(query, [
    petName, ownerName, petSpecies, petBreed, petAge,
    petGender, petWeight, ownerPhone, ownerAddress
  ], (err, result) => {
    if (err) {
      console.error("Lỗi thêm thú cưng:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    res.json({
      success: true,
      message: "Thêm thú cưng thành công",
      id: result.insertId
    });
  });
});

router.put("/pet-health/:id", (req, res) => {
  const { id } = req.params;
  const {
    petName,
    ownerName,
    petSpecies,
    petBreed,
    petAge,
    petGender,
    petWeight,
    ownerPhone,
    ownerAddress
  } = req.body;

  const query = `
    UPDATE ThuCung SET
      TenThuCung = ?, TenChuSoHuu = ?, Loai = ?, Giong = ?,
      Tuoi = ?, GioiTinh = ?, CanNang = ?, SoDienThoai = ?, DiaChi = ?
    WHERE ID_ThuCung = ?
  `;

  db.query(query, [
    petName, ownerName, petSpecies, petBreed, petAge,
    petGender, petWeight, ownerPhone, ownerAddress, id
  ], (err, result) => {
    if (err) {
      console.error("Lỗi cập nhật thú cưng:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thú cưng" });
    }

    res.json({
      success: true,
      message: "Cập nhật thông tin thú cưng thành công"
    });
  });
});

router.delete("/pet-health/:id", (req, res) => {
  const { id } = req.params;

  const deleteHealthQuery = "DELETE FROM LichSuSucKhoe WHERE ID_ThuCung = ?";
  
  db.query(deleteHealthQuery, [id], (err) => {
    if (err) {
      console.error("Lỗi xóa lịch sử sức khỏe:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    const deletePetQuery = "DELETE FROM ThuCung WHERE ID_ThuCung = ?";
    
    db.query(deletePetQuery, [id], (err, result) => {
      if (err) {
        console.error("Lỗi xóa thú cưng:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Không tìm thấy thú cưng" });
      }

      res.json({
        success: true,
        message: "Xóa thú cưng thành công"
      });
    });
  });
});

router.post("/pet-health/:id/health", (req, res) => {
  const petId = req.params.id;
  const {
    healthStatus,
    checkupDate,
    temperature,
    weight,
    symptoms,
    diagnosis,
    treatment,
    nextCheckupDate,
    veterinarian,
    notes
  } = req.body;

  if (!healthStatus || !checkupDate) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin bắt buộc: Trạng thái sức khỏe và ngày khám"
    });
  }

  db.beginTransaction((err) => {
    if (err) {
      console.error("Lỗi bắt đầu transaction:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    const insertHealthQuery = `
      INSERT INTO LichSuSucKhoe (
        ID_ThuCung, NgayKham, TrangThaiSucKhoe, NhietDo, CanNang,
        TrieuChung, ChanDoan, PhuongPhapDieuTri, NgayTaiKham,
        BacSiPhuTrach, GhiChu
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertHealthQuery, [
      petId, checkupDate, healthStatus, temperature, weight,
      symptoms, diagnosis, treatment, nextCheckupDate,
      veterinarian, notes
    ], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error("Lỗi thêm lịch sử sức khỏe:", err);
          res.status(500).json({ success: false, message: "Lỗi máy chủ" });
        });
      }

      const updatePetQuery = `
        UPDATE ThuCung 
        SET TrangThaiSucKhoe = ?, NgayCapNhatCuoi = ?
        WHERE ID_ThuCung = ?
      `;

      db.query(updatePetQuery, [healthStatus, checkupDate, petId], (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Lỗi cập nhật trạng thái thú cưng:", err);
            res.status(500).json({ success: false, message: "Lỗi máy chủ" });
          });
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Lỗi commit transaction:", err);
              res.status(500).json({ success: false, message: "Lỗi máy chủ" });
            });
          }

          res.json({
            success: true,
            message: "Cập nhật sức khỏe thành công",
            healthRecordId: result.insertId
          });
        });
      });
    });
  });
});


router.get("/pet-health/:id/history", (req, res) => {
  const { id } = req.params;

  const petQuery = "SELECT * FROM ThuCung WHERE ID_ThuCung = ?";
  

  const historyQuery = `
    SELECT 
      lsk.*,
      DATE_FORMAT(lsk.NgayKham, '%Y-%m-%d') as NgayKham,
      DATE_FORMAT(lsk.NgayTaiKham, '%Y-%m-%d') as NgayTaiKham
    FROM LichSuSucKhoe lsk
    WHERE lsk.ID_ThuCung = ?
    ORDER BY lsk.NgayKham DESC
  `;

  db.query(petQuery, [id], (err, petResult) => {
    if (err) {
      console.error("Lỗi lấy thông tin thú cưng:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    if (petResult.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thú cưng" });
    }

    db.query(historyQuery, [id], (err, historyResult) => {
      if (err) {
        console.error("Lỗi lấy lịch sử sức khỏe:", err);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }

      res.json({
        success: true,
        pet: petResult[0],
        history: historyResult
      });
    });
  });
});

router.get("/pet-health/export", (req, res) => {
  const query = `
    SELECT 
      tc.TenThuCung as 'Tên Thú Cưng',
      tc.TenChuSoHuu as 'Chủ Sở Hữu',
      tc.Loai as 'Loài',
      tc.Giong as 'Giống',
      tc.Tuoi as 'Tuổi',
      tc.GioiTinh as 'Giới Tính',
      tc.CanNang as 'Cân Nặng (kg)',
      tc.SoDienThoai as 'Số Điện Thoại',
      tc.TrangThaiSucKhoe as 'Trạng Thái Sức Khỏe',
      tc.NgayCapNhatCuoi as 'Ngày Cập Nhật Cuối'
    FROM ThuCung tc
    ORDER BY tc.NgayCapNhatCuoi DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Lỗi xuất dữ liệu:", err);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }

    const headers = Object.keys(results[0] || {});
    let csvContent = headers.join(',') + '\n';
    
    results.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csvContent += values.join(',') + '\n';
    });

    res.json({
      success: true,
      data: csvContent
    });
  });
});

module.exports = router;