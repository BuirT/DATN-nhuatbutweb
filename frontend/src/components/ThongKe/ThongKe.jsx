import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import "./ThongKe.css";

function ThongKe() {
  const [danhSachBai, setDanhSachBai] = useState([]);
  const [thang, setThang] = useState(new Date().getMonth() + 1);
  const [nam, setNam] = useState(new Date().getFullYear());
  const [thoiGianThuc, setThoiGianThuc] = useState(new Date());

  // Bảng màu chuẩn FinTech Darkmode cho biểu đồ
  const COLORS_BAR = ["#00f2fe", "#4facfe", "#38bdf8", "#818cf8", "#a855f7", "#e879f9"];
  const COLORS_PIE = ["#facc15", "#34d399", "#fb923c", "#f43f5e", "#60a5fa"];

  // --- ĐỒNG HỒ REALTIME ---
  useEffect(() => {
    const timer = setInterval(() => {
      setThoiGianThuc(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const layDuLieu = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/nhuanbut/danh-sach");
      const baiHople = res.data.filter((bai) => bai.trangThai === "Đã duyệt" || bai.trangThai === "Đã thanh toán");
      setDanhSachBai(baiHople);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    }
  };

  useEffect(() => {
    layDuLieu();
  }, []);

  // --- 1. BỘ LỌC DỮ LIỆU THEO THÁNG & NĂM ---
  const danhSachHienThi = danhSachBai.filter((bai) => {
    const date = new Date(bai.createdAt);
    return date.getMonth() + 1 === Number(thang) && date.getFullYear() === Number(nam);
  });

  // --- 2. TÍNH TOÁN CÁC CHỈ SỐ TỔNG QUAN ---
  const tongTien = danhSachHienThi.reduce((acc, bai) => acc + (bai.thucLanh || bai.tienNhuanBut || 0), 0);
  const tongSoBai = danhSachHienThi.length;

  // --- 3. CHẾ BIẾN DỮ LIỆU TÁC GIẢ (SỬA LẠI LOGIC GOM NHÓM CHUẨN HƠN) ---
  const mapTacGia = {};
  danhSachHienThi.forEach((bai) => {
    const tenTG = bai.tacGia?.hoTen || "Ẩn danh";
    const khuVuc = bai.tacGia?.khuVuc || "Chưa rõ";
    const tien = bai.thucLanh || bai.tienNhuanBut || 0;

    if (!mapTacGia[tenTG]) {
      mapTacGia[tenTG] = { name: tenTG, khuVuc: khuVuc, soBai: 0, tien: 0 };
    }
    mapTacGia[tenTG].soBai += 1;
    mapTacGia[tenTG].tien += tien;
  });

  const dataTacGia = Object.values(mapTacGia).sort((a, b) => b.tien - a.tien);
  const tongSoTacGia = dataTacGia.length;

  // --- 4. CHẾ BIẾN DỮ LIỆU KHU VỰC ---
  const mapKhuVuc = {};
  danhSachHienThi.forEach((bai) => {
    const khuVuc = bai.tacGia?.khuVuc || "Chưa rõ";
    const tien = bai.thucLanh || bai.tienNhuanBut || 0;

    if (!mapKhuVuc[khuVuc]) {
      mapKhuVuc[khuVuc] = { name: khuVuc, tien: 0 };
    }
    mapKhuVuc[khuVuc].tien += tien;
  });
  const dataKhuVuc = Object.values(mapKhuVuc);

  // --- 5. HÀM XUẤT EXCEL ---
  const handleXuatExcel = () => {
    if (danhSachHienThi.length === 0) {
      alert("Đồng chí ơi, tháng này chưa có dữ liệu để xuất đâu!");
      return;
    }
    const dataExcel = danhSachHienThi.map((bai, index) => ({
      STT: index + 1,
      "Tên Bài": bai.tenBai,
      "Tác giả": bai.tacGia?.hoTen || "Ẩn danh",
      "Khu Vực": bai.tacGia?.khuVuc || "Chưa rõ",
      "Số Báo": bai.soBao,
      "Tiền Thực Lãnh (VNĐ)": bai.thucLanh || bai.tienNhuanBut || 0,
      "Trạng Thái": bai.trangThai,
      "Ngày Tạo": new Date(bai.createdAt).toLocaleDateString("vi-VN"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCao");
    XLSX.writeFile(workbook, `BaoCao_Thang${thang}_${nam}.xlsx`);
  };

  return (
    <div className="thongke-container">
      {/* HEADER: TIÊU ĐỀ & ĐỒNG HỒ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ color: "#fff", margin: 0 }}>📊 DASHBOARD THỐNG KÊ NHUẬN BÚT</h2>
        <div style={{ color: "#38bdf8", fontSize: "1.2rem", fontWeight: "bold", background: "#1e293b", padding: "8px 15px", borderRadius: "8px" }}>
          🕒 {thoiGianThuc.toLocaleTimeString("vi-VN")} | {thoiGianThuc.toLocaleDateString("vi-VN")}
        </div>
      </div>

      {/* BỘ LỌC VÀ CÁC THẺ TỔNG QUAN (CARDS) */}
      <div className="st-card" style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
        <div className="filter-box" style={{ display: "flex", gap: "20px", alignItems: "center", borderBottom: "1px solid #334155", paddingBottom: "15px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <label style={{ color: "#fff", fontWeight: "bold" }}>Tháng:</label>
            <select value={thang} onChange={(e) => setThang(e.target.value)} style={{ padding: "5px", borderRadius: "5px" }}>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <label style={{ color: "#fff", fontWeight: "bold" }}>Năm:</label>
            <select value={nam} onChange={(e) => setNam(e.target.value)} style={{ padding: "5px", borderRadius: "5px" }}>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <button
            onClick={handleXuatExcel}
            className="btn-excel"
            style={{ marginLeft: "auto", padding: "8px 15px", background: "#10b981", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
          >
            📥 Xuất Báo Cáo Excel
          </button>
        </div>

        {/* 3 THẺ THỐNG KÊ CHI TIẾT */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ flex: 1, background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", padding: "20px", borderRadius: "10px", borderLeft: "4px solid #38bdf8", textAlign: "center" }}>
            <p style={{ color: "#94a3b8", fontSize: "1.1rem", margin: "0 0 10px 0" }}>Tổng Tiền Đã Chi</p>
            <h2 style={{ color: "#38bdf8", margin: 0, fontSize: "2rem" }}>{tongTien.toLocaleString()} đ</h2>
          </div>
          <div style={{ flex: 1, background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", padding: "20px", borderRadius: "10px", borderLeft: "4px solid #a855f7", textAlign: "center" }}>
            <p style={{ color: "#94a3b8", fontSize: "1.1rem", margin: "0 0 10px 0" }}>Tổng Số Bài Viết</p>
            <h2 style={{ color: "#a855f7", margin: 0, fontSize: "2rem" }}>{tongSoBai} bài</h2>
          </div>
          <div style={{ flex: 1, background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", padding: "20px", borderRadius: "10px", borderLeft: "4px solid #facc15", textAlign: "center" }}>
            <p style={{ color: "#94a3b8", fontSize: "1.1rem", margin: "0 0 10px 0" }}>Số Lượng Tác Giả</p>
            <h2 style={{ color: "#facc15", margin: 0, fontSize: "2rem" }}>{tongSoTacGia} người</h2>
          </div>
        </div>
      </div>

      {/* KHU VỰC 2 BIỂU ĐỒ */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px" }}>
        <div className="st-card" style={{ flex: 2, minWidth: "400px" }}>
          <h3 style={{ textAlign: "center", color: "#e2e8f0", marginBottom: "20px" }}>Top Tác Giả Nhận Nhuận Bút</h3>
          <div style={{ width: "100%", height: 300 }}>
            {dataTacGia.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={dataTacGia} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis tickFormatter={(value) => `${value / 1000}k`} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} formatter={(value) => `${value.toLocaleString()} VNĐ`} />
                  <Bar dataKey="tien" radius={[5, 5, 0, 0]}>
                    {dataTacGia.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_BAR[index % COLORS_BAR.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: "center", color: "#64748b", marginTop: "100px" }}>Tháng này chưa có dữ liệu rủng rỉnh đâu đồng chí ạ</p>
            )}
          </div>
        </div>

        <div className="st-card" style={{ flex: 1, minWidth: "300px" }}>
          <h3 style={{ textAlign: "center", color: "#e2e8f0", marginBottom: "20px" }}>Tỷ Trọng Khu Vực</h3>
          <div style={{ width: "100%", height: 300 }}>
            {dataKhuVuc.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={dataKhuVuc} cx="50%" cy="45%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="tien">
                    {dataKhuVuc.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} formatter={(value) => `${value.toLocaleString()} VNĐ`} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: "#e2e8f0" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: "center", color: "#64748b", marginTop: "100px" }}>Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {/* BẢNG CHI TIẾT */}
      <div className="st-card card-chart">
        <h3 style={{ marginBottom: "15px", color: "#e2e8f0" }}>
          Bảng Kê Chi Tiết Tác Giả - Tháng {thang}/{nam}
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table className="bang-thongke" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", color: "#e2e8f0" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #334155" }}>
                <th style={{ padding: "12px" }}>Tác giả</th>
                <th style={{ padding: "12px" }}>Khu Vực</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Số Bài</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Tổng Thực Lãnh</th>
              </tr>
            </thead>
            <tbody>
              {dataTacGia.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #1e293b" }}>
                  <td style={{ padding: "12px", fontWeight: "bold", color: "#38bdf8" }}>{item.name}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ backgroundColor: "rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: "5px", fontSize: "12px" }}>{item.khuVuc}</span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>{item.soBai}</td>
                  <td style={{ padding: "12px", textAlign: "right", fontWeight: "bold", color: "#10b981" }}>{item.tien.toLocaleString()} đ</td>
                </tr>
              ))}
              {dataTacGia.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                    Không có dữ liệu trong thời gian này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ThongKe;
