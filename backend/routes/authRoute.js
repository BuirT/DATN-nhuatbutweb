const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // Thư viện băm nát mật khẩu
const jwt = require("jsonwebtoken"); // Thư viện tạo vé thông hành
const TaiKhoan = require("../models/TaiKhoan");

// 1. API ĐĂNG KÝ (Chỉ dùng để tạo tài khoản ban đầu)
router.post("/dang-ky", async (req, res) => {
  try {
    const { taiKhoan, matKhau, hoTen, vaiTro } = req.body;

    // Kiểm tra xem tài khoản có ai đăng ký chưa
    const tkTonTai = await TaiKhoan.findOne({ taiKhoan });
    if (tkTonTai) return res.status(400).json({ message: "Tên tài khoản này đã có người sử dụng!" });

    // Thuật toán băm nát mật khẩu (Mã hóa)
    const salt = await bcrypt.genSalt(10);
    const hashedMatKhau = await bcrypt.hash(matKhau, salt);

    // Lưu vào Database
    const tkMoi = new TaiKhoan({
      taiKhoan,
      matKhau: hashedMatKhau,
      hoTen,
      vaiTro: vaiTro || "Thư ký",
    });

    await tkMoi.save();
    res.status(201).json({ message: "Tạo tài khoản thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống!", error: error.message });
  }
});

// 2. API ĐĂNG NHẬP
router.post("/dang-nhap", async (req, res) => {
  try {
    const { taiKhoan, matKhau } = req.body;

    // Tìm trong Database xem có tài khoản này không
    const user = await TaiKhoan.findOne({ taiKhoan });
    if (!user) return res.status(400).json({ message: "Sai tên tài khoản hoặc mật khẩu!" });

    // Đem mật khẩu người dùng gõ vào so sánh với mật khẩu đã mã hóa trong DB
    const isMatch = await bcrypt.compare(matKhau, user.matKhau);
    if (!isMatch) return res.status(400).json({ message: "Sai tên tài khoản hoặc mật khẩu!" });

    // Tạo vé thông hành (Token) có hạn dùng 1 ngày
    const token = jwt.sign(
      { id: user._id, vaiTro: user.vaiTro, hoTen: user.hoTen },
      "BiMatCuaToaSoan_DOAN_TOT_NGHIEP", // Chìa khóa bí mật
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      user: { hoTen: user.hoTen, vaiTro: user.vaiTro },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống!", error: error.message });
  }
});

module.exports = router;
