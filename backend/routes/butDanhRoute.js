const express = require("express");
const router = express.Router();
const { poolPromise } = require("../config/db");

// Hàm kiểm tra và thêm bảng Butdanh nếu thiếu
const ensureTableExists = async (pool) => {
  const query = `
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Butdanh' and xtype='U')
    CREATE TABLE Butdanh (
        MsTacgia NVARCHAR(50),
        Butdanh NVARCHAR(255)
    )
  `;
  try {
    await pool.request().query(query);
  } catch (e) {
    console.error("Lỗi tạo bảng Butdanh:", e);
  }
};

// Lấy danh sách Bút danh
router.get("/danh-sach", async (req, res) => {
  try {
    const pool = await poolPromise;
    await ensureTableExists(pool);
    // Left join với TacGia để hiển thị tên Tác giả nếu có
    const result = await pool.request().query(`
      SELECT 
        B.Butdanh as butDanh,
        B.MsTacgia as msTacGia,
        T.Hoten as tenTacGia
      FROM Butdanh B
      LEFT JOIN TacGia T ON B.MsTacgia = T.Maso
      ORDER BY B.Butdanh
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách Bút danh!" });
  }
});

// Thêm Bút danh
router.post("/them", async (req, res) => {
  try {
    const { butDanh, msTacGia } = req.body;
    if (!butDanh) return res.status(400).json({ message: "Bút danh không được để trống" });

    const pool = await poolPromise;
    await ensureTableExists(pool);

    const check = await pool.request().input('Butdanh', butDanh).query(`SELECT Count(*) as cnt FROM Butdanh WHERE Butdanh = @Butdanh`);
    if (check.recordset[0].cnt > 0) {
      return res.status(400).json({ message: "Bút danh này đã tồn tại!" });
    }

    await pool.request()
      .input('MsTacgia', msTacGia || null)
      .input('Butdanh', butDanh)
      .query(`INSERT INTO Butdanh (MsTacgia, Butdanh) VALUES (@MsTacgia, @Butdanh)`);
      
    res.status(201).json({ message: "Thêm thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm Bút danh!" });
  }
});

// Cập nhật Bút danh
router.put("/sua", async (req, res) => {
  try {
    const { oldButDanh, newButDanh, msTacGia } = req.body;
    const pool = await poolPromise;

    if (oldButDanh !== newButDanh) {
        const check = await pool.request().input('Butdanh', newButDanh).query(`SELECT Count(*) as cnt FROM Butdanh WHERE Butdanh = @Butdanh`);
        if (check.recordset[0].cnt > 0) {
            return res.status(400).json({ message: "Bút danh mới đã tồn tại!" });
        }
    }

    await pool.request()
      .input('OldButdanh', oldButDanh)
      .input('NewButdanh', newButDanh)
      .input('MsTacgia', msTacGia || null)
      .query(`UPDATE Butdanh SET Butdanh = @NewButdanh, MsTacgia = @MsTacgia WHERE Butdanh = @OldButdanh`);
    
    // Nếu cập nhật bút danh, cần update cả bảng Nhuanbut
    if (oldButDanh !== newButDanh) {
        await pool.request()
          .input('OldButdanh', oldButDanh)
          .input('NewButdanh', newButDanh)
          .query(`UPDATE Nhuanbut SET Butdanh = @NewButdanh WHERE Butdanh = @OldButdanh`);
    }
    
    res.json({ message: "Cập nhật thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật!" });
  }
});

// Xóa Bút danh
router.delete("/:butDanh", async (req, res) => {
  try {
    const pool = await poolPromise;
    // Kiểm tra có bài viết nào dùng Bút danh này không
    const check = await pool.request().input('Butdanh', req.params.butDanh).query(`SELECT Count(*) as cnt FROM Nhuanbut WHERE Butdanh = @Butdanh`);
    if (check.recordset[0].cnt > 0) {
       return res.status(400).json({ message: "Không thể xóa vì đã có bài viết sử dụng Bút danh này!" });
    }

    await pool.request().input('Butdanh', req.params.butDanh).query(`DELETE FROM Butdanh WHERE Butdanh = @Butdanh`);
    res.json({ message: "Xóa thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa Bút danh!" });
  }
});

module.exports = router;
