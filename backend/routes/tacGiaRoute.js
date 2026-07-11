const express = require("express");
const router = express.Router();
const { poolPromise } = require("../config/db");

// Hàm kiểm tra và thêm cột nếu thiếu trong SQL Server
const ensureColumnsExist = async (pool) => {
  const queries = [
    `IF COL_LENGTH('TacGia', 'NganHang') IS NULL ALTER TABLE TacGia ADD NganHang NVARCHAR(200)`,
    `IF COL_LENGTH('TacGia', 'PhongBan') IS NULL ALTER TABLE TacGia ADD PhongBan NVARCHAR(200)`,
    `IF COL_LENGTH('TacGia', 'SoTaiKhoan') IS NULL ALTER TABLE TacGia ADD SoTaiKhoan NVARCHAR(50)`,
    `IF COL_LENGTH('TacGia', 'AvatarPath') IS NULL ALTER TABLE TacGia ADD AvatarPath NVARCHAR(MAX)`,
    `IF COL_LENGTH('TacGia', 'PdfPath') IS NULL ALTER TABLE TacGia ADD PdfPath NVARCHAR(MAX)`,
    `IF COL_LENGTH('TacGia', 'MsTG') IS NULL ALTER TABLE TacGia ADD MsTG NVARCHAR(50)`,
    `IF COL_LENGTH('TacGia', 'Ngaysinh') IS NULL ALTER TABLE TacGia ADD Ngaysinh DATETIME`,
    `IF COL_LENGTH('TacGia', 'Email') IS NULL ALTER TABLE TacGia ADD Email NVARCHAR(100)`
  ];
  for (let q of queries) {
    try {
      await pool.request().query(q);
    } catch (e) {
      // Bỏ qua lỗi nếu đã tồn tại
    }
  }
};

// 1. API Thêm Tác Giả Mới
router.post("/them", async (req, res) => {
  try {
    const { maTacGia, maThe, hoTen, ngaySinh, butDanh, loaiTacGia, khuVuc, dienThoai, email, soTaiKhoan, phongBan, nganHang } = req.body;
    const pool = await poolPromise;
    await ensureColumnsExist(pool);
    
    // Thêm vào bảng TacGia
    await pool.request()
      .input('Maso', maTacGia)
      .input('MsTG', maThe || null)
      .input('Hoten', hoTen)
      .input('Ngaysinh', ngaySinh ? new Date(ngaySinh) : null)
      .input('LoaiTacgia', loaiTacGia)
      .input('Email', email || null)
      .input('Diachi', khuVuc || null)
      .input('Dienthoai', dienThoai || null)
      .input('SoTaiKhoan', soTaiKhoan || null)
      .input('PhongBan', phongBan || null)
      .input('NganHang', nganHang || null)
      .query(`
        INSERT INTO TacGia (Maso, MsTG, Hoten, Ngaysinh, LoaiTacgia, Email, Diachi, Dienthoai, SoTaiKhoan, PhongBan, NganHang) 
        VALUES (@Maso, @MsTG, @Hoten, @Ngaysinh, @LoaiTacgia, @Email, @Diachi, @Dienthoai, @SoTaiKhoan, @PhongBan, @NganHang)
      `);
      
    // Nếu có bút danh, thêm vào bảng Butdanh
    if (butDanh) {
        await pool.request()
          .input('MsTacgia', maTacGia)
          .input('Butdanh', butDanh)
          .query(`INSERT INTO Butdanh (MsTacgia, Butdanh) VALUES (@MsTacgia, @Butdanh)`);
    }

    res.status(201).json({ message: "Đã thêm Tác giả thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi rồi anh ơi!", error: error.message });
  }
});

// 2. API Lấy Danh Sách Tác Giả
router.get("/danh-sach", async (req, res) => {
  try {
    const pool = await poolPromise;
    await ensureColumnsExist(pool);
    const result = await pool.request().query(`
      SELECT 
        T.Maso as _id, 
        T.Maso as maTacGia, 
        T.MsTG as maThe,
        T.Hoten as hoTen, 
        T.Ngaysinh as ngaySinh,
        T.LoaiTacgia as loaiTacGia, 
        T.Email as email,
        T.Diachi as khuVuc, 
        T.Dienthoai as dienThoai,
        T.SoTaiKhoan as soTaiKhoan,
        T.PhongBan as phongBan,
        T.NganHang as nganHang,
        (SELECT TOP 1 B.Butdanh FROM Butdanh B WHERE B.MsTacgia = T.Maso) as butDanh
      FROM TacGia T
      ORDER BY T.Maso DESC
    `);
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách!", error: error.message });
  }
});

// 3. API Xóa Tác Giả
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const pool = await poolPromise;
    
    // Xóa bút danh trước (Foreign Key)
    await pool.request().input('Maso', id).query(`DELETE FROM Butdanh WHERE MsTacgia = @Maso`);
    // Xóa tác giả
    await pool.request().input('Maso', id).query(`DELETE FROM TacGia WHERE Maso = @Maso`);

    res.status(200).json({ message: "Đã xóa tác giả thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa!", error: error.message });
  }
});

// 4. API Cập nhật thông tin Tác Giả
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { maThe, hoTen, ngaySinh, butDanh, loaiTacGia, khuVuc, dienThoai, email, soTaiKhoan, phongBan, nganHang } = req.body;
    const pool = await poolPromise;
    await ensureColumnsExist(pool);

    await pool.request()
      .input('Maso', id)
      .input('MsTG', maThe || null)
      .input('Hoten', hoTen)
      .input('Ngaysinh', ngaySinh ? new Date(ngaySinh) : null)
      .input('LoaiTacgia', loaiTacGia)
      .input('Email', email || null)
      .input('Diachi', khuVuc || null)
      .input('Dienthoai', dienThoai || null)
      .input('SoTaiKhoan', soTaiKhoan || null)
      .input('PhongBan', phongBan || null)
      .input('NganHang', nganHang || null)
      .query(`
        UPDATE TacGia 
        SET MsTG = @MsTG, Hoten = @Hoten, Ngaysinh = @Ngaysinh, LoaiTacgia = @LoaiTacgia, 
            Email = @Email, Diachi = @Diachi, Dienthoai = @Dienthoai, 
            SoTaiKhoan = @SoTaiKhoan, PhongBan = @PhongBan, NganHang = @NganHang
        WHERE Maso = @Maso
      `);

    // Xử lý bút danh (xóa cũ thêm mới để đơn giản)
    if (butDanh) {
        await pool.request().input('Maso', id).query(`DELETE FROM Butdanh WHERE MsTacgia = @Maso`);
        await pool.request()
          .input('Maso', id)
          .input('Butdanh', butDanh)
          .query(`INSERT INTO Butdanh (MsTacgia, Butdanh) VALUES (@Maso, @Butdanh)`);
    } else {
        await pool.request().input('Maso', id).query(`DELETE FROM Butdanh WHERE MsTacgia = @Maso`);
    }

    res.status(200).json({ message: "Cập nhật thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật!", error: error.message });
  }
});

module.exports = router;
