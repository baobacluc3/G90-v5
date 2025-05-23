CREATE DATABASE IF NOT EXISTS petcare;
USE petcare;

CREATE TABLE ChucVu (
    ID_ChucVu INT AUTO_INCREMENT PRIMARY KEY,
    TenCV Varchar(100),
    MoTaCV Varchar(255),
    TrangThai Varchar(20)
);

CREATE TABLE TaiKhoan (
    ID_TaiKhoan INT AUTO_INCREMENT PRIMARY KEY,
    HoTen Varchar(100) NOT NULL,
    NamSinh DateTime,
    GioiTinh INT(11),
    DiaChi Varchar(100),
    DienThoai Varchar(15),
    Gmail Varchar(100) NOT NULL UNIQUE,
    ID_ChucVu INT DEFAULT 3,
    TenDangNhap Varchar(100),
    MatKhau Varchar(255) NOT NULL,
    TrangThai Varchar(20) DEFAULT 'Hoạt động',
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_ChucVu) REFERENCES ChucVu(ID_ChucVu)
);

CREATE TABLE DonMucSP (
    ID_DonMuc INT AUTO_INCREMENT PRIMARY KEY,
    TenDonMuc Varchar(50),
    MoTa Text,
    TrangThai Varchar(20)
);

CREATE TABLE SanPham (
    ID_SanPham INT AUTO_INCREMENT PRIMARY KEY,
    TenSP Varchar(200),  
    MoTa Text,
    Gia Decimal(10,2),
    SoLuong INT(11),
    ID_DonMuc INT,
    TrangThai Varchar(20),
    FOREIGN KEY (ID_DonMuc) REFERENCES DonMucSP(ID_DonMuc)
);

CREATE TABLE LichSuDatLich (
    ID_LichSu INT AUTO_INCREMENT PRIMARY KEY,
    HoTen VARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(15),
    DichVu VARCHAR(100),
    ChiNhanh VARCHAR(100),
    TenThuCung VARCHAR(50),
    Ngay DATE,
    Gio TIME,
    GhiChu TEXT,
    TrangThai VARCHAR(50) DEFAULT 'Chờ xác nhận',
    ID_TaiKhoan INT,
    ThoiGianDat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_TaiKhoan) REFERENCES TaiKhoan(ID_TaiKhoan)
);

CREATE TABLE KhachHang (
    ID_KhachHang INT AUTO_INCREMENT PRIMARY KEY,
    HoTen VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    DienThoai VARCHAR(15),
    DiaChi VARCHAR(255),
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LanCuoiMua DATETIME DEFAULT NULL
);

CREATE TABLE DonHang (
    ID_DonHang INT AUTO_INCREMENT PRIMARY KEY,
    ID_TaiKhoan INT,
    NgayDat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TongTien DECIMAL(12,2) DEFAULT 0,
    TrangThai VARCHAR(50) DEFAULT 'Chờ xác nhận',
    MucDoUuTien VARCHAR(20) DEFAULT 'Bình thường',
    GhiChu TEXT,
    NgayCapNhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    DiaChiGiaoHang TEXT,
    PhuongThucThanhToan VARCHAR(50),
    FOREIGN KEY (ID_TaiKhoan) REFERENCES TaiKhoan(ID_TaiKhoan)
);

CREATE TABLE ChiTietDonHang (
    ID_ChiTietDonHang INT AUTO_INCREMENT PRIMARY KEY,
    ID_DonHang INT,
    ID_SanPham INT,
    SoLuong INT,
    Gia DECIMAL(10,2),
    ThanhTien DECIMAL(12,2),
    FOREIGN KEY (ID_DonHang) REFERENCES DonHang(ID_DonHang),
    FOREIGN KEY (ID_SanPham) REFERENCES SanPham(ID_SanPham)
);

CREATE TABLE LichSuTrangThaiDonHang (
    ID_LichSu INT AUTO_INCREMENT PRIMARY KEY,
    ID_DonHang INT,
    TrangThai VARCHAR(50),
    GhiChu TEXT,
    ThoiGian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    NguoiCapNhat INT,
    FOREIGN KEY (ID_DonHang) REFERENCES DonHang(ID_DonHang),
    FOREIGN KEY (NguoiCapNhat) REFERENCES TaiKhoan(ID_TaiKhoan)
);

