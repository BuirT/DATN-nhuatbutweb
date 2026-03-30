const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // Thư viện mã hóa
const TaiKhoan = require("../models/TaiKhoan"); // Trỏ đúng vào Model vừa chốt

// 1. LẤY DANH SÁCH (Không trả về password cho an toàn)
router.get("/danh-sach", async (req, res) => {
  try {
    const users = await TaiKhoan.find().select("-password").sort({ createdAt: -1 }); 
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
});

// 2. TẠO TÀI KHOẢN MỚI
router.post("/them", async (req, res) => {
  try {
    const { username, password, hoTen, vaiTro } = req.body;
    
    const daTonTai = await TaiKhoan.findOne({ username });
    if (daTonTai) return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new TaiKhoan({ username, password: hashedPassword, hoTen, vaiTro });
    await newUser.save();
    res.status(201).json({ message: "Tạo tài khoản thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
});

// 3. CẬP NHẬT TÀI KHOẢN
router.put("/:id", async (req, res) => {
  try {
    const { hoTen, vaiTro, password } = req.body;
    const updateData = { hoTen, vaiTro };
    
    // Nếu Admin gõ pass mới thì mã hóa rồi mới lưu
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    await TaiKhoan.findByIdAndUpdate(req.params.id, updateData);
    res.json({ message: "Cập nhật thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
});

// 4. XÓA TÀI KHOẢN
router.delete("/:id", async (req, res) => {
  try {
    await TaiKhoan.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa tài khoản!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
});

module.exports = router;