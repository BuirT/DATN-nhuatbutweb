const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { poolPromise } = require("../config/db");

// Hàm sinh chuỗi ngẫu nhiên (Salt 16 bytes) giống Winform
const generateSalt = () => {
  return crypto.randomBytes(16).toString("base64");
};

// Hàm băm mật khẩu SHA256 kèm Salt
const hashPasswordSHA256 = (password, salt) => {
  return crypto.createHash('sha256').update(password + (salt || "")).digest('hex');
};

// 1. LẤY DANH SÁCH (Không trả về password)
router.get("/danh-sach", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT Id as _id, TenDangNhap as username, HoTen as hoTen, Quyen as vaiTro 
      FROM Users 
      WHERE HoatDong = 1
      ORDER BY Id DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

// 2. TẠO TÀI KHOẢN MỚI
router.post("/them", async (req, res) => {
  try {
    const { username, password, hoTen, vaiTro } = req.body;
    const pool = await poolPromise;
    
    const tonTai = await pool.request().input('username', username).query(`SELECT Id FROM Users WHERE TenDangNhap = @username`);
    if (tonTai.recordset.length > 0) return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });

    // Thuật toán Salt + SHA256
    const salt = generateSalt();
    const hashedPassword = hashPasswordSHA256(password, salt);

    await pool.request()
      .input('username', username)
      .input('password', hashedPassword)
      .input('salt', salt)
      .input('hoTen', hoTen)
      .input('vaiTro', vaiTro)
      .query(`
        INSERT INTO Users (TenDangNhap, MatKhau, Salt, HoTen, Quyen, HoatDong) 
        VALUES (@username, @password, @salt, @hoTen, @vaiTro, 1)
      `);
      
    res.status(201).json({ message: "Tạo tài khoản thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

// 3. CẬP NHẬT TÀI KHOẢN
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { hoTen, vaiTro, password } = req.body;
    const pool = await poolPromise;

    let query = `UPDATE Users SET HoTen = @hoTen, Quyen = @vaiTro`;
    const request = pool.request()
      .input('id', id)
      .input('hoTen', hoTen)
      .input('vaiTro', vaiTro);

    if (password) {
      const salt = generateSalt();
      const hashedPassword = hashPasswordSHA256(password, salt);
      query += `, MatKhau = @password, Salt = @salt`;
      request.input('password', hashedPassword);
      request.input('salt', salt);
    }

    query += ` WHERE Id = @id`;
    await request.query(query);

    res.json({ message: "Cập nhật thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

// 4. XÓA TÀI KHOẢN (Xóa mềm - set HoatDong = 0)
router.delete("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request().input('id', req.params.id).query(`UPDATE Users SET HoatDong = 0 WHERE Id = @id`);
    res.json({ message: "Đã xóa tài khoản!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

module.exports = router;