CREATE TABLE HoaDon (
    ID_HoaDon INT AUTO_INCREMENT PRIMARY KEY,
    NgayLap DATETIME DEFAULT CURRENT_TIMESTAMP,
    TongTien DECIMAL(10,2) NOT NULL,
    ID_TaiKhoan INT,
    TrangThai VARCHAR(50) DEFAULT 'Chưa thanh toán',
    FOREIGN KEY (ID_TaiKhoan) REFERENCES TaiKhoan(ID_TaiKhoan)
);

CREATE TABLE ChiTietHoaDon (
    ID_ChiTiet INT AUTO_INCREMENT PRIMARY KEY,
    ID_HoaDon INT,
    ID_SanPham INT,
    SoLuong INT DEFAULT 1,
    Gia DECIMAL(10,2),
    FOREIGN KEY (ID_HoaDon) REFERENCES HoaDon(ID_HoaDon),
    FOREIGN KEY (ID_SanPham) REFERENCES SanPham(ID_SanPham)
);

CREATE TABLE ThanhToan (
    ID_ThanhToan INT AUTO_INCREMENT PRIMARY KEY,
    ID_HoaDon INT,
    SoTien DECIMAL(10,2) NOT NULL,
    PhuongThuc VARCHAR(50) DEFAULT 'Chuyển khoản',
    TrangThai VARCHAR(50) DEFAULT 'Chờ xác nhận',
    NgayThanhToan DATETIME DEFAULT CURRENT_TIMESTAMP,
    GhiChu TEXT,
    FOREIGN KEY (ID_HoaDon) REFERENCES HoaDon(ID_HoaDon)
);


INSERT INTO ChucVu (TenCV, MoTaCV, TrangThai) VALUES
('Admin', 'Quản trị hệ thống', 'Hoạt động'),
('Quản trị viên', 'Quản lý sản phẩm và đơn hàng', 'Hoạt động'),
('Nhân viên', 'Thực hiện công việc liên quan đến chăm sóc khách hàng', 'Hoạt động');

INSERT INTO TaiKhoan (HoTen, NamSinh, GioiTinh, DiaChi, DienThoai, Gmail, ID_ChucVu, TenDangNhap, MatKhau) VALUES
('Nguyễn Văn Anh', '2000-01-01', 1, 'Đà Nẵng', '0987654321', 'nguyenvana@gmail.com', 1, 'admin', 'password123'),
('Trần Tuấn', '2001-05-05', 0, 'Tam Kỳ', '0901234567', 'trant@gmail.com', 2, 'admin2', 'password456'),
('le the bao', '2000-01-01', 1, 'Đà Nẵng', '312313213', 'user@gmail.com', 3, 'user', 'user@gmail.com');

INSERT INTO KhachHang (HoTen, Email, DienThoai, DiaChi, NgayTao, LanCuoiMua) VALUES
('Nguyễn Thị Hoa', 'hoa.nguyen@gmail.com', '0901234567', 'Quận 1, TP.HCM', '2025-01-15', '2025-05-10'),
('Trần Văn Minh', 'minh.tran@gmail.com', '0912345678', 'Quận Hải Châu, Đà Nẵng', '2025-02-20', '2025-05-05'),
('Lê Thị Thu', 'thu.le@gmail.com', '0923456789', 'Quận Cẩm Lệ, Đà Nẵng', '2025-03-05', '2025-04-28'),
('Phạm Văn Đức', 'duc.pham@gmail.com', '0934567890', 'Quận 7, TP.HCM', '2025-03-10', '2025-05-12'),
('Hoàng Thị Mai', 'mai.hoang@gmail.com', '0945678901', 'Quận 3, TP.HCM', '2025-04-01', NULL);

INSERT INTO DonMucSP (TenDonMuc) VALUES 
('Thức ăn hạt'),
('Sữa cho chó'),
('Quần áo chó mèo'),
('Đồ chơi chó mèo'),
('Sữa tắm & Nước hoa'),
('Bỉm & Tã & Khay vệ sinh'),
('Chuồng & Nhà cho chó mèo'),
('Balo & Túi vận chuyển'),
('Thuốc thú y');

INSERT INTO SanPham (TenSP, MoTa, Gia, SoLuong, ID_DonMuc, TrangThai) VALUES
('Thức ăn chó Ganador Adult Salmon & Rice', '', 29000, 100, 1, 'Còn hàng'),
('Hạt Pedigree Puppy vị gà và trứng 400g', '', 57000, 100, 1, 'Còn hàng'),
('Thức ăn hạt Dog On Red - Protein 33%', '', 392000, 100, 1, 'Còn hàng'),
('Thức ăn hạt Dog On GREEN 5kg - Protein 24%', '', 370000, 100, 1, 'Còn hàng'),
('Thức ăn hạt Hello Dog 400g dành cho chó', '', 25000, 100, 1, 'Còn hàng'),
('Hạt chó AIQ FORMULA Dog Food - 20kg', '', 805000, 100, 1, 'Còn hàng'),
('Hạt Classic Pets Small Breed Dog Flavour - 2kg', '', 110000, 100, 1, 'Còn hàng'),
('Hạt ZOI Dog thức ăn chó 1kg', '', 35000, 100, 1, 'Còn hàng');

