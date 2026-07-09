const express = require("express");
const router = express.Router();
const { poolPromise } = require("../config/db");

// API Thống kê tổng tiền theo từng Tác giả
router.get("/thong-ke-tong", async (req, res) => {
  try {
    const { thang, nam } = req.query;
    const pool = await poolPromise;

    let query = `
      SELECT 
        T.Maso as _id,
        MAX(T.Hoten) as hoTen,
        MAX(T.MsTG) as maTacGia,
        MAX(T.LoaiTacgia) as loaiTacGia,
        SUM(N.TienNhuanbut) as tongTien,
        COUNT(N.Maso) as soBai
      FROM Nhuanbut N
      INNER JOIN NhuanbutCT CT ON N.Maso = CT.MsNhuanbut
      INNER JOIN TacGia T ON CT.MsTacgia = T.Maso
      WHERE N.TrangThai = N'Đã duyệt' AND ISNULL(N.IsDeleted, 0) = 0
    `;

    const request = pool.request();

    if (thang && nam) {
      // Dùng NgayNhap thay cho createdAt
      query += ` AND MONTH(N.NgayNhap) = @thang AND YEAR(N.NgayNhap) = @nam `;
      request.input('thang', thang);
      request.input('nam', nam);
    }

    query += ` GROUP BY T.Maso `;

    const result = await request.query(query);

    // Map kết quả cho khớp với format Frontend yêu cầu
    const thongKe = result.recordset.map(row => ({
      _id: row._id,
      tongTien: row.tongTien,
      soBai: row.soBai,
      infoTacGia: {
        hoTen: row.hoTen,
        maTacGia: row.maTacGia,
        loaiTacGia: row.loaiTacGia
      }
    }));

    res.status(200).json(thongKe);
  } catch (error) {
    console.error("Lỗi thống kê:", error);
    res.status(500).json({ message: "Lỗi thống kê!", error: error.message });
  }
});

module.exports = router;
