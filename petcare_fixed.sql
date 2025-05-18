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

CREATE TABLE IF NOT EXISTS LichSuDatLich (
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

CREATE TABLE IF NOT EXISTS KhachHang (
  ID_KhachHang INT AUTO_INCREMENT PRIMARY KEY,
  HoTen VARCHAR(100) NOT NULL,
  Email VARCHAR(100) NOT NULL UNIQUE,
  DienThoai VARCHAR(15),
  DiaChi VARCHAR(255),
  NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  LanCuoiMua DATETIME DEFAULT NULL
);


INSERT INTO KhachHang (HoTen, Email, DienThoai, DiaChi, NgayTao, LanCuoiMua) VALUES
('Nguyễn Thị Hoa', 'hoa.nguyen@gmail.com', '0901234567', 'Quận 1, TP.HCM', '2025-01-15', '2025-05-10'),
('Trần Văn Minh', 'minh.tran@gmail.com', '0912345678', 'Quận Hải Châu, Đà Nẵng', '2025-02-20', '2025-05-05'),
('Lê Thị Thu', 'thu.le@gmail.com', '0923456789', 'Quận Cẩm Lệ, Đà Nẵng', '2025-03-05', '2025-04-28'),
('Phạm Văn Đức', 'duc.pham@gmail.com', '0934567890', 'Quận 7, TP.HCM', '2025-03-10', '2025-05-12'),
('Hoàng Thị Mai', 'mai.hoang@gmail.com', '0945678901', 'Quận 3, TP.HCM', '2025-04-01', NULL);

INSERT INTO ChucVu (TenCV, MoTaCV, TrangThai) VALUES
('Admin', 'Quản trị hệ thống', 'Hoạt động'),
('Quản trị viên', 'Quản lý sản phẩm và đơn hàng', 'Hoạt động'),
('Nhân viên', 'Thực hiện công việc liên quan đến chăm sóc khách hàng', 'Hoạt động');

INSERT INTO TaiKhoan (HoTen, NamSinh, GioiTinh, DiaChi, DienThoai, Gmail, ID_ChucVu, TenDangNhap, MatKhau) VALUES
('Nguyễn Văn Anh', '2000-01-01', 1, 'Đà Nẵng', '0987654321', 'nguyenvana@gmail.com', 1, 'admin', 'password123'),
('Trần Tuấn', '2001-05-05', 0, 'Tam Kỳ', '0901234567', 'trant@gmail.com', 2, 'admin2', 'password456');

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


CREATE TABLE IF NOT EXISTS DonHang (
    ID_DonHang INT AUTO_INCREMENT PRIMARY KEY,
    ID_TaiKhoan INT NOT NULL,
    NgayDat DATETIME DEFAULT CURRENT_TIMESTAMP,
    TongTien DECIMAL(10,2) DEFAULT 0,
    TrangThai VARCHAR(50) DEFAULT 'Chờ xử lý',
    DiaChi VARCHAR(255),
    GhiChu TEXT,
    PhuongThucThanhToan VARCHAR(50),
    PhuongThucVanChuyen VARCHAR(50),
    PhiVanChuyen DECIMAL(10,2) DEFAULT 0,
    MaGiamGia VARCHAR(50),
    GiamGia DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (ID_TaiKhoan) REFERENCES TaiKhoan(ID_TaiKhoan)
);

CREATE TABLE IF NOT EXISTS ChiTietDonHang (
    ID_ChiTiet INT AUTO_INCREMENT PRIMARY KEY,
    ID_DonHang INT NOT NULL,
    ID_SanPham INT NOT NULL,
    SoLuong INT DEFAULT 1,
    DonGia DECIMAL(10,2) NOT NULL,
    GiamGia DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (ID_DonHang) REFERENCES DonHang(ID_DonHang) ON DELETE CASCADE,
    FOREIGN KEY (ID_SanPham) REFERENCES SanPham(ID_SanPham)
);

INSERT INTO DonHang (ID_TaiKhoan, TongTien, TrangThai, DiaChi, GhiChu, PhuongThucThanhToan) 
VALUES 
(1, 359000, 'Chờ xử lý', '123 Đường Nguyễn Văn Linh, Quận Cẩm Lệ, Đà Nẵng', 'Giao hàng giờ hành chính', 'COD'),
(2, 210000, 'Đang giao', '456 Đường Hùng Vương, Quận Hải Châu, Đà Nẵng', 'Gọi trước khi giao', 'Chuyển khoản'),
(1, 500000, 'Hoàn thành', '789 Đường Trần Phú, Quận Hải Châu, Đà Nẵng', NULL, 'COD');


INSERT INTO ChiTietDonHang (ID_DonHang, ID_SanPham, SoLuong, DonGia)
VALUES 
(1, 1, 2, 29000),  
(1, 3, 1, 392000); 

INSERT INTO ChiTietDonHang (ID_DonHang, ID_SanPham, SoLuong, DonGia)
VALUES 
(2, 1, 2, 29000), 
(2, 2, 2, 57000),  
(2, 8, 1, 35000);  

INSERT INTO ChiTietDonHang (ID_DonHang, ID_SanPham, SoLuong, DonGia)
VALUES 
(3, 4, 1, 370000), 
(3, 6, 1, 110000), 
(3, 5, 1, 25000); 

CREATE TABLE IF NOT EXISTS HoaDon (
    ID_HoaDon INT AUTO_INCREMENT PRIMARY KEY,
    NgayLap DATETIME DEFAULT CURRENT_TIMESTAMP,
    TongTien DECIMAL(10,2) NOT NULL,
    ID_TaiKhoan INT,
    TrangThai VARCHAR(50) DEFAULT 'Chưa thanh toán',
    FOREIGN KEY (ID_TaiKhoan) REFERENCES TaiKhoan(ID_TaiKhoan)
);

CREATE TABLE IF NOT EXISTS ChiTietHoaDon (
    ID_ChiTiet INT AUTO_INCREMENT PRIMARY KEY,
    ID_HoaDon INT,
    ID_SanPham INT,
    SoLuong INT DEFAULT 1,
    Gia DECIMAL(10,2),
    FOREIGN KEY (ID_HoaDon) REFERENCES HoaDon(ID_HoaDon),
    FOREIGN KEY (ID_SanPham) REFERENCES SanPham(ID_SanPham)
);

CREATE TABLE IF NOT EXISTS ThanhToan (
    ID_ThanhToan INT AUTO_INCREMENT PRIMARY KEY,
    ID_HoaDon INT,
    SoTien DECIMAL(10,2) NOT NULL,
    PhuongThuc VARCHAR(50) DEFAULT 'Chuyển khoản',
    TrangThai VARCHAR(50) DEFAULT 'Chờ xác nhận',
    NgayThanhToan DATETIME DEFAULT CURRENT_TIMESTAMP,
    GhiChu TEXT,
    FOREIGN KEY (ID_HoaDon) REFERENCES HoaDon(ID_HoaDon)
);

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



-- -- DonHang table (simplified for reference)
-- CREATE TABLE IF NOT EXISTS DonHang (
--   ID_DonHang INT AUTO_INCREMENT PRIMARY KEY,
--   ID_KhachHang INT,
--   NgayDat DATETIME DEFAULT CURRENT_TIMESTAMP,
--   TongTien DECIMAL(10,2) DEFAULT 0,
--   TrangThai VARCHAR(50) DEFAULT 'Đang xử lý',
--   FOREIGN KEY (ID_KhachHang) REFERENCES KhachHang(ID_KhachHang)
-- );

-- Sample data for DonHang
-- INSERT INTO DonHang (ID_KhachHang, NgayDat, TongTien, TrangThai) VALUES
-- (1, '2025-03-15', 350000, 'Hoàn thành'),
-- (1, '2025-05-10', 420000, 'Hoàn thành'),
-- (2, '2025-04-20', 250000, 'Hoàn thành'),
-- (2, '2025-05-05', 180000, 'Hoàn thành'),
-- (3, '2025-04-10', 520000, 'Hoàn thành'),
-- (3, '2025-04-28', 150000, 'Hoàn thành'),
-- (4, '2025-05-12', 630000, 'Đang xử lý');