INSERT INTO LichSuDatLich (HoTen, SoDienThoai, DichVu, ChiNhanh, TenThuCung, Ngay, Gio, GhiChu, TrangThai, ID_TaiKhoan) VALUES
('Nguyễn Văn A', '0987654321', 'Khám tổng quát', 'Petcare Cẩm Lệ', 'Luna', '2025-05-20', '09:00:00', 'Khám định kỳ', 'Chờ xác nhận', 1),
('Trần Thị B', '0901234567', 'Chăm sóc lông', 'Petcare Hải Châu', 'Max', '2025-05-21', '14:00:00', 'Cắt tỉa lông', 'Đã xác nhận', 2),
('Lê Văn C', '0912345678', 'Tiêm phòng', 'Petcare Cẩm Lệ', 'Buddy', '2025-05-22', '10:30:00', 'Tiêm vaccine', 'Hoàn thành', 1);

INSERT INTO DonHang (ID_TaiKhoan, TongTien, TrangThai, MucDoUuTien, DiaChiGiaoHang, PhuongThucThanhToan) VALUES
(1, 500000, 'Chờ xác nhận', 'Bình thường', '123 Trần Phú, Hải Châu, Đà Nẵng', 'Tiền mặt'),
(2, 750000, 'Đã xác nhận', 'Cao', '456 Lê Lợi, Thanh Khê, Đà Nẵng', 'Chuyển khoản'),
(1, 300000, 'Đang chuẩn bị', 'Trung bình', '789 Nguyễn Văn Linh, Cẩm Lệ, Đà Nẵng', 'COD'),
(2, 920000, 'Đang giao hàng', 'Cao', '101 Hùng Vương, Hải Châu, Đà Nẵng', 'Thẻ tín dụng'),
(1, 450000, 'Đã giao hàng', 'Bình thường', '202 Điện Biên Phủ, Thanh Khê, Đà Nẵng', 'Tiền mặt'),
(2, 680000, 'Đã hủy', 'Bình thường', '303 Phan Châu Trinh, Hải Châu, Đà Nẵng', 'Chuyển khoản');

INSERT INTO ChiTietDonHang (ID_DonHang, ID_SanPham, SoLuong, Gia, ThanhTien) VALUES
(1, 1, 2, 29000, 58000),
(1, 2, 1, 57000, 57000),
(1, 3, 1, 392000, 392000),
(2, 4, 2, 370000, 740000),
(2, 5, 1, 25000, 25000),
(3, 6, 1, 805000, 805000),
(4, 7, 3, 110000, 330000),
(4, 8, 2, 35000, 70000),
(5, 1, 5, 29000, 145000),
(5, 2, 2, 57000, 114000),
(6, 3, 1, 392000, 392000),
(6, 4, 1, 370000, 370000);

INSERT INTO LichSuTrangThaiDonHang (ID_DonHang, TrangThai, GhiChu) VALUES
(1, 'Chờ xác nhận', 'Đơn hàng vừa được tạo'),
(2, 'Chờ xác nhận', 'Đơn hàng vừa được tạo'),
(2, 'Đã xác nhận', 'Đơn hàng đã được xác nhận và đang chuẩn bị'),
(3, 'Chờ xác nhận', 'Đơn hàng vừa được tạo'),
(3, 'Đã xác nhận', 'Đơn hàng đã được xác nhận'),
(3, 'Đang chuẩn bị', 'Đang đóng gói sản phẩm'),
(4, 'Chờ xác nhận', 'Đơn hàng vừa được tạo'),
(4, 'Đã xác nhận', 'Đơn hàng đã được xác nhận'),
(4, 'Đang chuẩn bị', 'Đang đóng gói sản phẩm'),
(4, 'Đang giao hàng', 'Đơn hàng đã được giao cho shipper'),
(5, 'Chờ xác nhận', 'Đơn hàng vừa được tạo'),
(5, 'Đã xác nhận', 'Đơn hàng đã được xác nhận'),
(5, 'Đang chuẩn bị', 'Đang đóng gói sản phẩm'),
(5, 'Đang giao hàng', 'Đơn hàng đã được giao cho shipper'),
(5, 'Đã giao hàng', 'Đơn hàng đã được giao thành công'),
(6, 'Chờ xác nhận', 'Đơn hàng vừa được tạo'),
(6, 'Đã hủy', 'Khách hàng yêu cầu hủy đơn hàng');

