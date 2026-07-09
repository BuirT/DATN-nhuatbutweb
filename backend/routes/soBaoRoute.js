const express = require("express");
const router = express.Router();
const { poolPromise } = require("../config/db");

// --- 1. LẤY DANH SÁCH SỐ BÁO ---
router.get("/danh-sach", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        Maso as _id, 
        Maso as maSoBao, 
        Tenbao as tenSoBao, 
        Ngayra as ngayPhatHanh, 
        Loaibao as loaiBao,
        0 as nganSach
      FROM Bao
      ORDER BY Maso DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Lỗi lấy danh sách số báo:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

// THÊM SỐ BÁO MỚI
router.post("/them", async (req, res) => {
  try {
    const { maSoBao, tenSoBao, ngayPhatHanh, loaiBao } = req.body;
    const pool = await poolPromise;

    // Check trùng mã
    const check = await pool.request().input('Maso', maSoBao).query(`SELECT Maso FROM Bao WHERE Maso = @Maso`);
    if (check.recordset.length > 0) {
      return res.status(400).json({ message: "Mã Số Báo này đã tồn tại!" });
    }

    await pool.request()
      .input('Maso', maSoBao)
      .input('Tenbao', tenSoBao)
      .input('Ngayra', ngayPhatHanh ? new Date(ngayPhatHanh) : null)
      .input('Loaibao', loaiBao)
      .query(`
        INSERT INTO Bao (Maso, Tenbao, Ngayra, Loaibao)
        VALUES (@Maso, @Tenbao, @Ngayra, @Loaibao)
      `);

    res.status(201).json({ message: "Thêm thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server khi thêm Số Báo", error: error.message });
  }
});

// --- 3. CẬP NHẬT SỐ BÁO (Dùng cho Sửa) ---
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { tenSoBao, ngayPhatHanh, loaiBao } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('Maso', id)
      .input('Tenbao', tenSoBao)
      .input('Ngayra', ngayPhatHanh ? new Date(ngayPhatHanh) : null)
      .input('Loaibao', loaiBao)
      .query(`
        UPDATE Bao 
        SET Tenbao = @Tenbao, Ngayra = @Ngayra, Loaibao = @Loaibao
        WHERE Maso = @Maso
      `);

    res.json({ message: "Cập nhật thành công" });
  } catch (error) {
    console.error("Lỗi cập nhật số báo:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

// --- 4. XÓA SỐ BÁO ---
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const pool = await poolPromise;

    await pool.request()
      .input('Maso', id)
      .query(`DELETE FROM Bao WHERE Maso = @Maso`);

    res.json({ message: "Đã xóa số báo thành công" });
  } catch (error) {
    console.error("Lỗi xóa số báo:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

module.exports = router;
