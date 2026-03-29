const express = require("express");
const router = express.Router();
const NhuanBut = require("../models/NhuanBut");

// --- HÀM TÍNH THUẾ TỰ ĐỘNG ---
// Luật: Từ 2 triệu trở lên tính 10% thuế
const tinhTien = (tienGoc) => {
  const tien = Number(tienGoc) || 0;
  const thue = tien >= 2000000 ? tien * 0.1 : 0;
  const thucLanh = tien - thue;
  return { thue, thucLanh };
};

// 1. LẤY DANH SÁCH BÀI VIẾT (Kèm thông tin tác giả)
router.get("/danh-sach", async (req, res) => {
  try {
    const danhSach = await NhuanBut.find().populate("tacGia", "hoTen maTacGia khuVuc").sort({ createdAt: -1 });
    res.json(danhSach);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách nhuận bút" });
  }
});

// 2. THÊM BÀI VIẾT MỚI (Có tính thuế)
router.post("/nhap-bai", async (req, res) => {
  try {
    const { tenBai, tacGia, soBao, tienNhuanBut, ghiChu } = req.body;

    // Gọi hàm tính tiền ở Backend cho chắc ăn
    const { thue, thucLanh } = tinhTien(tienNhuanBut);

    const baiVietMoi = new NhuanBut({
      tenBai,
      tacGia,
      soBao,
      tienNhuanBut,
      thue,
      thucLanh,
      ghiChu,
    });

    await baiVietMoi.save();
    res.status(201).json(baiVietMoi);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống khi thêm bài viết" });
  }
});

// 3. SỬA BÀI VIẾT (Tính lại thuế nếu đổi tiền)
router.put("/:id", async (req, res) => {
  try {
    const { tienNhuanBut } = req.body;

    // Nếu Thư ký sửa lại tiền gốc, Backend phải tính lại Thuế và Thực lãnh
    const { thue, thucLanh } = tinhTien(tienNhuanBut);

    const dataCapNhat = { ...req.body, thue, thucLanh };

    const baiVietCapNhat = await NhuanBut.findByIdAndUpdate(req.params.id, dataCapNhat, { new: true });
    res.json(baiVietCapNhat);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật bài viết" });
  }
});

// 4. XÓA BÀI VIẾT
router.delete("/:id", async (req, res) => {
  try {
    await NhuanBut.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa bài viết!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa bài viết" });
  }
});

module.exports = router;
