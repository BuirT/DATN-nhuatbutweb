const express = require("express");
const router = express.Router();
const { poolPromise } = require("../config/db");

// 1. API Thêm Tác Giả Mới
router.post("/them", async (req, res) => {
  try {
    const { maTacGia, hoTen, butDanh, loaiTacGia, khuVuc, dienThoai } = req.body;
    const pool = await poolPromise;
    
    // Thêm vào bảng TacGia
    await pool.request()
      .input('Maso', maTacGia)
      .input('Hoten', hoTen)
      .input('LoaiTacgia', loaiTacGia)
      .input('Diachi', khuVuc)
      .input('Dienthoai', dienThoai)
      .query(`
        INSERT INTO TacGia (Maso, Hoten, LoaiTacgia, Diachi, Dienthoai) 
        VALUES (@Maso, @Hoten, @LoaiTacgia, @Diachi, @Dienthoai)
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
    const result = await pool.request().query(`
      SELECT 
        T.Maso as _id, 
        T.Maso as maTacGia, 
        T.Hoten as hoTen, 
        T.LoaiTacgia as loaiTacGia, 
        T.Diachi as khuVuc, 
        T.Dienthoai as dienThoai,
        (SELECT TOP 1 B.Butdanh FROM Butdanh B WHERE B.MsTacgia = T.Maso) as butDanh
      FROM TacGia T
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
    const { hoTen, butDanh, loaiTacGia, khuVuc, dienThoai } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('Maso', id)
      .input('Hoten', hoTen)
      .input('LoaiTacgia', loaiTacGia)
      .input('Diachi', khuVuc)
      .input('Dienthoai', dienThoai)
      .query(`
        UPDATE TacGia 
        SET Hoten = @Hoten, LoaiTacgia = @LoaiTacgia, Diachi = @Diachi, Dienthoai = @Dienthoai
        WHERE Maso = @Maso
      `);

    // Xử lý bút danh (xóa cũ thêm mới để đơn giản)
    if (butDanh) {
        await pool.request().input('Maso', id).query(`DELETE FROM Butdanh WHERE MsTacgia = @Maso`);
        await pool.request()
          .input('Maso', id)
          .input('Butdanh', butDanh)
          .query(`INSERT INTO Butdanh (MsTacgia, Butdanh) VALUES (@Maso, @Butdanh)`);
    }

    res.status(200).json({ message: "Cập nhật thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật!", error: error.message });
  }
});

module.exports = router;