INSERT INTO HoaDon (TongTien, ID_TaiKhoan, TrangThai) VALUES
(500000, 1, 'Đã thanh toán'),
(300000, 2, 'Chưa thanh toán'),
(750000, 1, 'Đã thanh toán'),
(420000, 2, 'Chưa thanh toán');

INSERT INTO ChiTietHoaDon (ID_HoaDon, ID_SanPham, SoLuong, Gia) VALUES
(1, 1, 1, 300000),
(1, 2, 2, 100000),
(2, 3, 1, 300000),
(3, 4, 3, 250000),
(4, 5, 1, 220000),
(4, 6, 2, 100000);

INSERT INTO ThanhToan (ID_HoaDon, SoTien, PhuongThuc, TrangThai) VALUES
(1, 500000, 'Chuyển khoản', 'Đã xác nhận'),
(3, 750000, 'Tiền mặt', 'Đã xác nhận');

UPDATE DonHang SET TongTien = (
    SELECT SUM(ThanhTien) 
    FROM ChiTietDonHang 
    WHERE ChiTietDonHang.ID_DonHang = DonHang.ID_DonHang
) WHERE ID_DonHang IN (1, 2, 3, 4, 5, 6);

CREATE TABLE IF NOT EXISTS ChuongTrinhKhuyenMai (
    ID_ChuongTrinh INT AUTO_INCREMENT PRIMARY KEY,
    TenChuongTrinh VARCHAR(255) NOT NULL,
    MoTa TEXT,
    PhanTramGiam DECIMAL(5,2) NOT NULL,
    SoTienToiDa DECIMAL(12,2) DEFAULT NULL,
    NgayBatDau DATE NOT NULL,
    NgayKetThuc DATE NOT NULL,
    SoLuongToiDa INT DEFAULT NULL,
    SoLuongDaSuDung INT DEFAULT 0,
    TrangThai ENUM('Sắp bắt đầu', 'Hoạt động', 'Tạm dừng', 'Đã kết thúc') DEFAULT 'Sắp bắt đầu',
    DieuKienApDung TEXT,
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (TrangThai),
    INDEX idx_dates (NgayBatDau, NgayKetThuc),
    CONSTRAINT chk_discount CHECK (PhanTramGiam > 0 AND PhanTramGiam <= 100),
    CONSTRAINT chk_dates CHECK (NgayKetThuc > NgayBatDau)
);

CREATE TABLE IF NOT EXISTS LichSuSuDungKhuyenMai (
    ID_LichSu INT AUTO_INCREMENT PRIMARY KEY,
    ID_ChuongTrinh INT NOT NULL,
    ID_TaiKhoan INT NOT NULL,
    ID_DonHang INT NOT NULL,
    SoTienGiam DECIMAL(12,2) NOT NULL,
    ThoiGianSuDung TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_program (ID_ChuongTrinh),
    INDEX idx_user (ID_TaiKhoan),
    INDEX idx_order (ID_DonHang),
    FOREIGN KEY (ID_ChuongTrinh) REFERENCES ChuongTrinhKhuyenMai(ID_ChuongTrinh) ON DELETE CASCADE,
    FOREIGN KEY (ID_TaiKhoan) REFERENCES TaiKhoan(ID_TaiKhoan) ON DELETE CASCADE,
    FOREIGN KEY (ID_DonHang) REFERENCES DonHang(ID_DonHang) ON DELETE CASCADE
);

SET @col_exists = (SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'DonHang' 
    AND COLUMN_NAME = 'ID_ChuongTrinh');

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE DonHang ADD COLUMN ID_ChuongTrinh INT DEFAULT NULL', 
    'SELECT "Column ID_ChuongTrinh already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'DonHang' 
    AND COLUMN_NAME = 'SoTienGiam');

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE DonHang ADD COLUMN SoTienGiam DECIMAL(12,2) DEFAULT 0', 
    'SELECT "Column SoTienGiam already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = (SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'DonHang' 
    AND CONSTRAINT_NAME = 'fk_donhang_chuongtrinh');

