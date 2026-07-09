const express = require("express");
const router = express.Router();
const { poolPromise } = require("../config/db");

// Hàm kiểm tra và thêm cột nếu thiếu trong SQL Server
const ensureColumnsExist = async (pool) => {
  const queries = [
    `IF COL_LENGTH('Nhuanbut', 'TrangThaiDuyet') IS NULL ALTER TABLE Nhuanbut ADD TrangThaiDuyet INT DEFAULT 0`,
    `IF COL_LENGTH('Nhuanbut', 'NguoiNhap') IS NULL ALTER TABLE Nhuanbut ADD NguoiNhap nvarchar(100)`,
    `IF COL_LENGTH('Nhuanbut', 'NguoiChamTien') IS NULL ALTER TABLE Nhuanbut ADD NguoiChamTien nvarchar(100)`,
    `IF COL_LENGTH('Nhuanbut', 'NguoiKeToan') IS NULL ALTER TABLE Nhuanbut ADD NguoiKeToan nvarchar(100)`,
    `IF COL_LENGTH('Nhuanbut', 'NguoiKiemTra') IS NULL ALTER TABLE Nhuanbut ADD NguoiKiemTra nvarchar(100)`,
    `IF COL_LENGTH('Nhuanbut', 'TongThuKy') IS NULL ALTER TABLE Nhuanbut ADD TongThuKy nvarchar(100)`,
    `IF COL_LENGTH('Nhuanbut', 'LyDoBaoSai') IS NULL ALTER TABLE Nhuanbut ADD LyDoBaoSai nvarchar(MAX)`,
    `IF COL_LENGTH('Nhuanbut', 'NgayChamTien') IS NULL ALTER TABLE Nhuanbut ADD NgayChamTien datetime`,
    `IF COL_LENGTH('Nhuanbut', 'NgayNhapLieu') IS NULL ALTER TABLE Nhuanbut ADD NgayNhapLieu datetime`,
    `IF COL_LENGTH('Nhuanbut', 'NgayKiemTra') IS NULL ALTER TABLE Nhuanbut ADD NgayKiemTra datetime`,
    `IF COL_LENGTH('Nhuanbut', 'NgayKy') IS NULL ALTER TABLE Nhuanbut ADD NgayKy datetime`,
    `IF COL_LENGTH('Nhuanbut', 'NgayBaoSai') IS NULL ALTER TABLE Nhuanbut ADD NgayBaoSai datetime`,
    `IF COL_LENGTH('Nhuanbut', 'GhiChu') IS NULL ALTER TABLE Nhuanbut ADD GhiChu nvarchar(MAX)`
  ];
  for (let q of queries) {
    try {
      await pool.request().query(q);
    } catch (e) {
      // Bỏ qua lỗi nếu đã tồn tại
    }
  }
};

const tinhTien = async (tienGoc, pool) => {
  let thueSuat = 10;
  try {
    const config = await pool.request().query(`SELECT Giatri FROM gThongso WHERE Maso = 'TyLeThue'`);
    if (config.recordset.length > 0) thueSuat = Number(config.recordset[0].Giatri);
  } catch (e) {}

  const tien = Number(tienGoc) || 0;
  // Áp dụng đúng luật Winform: Từ 2 triệu trở lên mới tính thuế
  const thue = tien >= 2000000 ? tien * (thueSuat / 100) : 0;
  const thucLanh = tien - thue;
  
  return { thue, thucLanh };
};

