CREATE DATABASE IF NOT EXISTS petcare;
USE petcare;

-- Table: ChucVu (Position)
CREATE TABLE ChucVu (
    ID_ChucVu INT AUTO_INCREMENT PRIMARY KEY,
    TenCV Varchar(100),
    MoTaCV Varchar(255),
    TrangThai Varchar(20)
);

-- Table: TaiKhoan (Account)
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

-- Table: DonMucSP (Product Category)
CREATE TABLE DonMucSP (
    ID_DonMuc INT AUTO_INCREMENT PRIMARY KEY,
    TenDonMuc Varchar(50),
    MoTa Text,
    TrangThai Varchar(20)
);

-- Table: SanPham (Product) - ĐÃ SỬA TenSP VARCHAR(200)
CREATE TABLE SanPham (
    ID_SanPham INT AUTO_INCREMENT PRIMARY KEY,
    TenSP Varchar(200),  -- Tăng từ 50 lên 200
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


-- Insert ChucVu
INSERT INTO ChucVu (TenCV, MoTaCV, TrangThai) VALUES
('Admin', 'Quản trị hệ thống', 'Hoạt động'),
('Quản trị viên', 'Quản lý sản phẩm và đơn hàng', 'Hoạt động'),
('Nhân viên', 'Thực hiện công việc liên quan đến chăm sóc khách hàng', 'Hoạt động');

-- Insert TaiKhoan
INSERT INTO TaiKhoan (HoTen, NamSinh, GioiTinh, DiaChi, DienThoai, Gmail, ID_ChucVu, TenDangNhap, MatKhau) VALUES
('Nguyễn Văn Anh', '2000-01-01', 1, 'Đà Nẵng', '0987654321', 'nguyenvana@gmail.com', 1, 'admin', 'password123'),
('Trần Tuấn', '2001-05-05', 0, 'Tam Kỳ', '0901234567', 'trant@gmail.com', 2, 'admin2', 'password456');

-- Insert DonMucSP
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

-- Insert SanPham cho danh mục "Thức ăn hạt"
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