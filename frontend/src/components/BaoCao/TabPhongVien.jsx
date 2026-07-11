import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

function TabPhongVien() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [thang, setThang] = useState(new Date().getMonth() + 1);
  const [nam, setNam] = useState(new Date().getFullYear());

  const fetchPhongVien = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/thongke/phong-vien?thang=${thang}&nam=${nam}`);
      setData(res.data);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu phóng viên!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhongVien();
  }, []);

  const handleExport = () => {
    if (data.length === 0) return toast.warning("Không có dữ liệu!");
    const wsData = data.map((item, index) => ({
      STT: index + 1,
      "Họ Tên Phóng Viên": item.tenTacGia,
      "Phòng Ban": item.phongBan || "Chưa rõ",
      "Số Lượng Bài": item.soBai,
      "Tổng Thu Nhập Nhuận Bút": item.tongTien,
      "Đã Thanh Toán": item.daChi
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "NangSuatPhongVien");
    XLSX.writeFile(wb, `NangSuatPhongVien_${thang}_${nam}.xlsx`);
  };

  const tongNhanSu = data.length;
  const tongSoBai = data.reduce((sum, item) => sum + (item.soBai || 0), 0);
  const tongChiPhi = data.reduce((sum, item) => sum + (item.tongTien || 0), 0);

  return (
    <div className="tab-content">
      <form className="filter-bar" onSubmit={fetchPhongVien}>
        <div className="filter-group">
          <label>Tháng</label>
          <input type="number" min="1" max="12" value={thang} onChange={e => setThang(e.target.value)} required />
        </div>
        <div className="filter-group">
          <label>Năm</label>
          <input type="number" min="2000" max="2100" value={nam} onChange={e => setNam(e.target.value)} required />
        </div>
        <button type="submit" className="btn-fetch">🔍 Tra Cứu Hiệu Suất</button>
        <button type="button" className="btn-export" onClick={handleExport}>🖨 Xuất Excel</button>
      </form>

      <div className="summary-cards">
        <div className="card">
            <div className="card-title">Nhân Sự Có Bài</div>
            <div className="card-value">{tongNhanSu} người</div>
        </div>
        <div className="card">
            <div className="card-title">Tổng Lượng Bài Viết</div>
            <div className="card-value val-blue">{tongSoBai} bài</div>
        </div>
        <div className="card">
            <div className="card-title">Quỹ Nhuận Bút Tháng</div>
            <div className="card-value val-yellow">{tongChiPhi.toLocaleString()}đ</div>
        </div>
      </div>

      <div className="table-section">
        {loading ? <div style={{padding: "20px", textAlign: "center"}}>Đang tải...</div> : (
          <table className="bang-danh-sach" style={{width: "100%"}}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Phóng Viên / Tác Giả</th>
                <th>Phòng Ban</th>
                <th className="text-right">Số Bài Viết</th>
                <th className="text-right">Tổng Nhuận Bút</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className="text-bold">{item.tenTacGia}</td>
                  <td>{item.phongBan || <span style={{color: "var(--text-muted)", fontStyle: "italic"}}>Chưa cập nhật</span>}</td>
                  <td className="text-right text-bold">{item.soBai}</td>
                  <td className="text-right val-yellow text-bold">{item.tongTien.toLocaleString()}đ</td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan="5" style={{textAlign:"center", padding: "20px"}}>Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TabPhongVien;