// 1. LẤY DANH SÁCH BÀI VIẾT THEO LUỒNG WINFORM
router.get("/danh-sach", async (req, res) => {
  try {
    const pool = await poolPromise;
    await ensureColumnsExist(pool);

    const result = await pool.request().query(`
      SELECT 
        N.Maso as _id, N.Tenbai as tenBai, N.MsBao as soBao, N.TienNhuanbut as tienNhuanBut, 
        N.GhiChu as ghiChu, ISNULL(N.TrangThaiDuyet, 0) as trangThaiDuyet,
        N.NguoiNhap as nguoiNhap, N.NguoiChamTien as nguoiChamTien, N.NguoiKeToan as nguoiKeToan, 
        N.NguoiKiemTra as nguoiKiemTra, N.TongThuKy as tongThuKy, N.LyDoBaoSai as lyDoBaoSai,
        N.ngaychuyen as ngayNhap, N.NgayChamTien as ngayChamTien, N.NgayNhapLieu as ngayNhapLieu, 
        N.NgayKiemTra as ngayKiemTra, N.NgayKy as ngayKy,
        CT.Thue as thue, CT.Conlai as thucLanh,
        T.Maso as tacGia_id, T.Hoten as tacGia_hoTen, T.Diachi as tacGia_khuVuc
      FROM Nhuanbut N
      LEFT JOIN NhuanbutCT CT ON N.Maso = CT.MsNhuanbut
      LEFT JOIN TacGia T ON CT.MsTacgia = T.Maso
      ORDER BY ISNULL(N.ngaychuyen, GETDATE()) DESC
    `);

    const danhSach = result.recordset.map(row => ({
      _id: row._id,
      tenBai: row.tenBai,
      soBao: row.soBao,
      tienNhuanBut: row.tienNhuanBut,
      thue: row.thue || 0,
      thucLanh: row.thucLanh || 0,
      ghiChu: row.ghiChu,
      trangThaiDuyet: row.trangThaiDuyet,
      nguoiNhap: row.nguoiNhap,
      nguoiChamTien: row.nguoiChamTien,
      nguoiKeToan: row.nguoiKeToan,
      nguoiKiemTra: row.nguoiKiemTra,
      tongThuKy: row.tongThuKy,
      lyDoBaoSai: row.lyDoBaoSai,
      ngayNhap: row.ngayNhap,
      ngayChamTien: row.ngayChamTien,
      ngayNhapLieu: row.ngayNhapLieu,
      ngayKiemTra: row.ngayKiemTra,
      ngayKy: row.ngayKy,
      tacGia: {
        _id: row.tacGia_id,
        hoTen: row.tacGia_hoTen,
        khuVuc: row.tacGia_khuVuc
      }
    }));

    res.json(danhSach);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi Server" });
  }
});

// 2. THÊM BÀI VIẾT MỚI (Khởi tạo TrangThaiDuyet = 0)
router.post("/nhap-bai", async (req, res) => {
  try {
    const { tenBai, tacGia, soBao, tienNhuanBut, ghiChu, nguoiNhap } = req.body;
    const pool = await poolPromise;
    await ensureColumnsExist(pool);

    const { thue, thucLanh } = await tinhTien(tienNhuanBut, pool);

    const maxRes = await pool.request().query(`SELECT ISNULL(MAX(Maso), 0) + 1 as newMaso FROM Nhuanbut`);
    const newMaso = maxRes.recordset[0].newMaso;

    // Insert vào Nhuanbut với TrangThaiDuyet = 0 (Chờ chấm tiền)
    await pool.request()
      .input('Maso', newMaso)
      .input('Tenbai', tenBai)
      .input('TienNhuanbut', tienNhuanBut)
      .input('MsBao', soBao)
      .input('NgayNhap', new Date())
      .input('NguoiNhap', nguoiNhap || 'Thư ký Web')
      .input('GhiChu', ghiChu)
      .input('Butdanh', tacGia) // Lưu tạm Id tác giả vào Butdanh hoặc bảng phụ
      .query(`
        INSERT INTO Nhuanbut (Maso, Tenbai, TienNhuanbut, MsBao, ngaychuyen, NguoiNhap, GhiChu, TrangThaiDuyet)
        VALUES (@Maso, @Tenbai, @TienNhuanbut, @MsBao, @NgayNhap, @NguoiNhap, @GhiChu, 0)
      `);

    res.status(201).json({ message: "Thêm bài viết chờ duyệt thành công", _id: newMaso });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống khi thêm bài viết" });
  }
});