SET @sql = IF(@fk_exists = 0, 
    'ALTER TABLE DonHang ADD CONSTRAINT fk_donhang_chuongtrinh FOREIGN KEY (ID_ChuongTrinh) REFERENCES ChuongTrinhKhuyenMai(ID_ChuongTrinh) ON DELETE SET NULL', 
    'SELECT "Foreign key constraint already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT INTO ChuongTrinhKhuyenMai (
    TenChuongTrinh, 
    MoTa, 
    PhanTramGiam, 
    SoTienToiDa, 
    NgayBatDau, 
    NgayKetThuc, 
    SoLuongToiDa, 
    SoLuongDaSuDung, 
    TrangThai, 
    DieuKienApDung
) VALUES
('Giảm giá 20% cho khách hàng mới', 
 'Chương trình khuyến mãi dành cho khách hàng lần đầu mua hàng tại Petcare', 
 20.00, 
 200000, 
 '2025-01-01', 
 '2025-12-31', 
 1000, 
 50, 
 'Hoạt động',
 'Áp dụng cho khách hàng lần đầu mua hàng, đơn hàng tối thiểu 500.000 VND'),

('Flash Sale cuối tuần', 
 'Giảm giá sốc vào cuối tuần cho tất cả sản phẩm thức ăn', 
 15.00, 
 150000, 
 '2025-05-24', 
 '2025-05-25', 
 500, 
 120, 
 'Hoạt động',
 'Áp dụng cho tất cả sản phẩm thức ăn, không giới hạn giá trị đơn hàng'),

('Khuyến mãi tháng 6', 
 'Chào mừng tháng 6 với ưu đãi đặc biệt', 
 25.00, 
 300000, 
 '2025-06-01', 
 '2025-06-30', 
 2000, 
 0, 
 'Sắp bắt đầu',
 'Áp dụng cho đơn hàng từ 1.000.000 VND trở lên'),

('Back to School', 
 'Ưu đãi mùa tựu trường cho thú cưng', 
 10.00, 
 100000, 
 '2025-08-15', 
 '2025-09-15', 
 NULL, 
 0, 
 'Sắp bắt đầu',
 'Áp dụng cho tất cả sản phẩm đồ chơi và phụ kiện'),

('Chương trình đã kết thúc', 
 'Chương trình giảm giá Tết Nguyên Đán', 
 30.00, 
 500000, 
 '2025-01-20', 
 '2025-02-10', 
 1500, 
 1500, 
 'Đã kết thúc',
 'Áp dụng cho tất cả sản phẩm, đơn hàng tối thiểu 2.000.000 VND');

INSERT INTO LichSuSuDungKhuyenMai (
    ID_ChuongTrinh, 
    ID_TaiKhoan, 
    ID_DonHang, 
    SoTienGiam
) VALUES
(1, 1, 1, 100000),
(1, 2, 2, 150000),
(2, 1, 3, 45000),
(2, 2, 4, 138000);

DELIMITER //
CREATE PROCEDURE UpdatePromoStatus()
BEGIN
    UPDATE ChuongTrinhKhuyenMai
    SET TrangThai = CASE
        WHEN NgayKetThuc < CURDATE() THEN 'Đã kết thúc'
        WHEN NgayBatDau <= CURDATE() AND NgayKetThuc >= CURDATE() AND TrangThai != 'Tạm dừng' THEN 'Hoạt động'
        WHEN NgayBatDau > CURDATE() THEN 'Sắp bắt đầu'
        ELSE TrangThai
    END
    WHERE TrangThai != 'Đã kết thúc';
    
    UPDATE ChuongTrinhKhuyenMai
    SET TrangThai = 'Đã kết thúc'
    WHERE SoLuongToiDa IS NOT NULL 
    AND SoLuongDaSuDung >= SoLuongToiDa 
    AND TrangThai != 'Đã kết thúc';
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER update_promo_usage
    AFTER INSERT ON LichSuSuDungKhuyenMai
    FOR EACH ROW
BEGIN
    UPDATE ChuongTrinhKhuyenMai 
    SET SoLuongDaSuDung = SoLuongDaSuDung + 1
    WHERE ID_ChuongTrinh = NEW.ID_ChuongTrinh;
    
    UPDATE ChuongTrinhKhuyenMai
    SET TrangThai = 'Đã kết thúc'
    WHERE ID_ChuongTrinh = NEW.ID_ChuongTrinh
    AND SoLuongToiDa IS NOT NULL 
    AND SoLuongDaSuDung >= SoLuongToiDa;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER update_promo_status_on_update
    BEFORE UPDATE ON ChuongTrinhKhuyenMai
    FOR EACH ROW
