const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // Dùng bcrypt đồng bộ với userRoute
const jwt = require("jsonwebtoken"); 
const TaiKhoan = require("../models/TaiKhoan");

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Tìm tài khoản
    const user = await TaiKhoan.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Sai tên đăng nhập hoặc mật khẩu!" });
    }

    // 2. So sánh mật khẩu (Dùng bcrypt chuẩn)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai tên đăng nhập hoặc mật khẩu!" });
    }

    // 3. Cấp vé thông hành (Token)
    const token = jwt.sign(
      { id: user._id, vaiTro: user.vaiTro, hoTen: user.hoTen },
      "ToaSoanBao@SecretKey2026",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Đăng nhập thành công!",
      token: token,
      hoTen: user.hoTen,
      vaiTro: user.vaiTro
    });

  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi Server!" });
  }
});

module.exports = router;