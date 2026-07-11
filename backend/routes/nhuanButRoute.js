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
    `IF COL_LENGTH('Nhuanbut', 'GhiChu') IS NULL ALTER TABLE Nhuanbut ADD GhiChu nvarchar(MAX)`,
    `IF COL_LENGTH('Nhuanbut', 'Trang') IS NULL ALTER TABLE Nhuanbut ADD Trang NVARCHAR(50)`,
    `IF COL_LENGTH('Nhuanbut', 'Muc') IS NULL ALTER TABLE Nhuanbut ADD Muc NVARCHAR(255)`,
    `IF COL_LENGTH('Nhuanbut', 'Vung') IS NULL ALTER TABLE Nhuanbut ADD Vung NVARCHAR(255)`,
    `IF COL_LENGTH('Nhuanbut', 'VungChuyenDen') IS NULL ALTER TABLE Nhuanbut ADD VungChuyenDen NVARCHAR(255)`
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
  const thue = tien >= 2000000 ? tien * (thueSuat / 100) : 0;
  const thucLanh = tien - thue;
  
  return { thue, thucLanh };
};

// --- API HỖ TRỢ ---
router.get("/dinh-muc", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT DISTINCT Muc, MucToiDa FROM DinhMuc ORDER BY Muc`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
});

router.get("/but-danh", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT DISTINCT Butdanh FROM Butdanh ORDER BY Butdanh`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
});

// 1. LẤY DANH SÁCH BÀI VIẾT
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
        N.Butdanh as butDanh, N.Trang as trang, N.Muc as muc, N.Vung as vung, N.VungChuyenDen as vungChuyenDen,
        CT.Thue as thue, CT.Conlai as thucLanh,
        -- Lấy thông tin Tác Giả: Ưu tiên qua CT, nếu chưa có thì tìm qua Butdanh
        ISNULL(T.Maso, T2.Maso) as tacGia_id, 
        ISNULL(T.Hoten, T2.Hoten) as tacGia_hoTen, 
        ISNULL(T.Diachi, T2.Diachi) as tacGia_khuVuc
      FROM Nhuanbut N
      LEFT JOIN NhuanbutCT CT ON N.Maso = CT.MsNhuanbut
      LEFT JOIN TacGia T ON CT.MsTacgia = T.Maso
      OUTER APPLY (
          SELECT TOP 1 BD.MsTacgia 
          FROM Butdanh BD 
          WHERE BD.Butdanh = N.Butdanh
      ) BD_LINK
      LEFT JOIN TacGia T2 ON BD_LINK.MsTacgia = T2.Maso
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
      butDanh: row.butDanh,
      trang: row.trang,
      muc: row.muc,
      vung: row.vung,
      vungChuyenDen: row.vungChuyenDen,
      tacGia: row.tacGia_id ? {
        _id: row.tacGia_id,
        hoTen: row.tacGia_hoTen,
        khuVuc: row.tacGia_khuVuc
      } : null
    }));

    res.json(danhSach);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi Server" });
  }
});