// 3. SỬA BÀI VIẾT / XỬ LÝ QUY TRÌNH DUYỆT 5 BƯỚC
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { action, tienNhuanBut, lyDoBaoSai, nguoiThaoTac } = req.body;
    const pool = await poolPromise;
    await ensureColumnsExist(pool);

    let queryNB = `UPDATE Nhuanbut SET `;
    let updates = [];
    const request = pool.request().input('id', id);

    // Xử lý luồng duyệt dựa theo action
    switch (action) {
      case "CHAM_TIEN":
        updates.push(`TrangThaiDuyet = 1`, `TienNhuanbut = @tien`, `NguoiChamTien = @nguoi`, `NgayChamTien = GETDATE()`, `LyDoBaoSai = NULL`, `NgayBaoSai = NULL`);
        request.input('tien', tienNhuanBut || 0);
        request.input('nguoi', nguoiThaoTac || 'Thư ký');
        break;
      case "XAC_NHAN_NHAP_LIEU":
        updates.push(`TrangThaiDuyet = 2`, `NguoiKeToan = @nguoi`, `NgayNhapLieu = GETDATE()`);
        request.input('nguoi', nguoiThaoTac || 'Kế toán');
        break;
      case "XAC_NHAN_KIEM_TRA":
        updates.push(`TrangThaiDuyet = 3`, `NguoiKiemTra = @nguoi`, `NgayKiemTra = GETDATE()`);
        request.input('nguoi', nguoiThaoTac || 'Kiểm tra viên');
        break;
      case "KY_DUYET":
        updates.push(`TrangThaiDuyet = 4`, `TongThuKy = @nguoi`, `NgayKy = GETDATE()`);
        request.input('nguoi', nguoiThaoTac || 'Tổng thư ký');
        break;
      case "BAO_SAI_SOT":
        updates.push(`TrangThaiDuyet = 0`, `LyDoBaoSai = @lydo`, `NgayBaoSai = GETDATE()`);
        request.input('lydo', lyDoBaoSai);
        break;
      case "TRA_VE_KE_TOAN":
        updates.push(`TrangThaiDuyet = 2`);
        break;
      case "TRA_VE_KIEM_TRA":
        updates.push(`TrangThaiDuyet = 3`);
        break;
      case "DUYET_NHANH":
        const checkStatus = await pool.request().input('id', id).query(`SELECT TrangThaiDuyet FROM Nhuanbut WHERE Maso = @id`);
        if (checkStatus.recordset.length > 0) {
          const currentStatus = checkStatus.recordset[0].TrangThaiDuyet || 0;
          if (currentStatus < 4) {
             updates.push(`TrangThaiDuyet = ${currentStatus + 1}`);
          }
        }
        break;
      case "DUA_VE_CHO_CHAM_TIEN":
        updates.push(`TrangThaiDuyet = 0`, `TienNhuanbut = 0`, `NguoiChamTien = NULL`, `NgayChamTien = NULL`, `NguoiKeToan = NULL`, `NgayNhapLieu = NULL`, `NguoiKiemTra = NULL`, `NgayKiemTra = NULL`, `TongThuKy = NULL`, `NgayKy = NULL`, `LyDoBaoSai = NULL`, `NgayBaoSai = NULL`);
        break;
      case "UPDATE_INFO":
        if (req.body.tenBai) { updates.push(`Tenbai = @tenBai`); request.input('tenBai', req.body.tenBai); }
        if (req.body.soBao) { updates.push(`MsBao = @soBao`); request.input('soBao', req.body.soBao); }
        if (req.body.ghiChu) { updates.push(`GhiChu = @ghiChu`); request.input('ghiChu', req.body.ghiChu); }
        if (tienNhuanBut !== undefined) { updates.push(`TienNhuanbut = @tien`); request.input('tien', tienNhuanBut); }
        break;
    }

    if (updates.length > 0) {
      queryNB += updates.join(", ") + ` WHERE Maso = @id`;
      await request.query(queryNB);
    }

    res.json({ message: "Cập nhật thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi cập nhật bài viết" });
  }
});

// 4. XÓA BÀI VIẾT
router.delete("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const check = await pool.request().input('id', req.params.id).query(`SELECT Count(*) as cnt FROM NhuanbutCT WHERE MsNhuanbut = @id`);
    if (check.recordset[0].cnt > 0) {
      return res.status(400).json({ message: "Không thể xóa bài viết đã nằm trong phiếu chi/thanh toán!" });
    }
    
    await pool.request().input('id', req.params.id).query(`DELETE FROM Nhuanbut WHERE Maso = @id`);
    res.json({ message: "Đã xóa bài viết khỏi hệ thống!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
});

module.exports = router;