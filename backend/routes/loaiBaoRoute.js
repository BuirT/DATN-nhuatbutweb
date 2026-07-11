const express = require("express");
const router = express.Router();
const { poolPromise } = require("../config/db");

// Hàm kiểm tra và thêm bảng nếu thiếu
const ensureTableExists = async (pool) => {
  const query = `
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Loaibao' and xtype='U')
    CREATE TABLE Loaibao (
        Maso NVARCHAR(50) PRIMARY KEY,
        Tenloai NVARCHAR(255)
    )
  `;
  try {
    await pool.request().query(query);
  } catch (e) {
    console.error("Lỗi tạo bảng Loaibao:", e);
  }
};

// Lấy danh sách Loại báo
router.get("/danh-sach", async (req, res) => {
  try {
    const pool = await poolPromise;
    await ensureTableExists(pool);
    const result = await pool.request().query(`SELECT Maso, Tenloai FROM Loaibao ORDER BY Maso`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách Loại báo!" });
  }
});

// Thêm Loại báo
router.post("/them", async (req, res) => {
  try {
    const { maSo, tenLoai } = req.body;
    const pool = await poolPromise;
    await ensureTableExists(pool);

    const check = await pool.request().input('Maso', maSo).query(`SELECT Count(*) as cnt FROM Loaibao WHERE Maso = @Maso`);
    if (check.recordset[0].cnt > 0) {
      return res.status(400).json({ message: "Mã loại báo đã tồn tại!" });
    }

    await pool.request()
      .input('Maso', maSo)
      .input('Tenloai', tenLoai)
      .query(`INSERT INTO Loaibao (Maso, Tenloai) VALUES (@Maso, @Tenloai)`);
      
    res.status(201).json({ message: "Thêm thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm Loại báo!" });
  }
});

// Cập nhật Loại báo
router.put("/:id", async (req, res) => {
  try {
    const { tenLoai } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('Maso', req.params.id)
      .input('Tenloai', tenLoai)
      .query(`UPDATE Loaibao SET Tenloai = @Tenloai WHERE Maso = @Maso`);
    
    res.json({ message: "Cập nhật thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật!" });
  }
});

// Xóa Loại báo
router.delete("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    // Kiểm tra có Số báo nào đang dùng Loại báo này không
    // Cột LoaiBao trong bảng SoBao
    const check = await pool.request().input('Maso', req.params.id).query(`SELECT Count(*) as cnt FROM SoBao WHERE Loaibao = @Maso`);
    if (check.recordset[0].cnt > 0) {
       return res.status(400).json({ message: "Không thể xóa vì có Số báo đang thuộc Loại báo này!" });
    }
    await pool.request().input('Maso', req.params.id).query(`DELETE FROM Loaibao WHERE Maso = @Maso`);
    res.json({ message: "Xóa thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa Loại báo!" });
  }
});

module.exports = router;
