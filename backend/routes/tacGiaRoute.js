const express = require("express");
const router = express.Router();
const TacGia = require("../models/TacGia"); // Gọi cái khuôn Tác Giả lúc nãy mình tạo

// 1. API Thêm Tác Giả Mới
router.post("/them", async (req, res) => {
  try {
    const tacGiaMoi = new TacGia(req.body);
    const daLuu = await tacGiaMoi.save(); // Lưu vào Database
    res.status(201).json({
      message: "Đã thêm Tác giả thành công!",
      data: daLuu,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi rồi anh ơi!", error: error.message });
  }
});

// 2. API Lấy Danh Sách Tác Giả
router.get("/danh-sach", async (req, res) => {
  try {
    const danhSach = await TacGia.find(); // Tìm tất cả trong Database
    res.status(200).json(danhSach);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách!", error: error.message });
  }
});

// 3. API Xóa Tác Giả
router.delete("/:id", async (req, res) => {
  try {
    await TacGia.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa tác giả thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa!", error: error.message });
  }
});

// 4. API Cập nhật thông tin Tác Giả
router.put("/:id", async (req, res) => {
  try {
    const capNhat = await TacGia.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật thành công!", data: capNhat });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật!", error: error.message });
  }
});

module.exports = router;