BEGIN
    IF NEW.TrangThai != 'Tạm dừng' OR OLD.TrangThai = 'Tạm dừng' THEN
        IF NEW.NgayKetThuc < CURDATE() THEN
            SET NEW.TrangThai = 'Đã kết thúc';
        ELSEIF NEW.NgayBatDau <= CURDATE() AND NEW.NgayKetThuc >= CURDATE() THEN
            IF OLD.TrangThai != 'Tạm dừng' THEN
                SET NEW.TrangThai = 'Hoạt động';
            END IF;
        ELSEIF NEW.NgayBatDau > CURDATE() THEN
            SET NEW.TrangThai = 'Sắp bắt đầu';
        END IF;
        
        IF NEW.SoLuongToiDa IS NOT NULL AND NEW.SoLuongDaSuDung >= NEW.SoLuongToiDa THEN
            SET NEW.TrangThai = 'Đã kết thúc';
        END IF;
    END IF;
END //
DELIMITER ;


SELECT 'Đã tạo thành công hệ thống quản lý khuyến mãi!' as message;



CREATE TABLE ThuCung (
    ID_ThuCung INT AUTO_INCREMENT PRIMARY KEY,
    TenThuCung VARCHAR(100) NOT NULL,
    TenChuSoHuu VARCHAR(100) NOT NULL,
    Loai VARCHAR(50) NOT NULL, 
    Giong VARCHAR(100),
    Tuoi INT,
    GioiTinh VARCHAR(10), 
    CanNang DECIMAL(5,2),
    SoDienThoai VARCHAR(15),
    DiaChi TEXT,
    TrangThaiSucKhoe VARCHAR(50) DEFAULT 'Khỏe mạnh',
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhatCuoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE LichSuSucKhoe (
    ID_LichSu INT AUTO_INCREMENT PRIMARY KEY,
    ID_ThuCung INT NOT NULL,
    NgayKham DATE NOT NULL,
    TrangThaiSucKhoe VARCHAR(50) NOT NULL,
    NhietDo DECIMAL(4,1), 
    CanNang DECIMAL(5,2), 
    TrieuChung TEXT, 
    ChanDoan TEXT, 
    PhuongPhapDieuTri TEXT, 
    NgayTaiKham DATE, -- Ngày tái khám
    BacSiPhuTrach VARCHAR(100), 
    GhiChu TEXT,
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_ThuCung) REFERENCES ThuCung(ID_ThuCung) ON DELETE CASCADE
);

CREATE TABLE DonThuoc (
    ID_DonThuoc INT AUTO_INCREMENT PRIMARY KEY,
    ID_LichSu INT NOT NULL,
    TenThuoc VARCHAR(200) NOT NULL,
    LieuLuong VARCHAR(100),
    TanSuat VARCHAR(100), 
    ThoiGianSuDung VARCHAR(100), 
    GhiChu TEXT,
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_LichSu) REFERENCES LichSuSucKhoe(ID_LichSu) ON DELETE CASCADE
);

CREATE TABLE LichTiemPhong (
    ID_TiemPhong INT AUTO_INCREMENT PRIMARY KEY,
    ID_ThuCung INT NOT NULL,
    LoaiVaccine VARCHAR(100) NOT NULL,
    NgayTiem DATE NOT NULL,
    NgayTiemTiepTheo DATE,
    TrangThai VARCHAR(50) DEFAULT 'Hoàn thành', 
    BacSiThucHien VARCHAR(100),
    GhiChu TEXT,
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_ThuCung) REFERENCES ThuCung(ID_ThuCung) ON DELETE CASCADE
);

INSERT INTO ThuCung (TenThuCung, TenChuSoHuu, Loai, Giong, Tuoi, GioiTinh, CanNang, SoDienThoai, DiaChi, TrangThaiSucKhoe) VALUES
('Buddy', 'Nguyễn Văn An', 'Chó', 'Golden Retriever', 3, 'Đực', 25.5, '0901234567', '123 Trần Phú, Hải Châu, Đà Nẵng', 'Khỏe mạnh'),
('Luna', 'Trần Thị Bình', 'Mèo', 'Persian', 2, 'Cái', 4.2, '0912345678', '456 Lê Lợi, Thanh Khê, Đà Nẵng', 'Cần theo dõi'),
('Max', 'Lê Văn Cường', 'Chó', 'Husky', 4, 'Đực', 22.0, '0923456789', '789 Nguyễn Văn Linh, Cẩm Lệ, Đà Nẵng', 'Khỏe mạnh'),
('Mimi', 'Phạm Thị Dung', 'Mèo', 'Scottish Fold', 1, 'Cái', 3.8, '0934567890', '101 Hùng Vương, Hải Châu, Đà Nẵng', 'Đang điều trị'),
('Charlie', 'Hoàng Văn Em', 'Chó', 'Poodle', 5, 'Đực', 8.5, '0945678901', '202 Điện Biên Phủ, Thanh Khê, Đà Nẵng', 'Khỏe mạnh');