// 2. THÊM BÀI VIẾT MỚI
router.post("/nhap-bai", async (req, res) => {
  try {
    const { tenBai, butDanh, soBao, tienNhuanBut, ghiChu, nguoiNhap, trang, muc, vung, vungChuyenDen } = req.body;
    const pool = await poolPromise;
    await ensureColumnsExist(pool);

    const { thue, thucLanh } = await tinhTien(tienNhuanBut, pool);

    const maxRes = await pool.request().query(`SELECT ISNULL(MAX(Maso), 0) + 1 as newMaso FROM Nhuanbut`);
    const newMaso = maxRes.recordset[0].newMaso;

    await pool.request()
      .input('Maso', newMaso)
      .input('Tenbai', tenBai)
      .input('TienNhuanbut', tienNhuanBut || 0)
      .input('MsBao', soBao)
      .input('NgayNhap', new Date())
      .input('NguoiNhap', nguoiNhap || 'Thư ký Web')
      .input('GhiChu', ghiChu || null)
      .input('Butdanh', butDanh || null) 
      .input('Trang', trang || null)
      .input('Muc', muc || null)
      .input('Vung', vung || null)
      .input('VungChuyenDen', vungChuyenDen || null)
      .query(`
        INSERT INTO Nhuanbut (Maso, Tenbai, TienNhuanbut, MsBao, ngaychuyen, NguoiNhap, GhiChu, TrangThaiDuyet, Butdanh, Trang, Muc, Vung, VungChuyenDen)
        VALUES (@Maso, @Tenbai, @TienNhuanbut, @MsBao, @NgayNhap, @NguoiNhap, @GhiChu, 0, @Butdanh, @Trang, @Muc, @Vung, @VungChuyenDen)
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
        if (req.body.tenBai !== undefined) { updates.push(`Tenbai = @tenBai`); request.input('tenBai', req.body.tenBai); }
        if (req.body.soBao !== undefined) { updates.push(`MsBao = @soBao`); request.input('soBao', req.body.soBao); }
        if (req.body.ghiChu !== undefined) { updates.push(`GhiChu = @ghiChu`); request.input('ghiChu', req.body.ghiChu); }
        if (req.body.butDanh !== undefined) { updates.push(`Butdanh = @butDanh`); request.input('butDanh', req.body.butDanh); }
        if (req.body.trang !== undefined) { updates.push(`Trang = @trang`); request.input('trang', req.body.trang); }
        if (req.body.muc !== undefined) { updates.push(`Muc = @muc`); request.input('muc', req.body.muc); }
        if (req.body.vung !== undefined) { updates.push(`Vung = @vung`); request.input('vung', req.body.vung); }
        if (req.body.vungChuyenDen !== undefined) { updates.push(`VungChuyenDen = @vungCD`); request.input('vungCD', req.body.vungChuyenDen); }
        if (tienNhuanBut !== undefined) { updates.push(`TienNhuanbut = @tienNB`); request.input('tienNB', tienNhuanBut); }
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

// Tra cứu bài viết
router.get("/tra-cuu", async (req, res) => {
  try {
    const { tuNgay, denNgay, butDanh, soBao, trangThai } = req.query;
    let query = `
      SELECT 
        N.Maso as _id, N.Tenbai as tenBai, N.Butdanh as butDanh,
        N.Muc as muc, N.Trang as trang, N.Vung as vung, N.VungChuyenDen as vungChuyenDen,
        N.Tien as tienNhuanBut, N.MsBao as soBao,
        N.TrangThaiDuyet as trangThaiDuyet,
        N.Ghichu as ghiChu,
        N.NguoiChamTien, N.NgayChamTien,
        N.Thue as thue, N.ThucLanh as thucLanh, N.LyDoBaoSai as lyDoBaoSai,
        T.Maso as tacGia_id, T.Hoten as tacGia_hoTen
      FROM Nhuanbut N
      LEFT JOIN Butdanh BD ON BD.Butdanh = N.Butdanh
      LEFT JOIN TacGia T ON T.Maso = BD.MsTacgia
      WHERE 1=1
    `;
    
    if (butDanh) query += ` AND N.Butdanh LIKE N'%${butDanh}%'`;
    if (soBao) query += ` AND N.MsBao = '${soBao}'`;
    if (trangThai !== undefined && trangThai !== "") query += ` AND N.TrangThaiDuyet = ${trangThai}`;
    if (tuNgay) query += ` AND N.NgayChamTien >= '${tuNgay} 00:00:00'`;
    if (denNgay) query += ` AND N.NgayChamTien <= '${denNgay} 23:59:59'`;
    
    query += ` ORDER BY N.Maso DESC`;

    const pool = await poolPromise;
    const result = await pool.request().query(query);

    const formattedList = result.recordset.map(r => ({
      _id: r._id,
      tenBai: r.tenBai,
      butDanh: r.butDanh,
      muc: r.muc,
      trang: r.trang,
      vung: r.vung,
      vungChuyenDen: r.vungChuyenDen,
      tienNhuanBut: r.tienNhuanBut,
      soBao: r.soBao,
      trangThaiDuyet: r.trangThaiDuyet,
      ghiChu: r.ghiChu,
      ngayChamTien: r.NgayChamTien,
      thue: r.thue,
      thucLanh: r.thucLanh,
      lyDoBaoSai: r.lyDoBaoSai,
      tacGia: r.tacGia_id ? { _id: r.tacGia_id, hoTen: r.tacGia_hoTen } : null
    }));

    res.json(formattedList);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tra cứu dữ liệu!" });
  }
});

module.exports = router;