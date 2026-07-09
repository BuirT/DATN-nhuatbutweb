const express = require("express");
const router = express.Router();
const { poolPromise } = require("../config/db");

// 1. LẤY DANH SÁCH PHIẾU CHI
router.get("/danh-sach", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT Sophieu as _id, Sophieu as soPhieu, Ngaylap as ngayLap, Tacgia as tenTacGia, 
             Nguoinhan as nguoiNhan, Lydo as lyDo, Sotien as tongTien, Conlai as thucLanh, 
             LyDoTuChoi as lyDoTuChoi, Dathutien as dathutien, TrangThaiDuyet as trangThaiDuyet,
             Nguoilap as nguoiLap, NguoiDuyet as nguoiDuyet, NgayDuyet as ngayDuyet, loaiTT
      FROM Phieuchi
      ORDER BY Ngaylap DESC
    `);
    
    // Đổi định dạng xíu cho Frontend dễ hiển thị
    const ds = result.recordset.map(row => ({
      _id: row._id,
      soPhieu: row.soPhieu,
      ngayLap: row.ngayLap,
      tenTacGia: row.tenTacGia,
      nguoiNhan: row.nguoiNhan,
      lyDo: row.lyDo,
      tongTien: row.tongTien,
      thucLanh: row.thucLanh,
      lyDoTuChoi: row.lyDoTuChoi,
      dathutien: row.dathutien, // Y/N
      trangThaiDuyet: row.trangThaiDuyet, // 0: Chờ duyệt, 1: Đã duyệt, -1: Từ chối
      nguoiLap: row.nguoiLap,
      nguoiDuyet: row.nguoiDuyet,
      hinhThuc: row.loaiTT === 'TM' ? 'Tiền mặt' : 'Chuyển khoản'
    }));
    
    res.json(ds);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách phiếu chi", error: error.message });
  }
});

// 2. DUYỆT, TỪ CHỐI HOẶC THANH TOÁN PHIẾU CHI
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id; // soPhieu
    const { action, lyDoTuChoi, nguoiThaoTac } = req.body;
    const pool = await poolPromise;
    const request = pool.request().input('id', id);

    switch(action) {
      case "DUYET":
        await request
          .input('nguoiDuyet', nguoiThaoTac || 'Ban Giám Đốc')
          .query(`UPDATE Phieuchi SET TrangThaiDuyet = 1, NguoiDuyet = @nguoiDuyet, NgayDuyet = GETDATE() WHERE Sophieu = @id`);
        res.json({ message: "Đã duyệt phiếu chi thành công!" });
        break;

      case "TU_CHOI":
        await request
          .input('lyDo', lyDoTuChoi || '')
          .input('nguoiDuyet', nguoiThaoTac || 'Ban Giám Đốc')
          .query(`UPDATE Phieuchi SET TrangThaiDuyet = -1, LyDoTuChoi = @lyDo, NguoiDuyet = @nguoiDuyet, NgayDuyet = GETDATE() WHERE Sophieu = @id`);
        // Nhả bài viết ra khỏi phiếu chi để làm lại
        await pool.request().input('id', id).query(`DELETE FROM NhuanbutCT WHERE SoPC = @id`);
        res.json({ message: "Đã từ chối phiếu chi và nhả bài viết!" });
        break;

      case "THANH_TOAN":
        // Dùng transaction hoặc update theo thứ tự
        // 1. Phieuchi
        await request.query(`UPDATE Phieuchi SET Dathutien = 'Y' WHERE Sophieu = @id`);
        // 2. NhuanbutCT
        await pool.request().input('id', id).query(`UPDATE NhuanbutCT SET SauThanhToan = 'Y' WHERE SoPC = @id`);
        // 3. Nhuanbut
        await pool.request().input('id', id).query(`
          UPDATE n SET DaThanhToan = 1, TrangThaiDuyet = 5, TrangThai = N'Đã thanh toán'
          FROM Nhuanbut n
          INNER JOIN NhuanbutCT ct ON n.Maso = ct.MsNhuanbut
          WHERE ct.SoPC = @id
        `);
        res.json({ message: "Đã thanh toán phiếu chi thành công!" });
        break;
        
      default:
        res.status(400).json({ message: "Action không hợp lệ" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi xử lý phiếu chi", error: error.message });
  }
});

// 3. XÓA VĨNH VIỄN PHIẾU CHI
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const pool = await poolPromise;
    // Xóa CT trước
    await pool.request().input('id', id).query(`DELETE FROM NhuanbutCT WHERE SoPC = @id`);
    // Xóa Phieu
    await pool.request().input('id', id).query(`DELETE FROM Phieuchi WHERE Sophieu = @id`);
    res.json({ message: "Đã xóa phiếu chi thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa phiếu chi", error: error.message });
  }
});

module.exports = router;
