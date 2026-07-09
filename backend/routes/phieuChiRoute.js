const express = require("express");
const router = express.Router();
const { poolPromise } = require("../config/db");

// 1. TẠO PHIẾU CHI THEO CHUẨN WINFORM
router.post("/tao-phieu", async (req, res) => {
  try {
    const { tacGia_id, tacGia_butDanh, danhSachBai, tongTien, tongThue, thucLanh, hinhThuc, lyDo, nguoiThaoTac, thueSuat, nguoiNhan, mst, cccd, dienThoai } = req.body;
    const pool = await poolPromise;

    // Sinh mã phiếu chi: VD: PC-20260709-1530
    const d = new Date();
    const soPhieu = "PC-" + d.getFullYear() + (d.getMonth() + 1).toString().padStart(2, '0') + d.getDate().toString().padStart(2, '0') + "-" + d.getHours().toString().padStart(2, '0') + d.getMinutes().toString().padStart(2, '0');

    // Lưu chứng từ Phiếu Chi
    await pool.request()
      .input('Sophieu', soPhieu)
      .input('Ngaylap', new Date())
      .input('Sotien', tongTien)
      .input('Thue', tongThue)
      .input('Conlai', thucLanh)
      .input('Lydo', lyDo || "")
      .input('Nguoinhan', nguoiNhan || tacGia_butDanh)
      .input('Tacgia', tacGia_butDanh)
      .input('Nguoilap', nguoiThaoTac)
      .input('loaiTT', hinhThuc === 'Tiền mặt' ? 'TM' : 'CK')
      .input('MST', mst || "")
      .input('CMND', cccd || "")
      .input('Dienthoai', dienThoai || "")
      .input('Thuesuat', thueSuat || 0)
      .input('Dathutien', 'N')
      .query(`
        INSERT INTO Phieuchi (Sophieu, Ngaylap, Sotien, Thue, Conlai, Lydo, Nguoinhan, Tacgia, Nguoilap, loaiTT, MST, CMND, Dienthoai, Thuesuat, Dathutien, TrangThaiDuyet)
        VALUES (@Sophieu, @Ngaylap, @Sotien, @Thue, @Conlai, @Lydo, @Nguoinhan, @Tacgia, @Nguoilap, @loaiTT, @MST, @CMND, @Dienthoai, @Thuesuat, @Dathutien, 0)
      `);

    // Gắn bài viết vào NhuanbutCT
    if (danhSachBai && danhSachBai.length > 0) {
      for (const bai of danhSachBai) {
        await pool.request()
          .input('MsTacgia', tacGia_id)
          .input('MsNhuanbut', bai._id)
          .input('Sotien', bai.tienNhuanBut)
          .input('SoPC', soPhieu)
          .query(`
            INSERT INTO NhuanbutCT (MsTacgia, MsNhuanbut, Sotien, SoPC, SauThanhToan) 
            VALUES (@MsTacgia, @MsNhuanbut, @Sotien, @SoPC, 'N')
          `);
      }
    }

    res.status(201).json({
      message: "Lập phiếu chi thành công!",
      phieuChi: { soPhieu }
    });
  } catch (error) {
    console.error("Lỗi khi lập phiếu:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi lập phiếu chi" });
  }
});

// 2. LẤY DANH SÁCH BÀI VIẾT CHƯA THANH TOÁN (TrangThaiDuyet = 4 VÀ chưa có trong NhuanbutCT)
router.get("/bai-chua-thanh-toan", async (req, res) => {
  try {
    const { butDanh } = req.query;
    const pool = await poolPromise;
    let query = `
      SELECT Maso as _id, Tenbai as tenBai, TienNhuanbut as tienNhuanBut
      FROM Nhuanbut 
      WHERE Maso NOT IN (SELECT MsNhuanbut FROM NhuanbutCT)
      AND TrangThaiDuyet = 4
    `;
    const request = pool.request();
    if (butDanh) {
       query += ` AND Butdanh = @butDanh`;
       request.input('butDanh', butDanh);
    }
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách bài viết" });
  }
});

module.exports = router;
