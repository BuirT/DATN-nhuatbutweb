const express = require("express");
const router = express.Router();
const NhuanBut = require("../models/NhuanBut");

// 1. API Nhập bài viết/tin/ảnh
router.post("/nhap-bai", async (req, res) => {
  try {
    const baiMoi = new NhuanBut(req.body);
    const daLuu = await baiMoi.save();
    res.status(201).json({ message: "Nhập bài viết thành công!", data: daLuu });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống khi thêm bài viết!", error: error.message });
  }
});

// 2. API Lấy danh sách bài viết
router.get("/danh-sach", async (req, res) => {
  try {
    const danhSach = await NhuanBut.find().populate("tacGia", "hoTen butDanh");
    res.status(200).json(danhSach);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách bài viết!", error: error.message });
  }
});

// 3. API Xóa Bài Viết
router.delete("/:id", async (req, res) => {
  try {
    await NhuanBut.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa bài viết thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa bài viết!", error: error.message });
  }
});

// 4. API Cập nhật thông tin bài viết
router.put("/:id", async (req, res) => {
  try {
    const capNhatBai = await NhuanBut.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật bài viết thành công!", data: capNhatBai });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật bài viết!", error: error.message });
  }
});

module.exports = router;
