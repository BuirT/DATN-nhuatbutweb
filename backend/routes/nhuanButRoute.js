const express = require("express");
const router = express.Router();
const NhuanBut = require("../models/NhuanBut");

// 1. API Nhập bài viết/tin/ảnh (Dành cho tổ nhập liệu)
router.post("/nhap-bai", async (req, res) => {
  try {
    const baiMoi = new NhuanBut(req.body);
    const daLuu = await baiMoi.save();
    res.status(201).json({
      message: "Nhập bài viết thành công!",
      data: daLuu,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống khi thêm bài viết!", error: error.message });
  }
});

// 2. API Lấy danh sách bài viết (Có kèm thông tin Tác giả)
router.get("/danh-sach", async (req, res) => {
  try {
    // Dùng .populate() để tự động lấy tên và bút danh của tác giả dựa vào ID
    const danhSach = await NhuanBut.find().populate("tacGia", "hoTen butDanh");
    res.status(200).json(danhSach);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách bài viết!", error: error.message });
  }
});

// 3. API Cập nhật trạng thái bài viết (Duyệt chi)
router.put("/duyet-bai/:id", async (req, res) => {
  try {
    const { trangThai } = req.body; // Trạng thái mới gửi từ Web xuống
    const baiCapNhat = await NhuanBut.findByIdAndUpdate(
      req.params.id,
      { trangThai: trangThai },
      { new: true }, // Trả về dữ liệu mới nhất sau khi cập nhật
    );
    res.status(200).json({ message: "Đã cập nhật trạng thái thành công!", data: baiCapNhat });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái!", error: error.message });
  }
});

// 4. API Xóa Bài Viết/Nhuận Bút
router.delete("/:id", async (req, res) => {
  try {
    await NhuanBut.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa bài viết thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa bài viết!", error: error.message });
  }
});

// 5. API Cập nhật thông tin bài viết
router.put("/:id", async (req, res) => {
  try {
    const capNhatBai = await NhuanBut.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật bài viết thành công!", data: capNhatBai });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật bài viết!", error: error.message });
  }
});

module.exports = router;
