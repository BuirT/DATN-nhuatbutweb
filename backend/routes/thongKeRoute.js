const express = require("express");
const router = express.Router();
const NhuanBut = require("../models/NhuanBut");

// API Thống kê tổng tiền theo từng Tác giả
router.get("/thong-ke-tong", async (req, res) => {
  try {
    const { thang, nam } = req.query;
    let filter = { trangThai: "Đã duyệt" };

    if (thang && nam) {
      const start = new Date(nam, thang - 1, 1);
      const end = new Date(nam, thang, 0, 23, 59, 59);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const thongKe = await NhuanBut.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$tacGia",
          tongTien: { $sum: "$tienNhuanBut" },
          soBai: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "tacgias",
          localField: "_id",
          foreignField: "_id",
          as: "infoTacGia",
        },
      },
      { $unwind: "$infoTacGia" },
    ]);
    res.status(200).json(thongKe);
  } catch (error) {
    res.status(500).json({ message: "Lỗi thống kê!", error: error.message });
  }
});

module.exports = router;
