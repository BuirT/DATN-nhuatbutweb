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

// 1. API Báo cáo Công Nợ Tác Giả
router.get("/cong-no", async (req, res) => {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT 
          tg.Maso as maTacGia, 
          tg.Hoten as tenTacGia,
          ISNULL(SUM(ct.Sotien), 0) AS tongNo,
          ISNULL(SUM(CASE WHEN pc.TrangThaiDuyet = 1 AND pc.Dathutien = 'Y' THEN ct.Sotien ELSE 0 END), 0) AS daTra,
          ISNULL(SUM(ct.Sotien), 0) - ISNULL(SUM(CASE WHEN pc.TrangThaiDuyet = 1 AND pc.Dathutien = 'Y' THEN ct.Sotien ELSE 0 END), 0) AS conNo
      FROM TacGia tg
      LEFT JOIN NhuanbutCT ct ON tg.Maso = ct.MsTacgia
      LEFT JOIN (
          SELECT Sophieu, MAX(TrangThaiDuyet) AS TrangThaiDuyet, MAX(Dathutien) AS Dathutien
          FROM Phieuchi
          GROUP BY Sophieu
      ) pc ON ct.SoPC = pc.Sophieu
      GROUP BY tg.Maso, tg.Hoten
      HAVING ISNULL(SUM(ct.Sotien), 0) > 0
      ORDER BY conNo DESC
    `;
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error("Lỗi lấy báo cáo công nợ:", error);
    res.status(500).json({ message: "Lỗi báo cáo công nợ!" });
  }
});

// 2. API Báo cáo Lãnh Đạo
router.get("/lanh-dao", async (req, res) => {
  try {
    const { thang, nam } = req.query;
    if (!thang || !nam) return res.status(400).json({ message: "Thiếu tháng hoặc năm" });

    const pool = await poolPromise;
    const query = `
      SELECT 
          nb.Maso as id, nb.Tenbai as tenBai, nb.Tien as tienNhuanbut, nb.TrangThaiDuyet as trangThaiDuyet,
          nb.Butdanh as butDanh, nb.NgayChamTien as ngayDang,
          ct.SauThanhToan as thanhToan, ct.Sotien as soTienThuc,
          tg.Hoten AS tacGia
      FROM Nhuanbut nb
      LEFT JOIN NhuanbutCT ct ON nb.Maso = ct.MsNhuanbut
      LEFT JOIN TacGia tg ON ct.MsTacgia = tg.Maso
      WHERE MONTH(nb.NgayChamTien) = @thang AND YEAR(nb.NgayChamTien) = @nam
      ORDER BY nb.NgayChamTien DESC, tg.Hoten
    `;
    const result = await pool.request()
        .input('thang', thang)
        .input('nam', nam)
        .query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error("Lỗi báo cáo lãnh đạo:", error);
    res.status(500).json({ message: "Lỗi báo cáo lãnh đạo!" });
  }
});

// 3. API Báo cáo Phóng Viên
router.get("/phong-vien", async (req, res) => {
  try {
    const { thang, nam } = req.query;
    if (!thang || !nam) return res.status(400).json({ message: "Thiếu tháng hoặc năm" });

    const pool = await poolPromise;
    const query = `
      SELECT 
          tg.Maso as maTacGia, tg.Hoten as tenTacGia, tg.PhongBan as phongBan,
          COUNT(ct.MsNhuanbut) as soBai,
          ISNULL(SUM(ct.Sotien), 0) as tongTien,
          ISNULL(SUM(CASE WHEN ct.SauThanhToan = 'Y' THEN ct.Sotien ELSE 0 END), 0) as daChi
      FROM TacGia tg
      LEFT JOIN NhuanbutCT ct ON tg.Maso = ct.MsTacgia
      LEFT JOIN Nhuanbut nb ON ct.MsNhuanbut = nb.Maso
      WHERE MONTH(nb.NgayChamTien) = @thang AND YEAR(nb.NgayChamTien) = @nam
      GROUP BY tg.Maso, tg.Hoten, tg.PhongBan
      HAVING COUNT(ct.MsNhuanbut) > 0
      ORDER BY tongTien DESC
    `;
    const result = await pool.request()
        .input('thang', thang)
        .input('nam', nam)
        .query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error("Lỗi báo cáo phóng viên:", error);
    res.status(500).json({ message: "Lỗi báo cáo phóng viên!" });
  }
});

module.exports = router;
