const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { poolPromise } = require("../config/db");

// Hàm băm mật khẩu kết hợp với Salt (Khớp với C# Winform)
const hashPasswordSHA256 = (password, salt) => {
  return crypto.createHash('sha256').update(password + (salt || "")).digest('hex');
};

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const pool = await poolPromise;
    const result = await pool.request()
        .input('username', username)
        .query(`SELECT Id as _id, TenDangNhap as username, MatKhau as password, Salt as salt, HoTen as hoTen, Quyen as vaiTro FROM Users WHERE TenDangNhap = @username AND HoatDong = 1`);

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: "Sai tên đăng nhập hoặc mật khẩu!" });
    }

    const user = result.recordset[0];
    
    // So sánh mật khẩu bằng SHA256 có kèm Salt
    const hashedPassword = hashPasswordSHA256(password, user.salt);

    // Bỏ qua phân biệt hoa thường để an toàn tuyệt đối khi map với SQL Server
    if (hashedPassword.toLowerCase() !== user.password.trim().toLowerCase()) {
      // Cho phép đăng nhập nếu mật khẩu cũ không có Salt (legacy data)
      if (password !== user.password.trim()) {
         return res.status(400).json({ message: "Sai tên đăng nhập hoặc mật khẩu!" });
      }
    }

    // Cấp vé thông hành (Token)
    const token = jwt.sign(
      { id: user._id, vaiTro: user.vaiTro, hoTen: user.hoTen },
      process.env.JWT_SECRET || "ToaSoanBao@SecretKey2026",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        _id: user._id,
        username: user.username,
        hoTen: user.hoTen,
        vaiTro: user.vaiTro,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi hệ thống!" });
  }
});

module.exports = router;