INSERT INTO LichSuSucKhoe (ID_ThuCung, NgayKham, TrangThaiSucKhoe, NhietDo, CanNang, TrieuChung, ChanDoan, PhuongPhapDieuTri, NgayTaiKham, BacSiPhuTrach, GhiChu) VALUES
(1, '2024-01-15', 'Khỏe mạnh', 38.5, 25.5, 'Không có triệu chứng bất thường', 'Sức khỏe tốt', 'Tiêm phòng định kỳ', '2024-07-15', 'BS. Nguyễn Văn Hùng', 'Khuyến nghị tiêm phòng dại'),
(2, '2024-02-10', 'Cần theo dõi', 39.2, 4.2, 'Ho khan, mắt chảy nước', 'Viêm đường hô hấp trên', 'Kháng sinh và thuốc ho', '2024-02-24', 'BS. Trần Thị Lan', 'Theo dõi trong 2 tuần'),
(3, '2024-01-20', 'Khỏe mạnh', 38.3, 22.0, 'Không có', 'Kiểm tra sức khỏe định kỳ', 'Không cần điều trị', '2024-07-20', 'BS. Lê Văn Minh', 'Duy trì chế độ ăn hiện tại'),
(4, '2024-03-05', 'Đang điều trị', 40.1, 3.8, 'Nôn mửa, tiêu chảy, mệt mỏi', 'Viêm dạ dày ruột', 'Thuốc kháng sinh, probiotic', '2024-03-19', 'BS. Phạm Văn Đức', 'Cần nhịn ăn 12h trước khi uống thuốc'),
(5, '2024-02-28', 'Khỏe mạnh', 38.7, 8.5, 'Không có', 'Kiểm tra sức khỏe sau cắt lông', 'Không cần điều trị', NULL, 'BS. Hoàng Thị Mai', 'Lông mọc lại bình thường');

INSERT INTO LichTiemPhong (ID_ThuCung, LoaiVaccine, NgayTiem, NgayTiemTiepTheo, TrangThai, BacSiThucHien, GhiChu) VALUES
(1, 'Vaccine 5 in 1', '2024-01-15', '2025-01-15', 'Hoàn thành', 'BS. Nguyễn Văn Hùng', 'Phản ứng tốt'),
(1, 'Vaccine dại', '2024-01-15', '2025-01-15', 'Hoàn thành', 'BS. Nguyễn Văn Hùng', 'Không có phản ứng phụ'),
(2, 'Vaccine 3 in 1 cho mèo', '2024-02-10', '2025-02-10', 'Hoàn thành', 'BS. Trần Thị Lan', 'Sức khỏe ổn định sau tiêm'),
(3, 'Vaccine 5 in 1', '2024-01-20', '2025-01-20', 'Hoàn thành', 'BS. Lê Văn Minh', 'Tiêm phòng định kỳ'),
(4, 'Vaccine 3 in 1 cho mèo', '2024-03-05', '2025-03-05', 'Hoàn thành', 'BS. Phạm Văn Đức', 'Tiêm khi sức khỏe ổn định'),
(5, 'Vaccine 5 in 1', '2024-02-28', '2025-02-28', 'Hoàn thành', 'BS. Hoàng Thị Mai', 'Hoàn tất tiêm phòng năm');

INSERT INTO DonThuoc (ID_LichSu, TenThuoc, LieuLuong, TanSuat, ThoiGianSuDung, GhiChu) VALUES
(2, 'Amoxicillin', '250mg', '2 lần/ngày', '7 ngày', 'Uống sau bữa ăn'),
(2, 'Thuốc ho cho thú cưng', '5ml', '3 lần/ngày', '5 ngày', 'Lắc đều trước khi dùng'),
(4, 'Metronidazole', '200mg', '2 lần/ngày', '10 ngày', 'Uống trước bữa ăn 30 phút'),
(4, 'Probiotic', '1 gói', '1 lần/ngày', '14 ngày', 'Pha với thức ăn');

UPDATE ThuCung tc
SET TrangThaiSucKhoe = (
    SELECT TrangThaiSucKhoe 
    FROM LichSuSucKhoe lsk 
    WHERE lsk.ID_ThuCung = tc.ID_ThuCung 
    ORDER BY lsk.NgayKham DESC 
    LIMIT 1
),
NgayCapNhatCuoi = (
    SELECT NgayKham 
    FROM LichSuSucKhoe lsk 
    WHERE lsk.ID_ThuCung = tc.ID_ThuCung 
    ORDER BY lsk.NgayKham DESC 
    LIMIT 1
);


