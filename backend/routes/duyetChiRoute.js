const express = require("express");
const router = express.Router();
const NhuanBut = require("../models/NhuanBut"); // Vẫn gọi model Nhuận Bút

// API Cập nhật trạng thái bài viết (Lãnh đạo Duyệt chi)
router.put("/duyet-bai/:id", async (req, res) => {
  try {
    const { trangThai } = req.body;
    const baiCapNhat = await NhuanBut.findByIdAndUpdate(req.params.id, { trangThai: trangThai }, { new: true });
    res.status(200).json({ message: "Đã cập nhật trạng thái thành công!", data: baiCapNhat });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái!", error: error.message });
  }
});

module.exports = router;
