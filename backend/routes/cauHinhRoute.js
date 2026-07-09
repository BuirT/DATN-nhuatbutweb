const express = require("express");
const router = express.Router();
const { poolPromise } = require("../config/db");

// Hàm lấy một tham số, nếu không có thì insert default
const getOrSetParam = async (pool, maso, defaultValue) => {
  const res = await pool.request().input('Maso', maso).query(`SELECT Giatri FROM gThongso WHERE Maso = @Maso`);
  if (res.recordset.length > 0) {
    return Number(res.recordset[0].Giatri);
  } else {
    await pool.request()
      .input('Maso', maso)
      .input('Giatri', defaultValue.toString())
      .query(`INSERT INTO gThongso (Maso, Giatri) VALUES (@Maso, @Giatri)`);
    return defaultValue;
  }
};

// 1. LẤY CẤU HÌNH HIỆN TẠI
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const mucChiuThue = await getOrSetParam(pool, 'MucChiuThue', 2000000);
    const phanTramThue = await getOrSetParam(pool, 'TyLeThue', 10);
    
    res.json({ mucChiuThue, phanTramThue });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
});

// 2. CẬP NHẬT CẤU HÌNH
router.put("/", async (req, res) => {
  try {
    const { mucChiuThue, phanTramThue } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('Maso', 'MucChiuThue')
      .input('Giatri', mucChiuThue.toString())
      .query(`UPDATE gThongso SET Giatri = @Giatri WHERE Maso = @Maso`);

    await pool.request()
      .input('Maso', 'TyLeThue')
      .input('Giatri', phanTramThue.toString())
      .query(`UPDATE gThongso SET Giatri = @Giatri WHERE Maso = @Maso`);

    res.json({ 
      message: "Đã cập nhật luật Thuế mới!", 
      config: { mucChiuThue, phanTramThue } 
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
});

module.exports = router;