CREATE TABLE ChatRooms (
    ID_Room INT AUTO_INCREMENT PRIMARY KEY,
    TenRoom VARCHAR(255) NOT NULL,
    LoaiRoom ENUM('private', 'group', 'support') DEFAULT 'private',
    MoTa TEXT,
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TrangThai ENUM('active', 'inactive') DEFAULT 'active'
);

CREATE TABLE ChatRoomMembers (
    ID_Member INT AUTO_INCREMENT PRIMARY KEY,
    ID_Room INT NOT NULL,
    ID_TaiKhoan INT NOT NULL,
    VaiTro ENUM('admin', 'member') DEFAULT 'member',
    NgayThamGia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TrangThai ENUM('active', 'left') DEFAULT 'active',
    FOREIGN KEY (ID_Room) REFERENCES ChatRooms(ID_Room) ON DELETE CASCADE,
    FOREIGN KEY (ID_TaiKhoan) REFERENCES TaiKhoan(ID_TaiKhoan) ON DELETE CASCADE,
    UNIQUE KEY unique_room_member (ID_Room, ID_TaiKhoan)
);

CREATE TABLE ChatMessages (
    ID_Message INT AUTO_INCREMENT PRIMARY KEY,
    ID_Room INT NOT NULL,
    ID_TaiKhoan INT NOT NULL,
    NoiDung TEXT NOT NULL,
    LoaiTinNhan ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
    TrangThai ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
    NgayGui TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    NgayChinhSua TIMESTAMP NULL,
    DuongDanFile VARCHAR(500) NULL,
    FOREIGN KEY (ID_Room) REFERENCES ChatRooms(ID_Room) ON DELETE CASCADE,
    FOREIGN KEY (ID_TaiKhoan) REFERENCES TaiKhoan(ID_TaiKhoan) ON DELETE CASCADE,
    INDEX idx_room_time (ID_Room, NgayGui),
    INDEX idx_status (TrangThai)
);

CREATE TABLE ChatMessageReads (
    ID_Read INT AUTO_INCREMENT PRIMARY KEY,
    ID_Message INT NOT NULL,
    ID_TaiKhoan INT NOT NULL,
    NgayDoc TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Message) REFERENCES ChatMessages(ID_Message) ON DELETE CASCADE,
    FOREIGN KEY (ID_TaiKhoan) REFERENCES TaiKhoan(ID_TaiKhoan) ON DELETE CASCADE,
    UNIQUE KEY unique_message_reader (ID_Message, ID_TaiKhoan)
);

CREATE TABLE ChatSupport (
    ID_Support INT AUTO_INCREMENT PRIMARY KEY,
    ID_KhachHang INT NULL,
    ID_NhanVien INT NULL,
    ID_Room INT NOT NULL,
    TieuDe VARCHAR(255),
    TinhTrang ENUM('waiting', 'active', 'resolved', 'closed') DEFAULT 'waiting',
    DoUuTien ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    NgayDong TIMESTAMP NULL,
    DanhGia INT CHECK (DanhGia BETWEEN 1 AND 5),
    NhanXet TEXT,
    FOREIGN KEY (ID_KhachHang) REFERENCES TaiKhoan(ID_TaiKhoan),
    FOREIGN KEY (ID_NhanVien) REFERENCES TaiKhoan(ID_TaiKhoan),
    FOREIGN KEY (ID_Room) REFERENCES ChatRooms(ID_Room) ON DELETE CASCADE
);

INSERT INTO ChatRooms (TenRoom, LoaiRoom, MoTa) VALUES
('Support General', 'support', 'Phòng hỗ trợ khách hàng chung'),
('Admins', 'group', 'Nhóm quản trị viên'),
('Staff Meeting', 'group', 'Cuộc họp nhân viên');

INSERT INTO ChatRoomMembers (ID_Room, ID_TaiKhoan, VaiTro) VALUES
(1, 1, 'admin'),  
(1, 2, 'admin'),  
(2, 1, 'admin'),  
(2, 2, 'member'), 
(3, 1, 'admin'), 
(3, 2, 'member'), 
(3, 3, 'member'); 


ALTER TABLE DonHang 
ADD COLUMN MaGiaoDichMoMo VARCHAR(100) NULL AFTER PhuongThucThanhToan;