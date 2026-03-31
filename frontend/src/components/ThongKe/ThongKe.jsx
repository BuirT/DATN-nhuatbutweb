import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import * as XLSX from "xlsx"; // 👉 IMPORT THƯ VIỆN EXCEL
import "./ThongKe.css"; 

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function ThongKe() {
  const [danhSachBaiViet, setDanhSachBaiViet] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [thoiGianThuc, setThoiGianThuc] = useState(new Date());

  const layDuLieu = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/nhuanbut/danh-sach");
      setDanhSachBaiViet(res.data);
      setDangTai(false);
    } catch (error) {
      toast.error("Không thể kết nối đến máy chủ để lấy số liệu!");
      setDangTai(false);
    }
  };

  useEffect(() => {
    layDuLieu();
    const timer = setInterval(() => setThoiGianThuc(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatThoiGian = (date) => {
    const thuArr = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const thu = thuArr[date.getDay()];
    const gioPhutGiay = date.toLocaleTimeString('vi-VN', { hour12: false });
    const ngayThangNam = date.toLocaleDateString('vi-VN');
    return `${thu}, ${ngayThangNam} | ⏱️ ${gioPhutGiay}`;
  };

  // 👉 HÀM XUẤT EXCEL THẦN THÁNH
  const handleXuatExcel = () => {
    if (danhSachBaiViet.length === 0) {
      toast.warning("Chưa có dữ liệu để xuất báo cáo!");
      return;
    }

    // 1. Dọn dẹp lại data cho đẹp trước khi đưa vào Excel
    const dataToExport = danhSachBaiViet.map((bai, index) => {
      const tienGoc = Number(bai.tienNhuanBut) || 0;
      const tienThue = tienGoc >= 2000000 ? tienGoc * 0.1 : 0; // Tính nháp lại thuế để hiển thị

      return {
        "STT": index + 1,
        "Tác Giả": bai.tacGia?.hoTen || "Chưa cập nhật",
        "Khu Vực": bai.tacGia?.khuVuc || "Chưa cập nhật",
        "Tên Bài Viết": bai.tenBaiViet || bai.tenBai || bai.tieuDe || "Chưa có tên",
        "Kỳ Báo": bai.soBao || "N/A",
        "Tiền Gốc (VNĐ)": tienGoc,
        "Thuế TNCN (VNĐ)": tienThue,
        "Thực Lãnh (VNĐ)": Number(bai.thucLanh) || (tienGoc - tienThue),
        "Trạng Thái": bai.trangThai || "Chờ duyệt",
        "Kiểm Toán (Người Duyệt)": bai.nguoiThaoTac || "Hệ thống",
      };
    });

    // 2. Tạo sheet và file Excel
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCaoNhuanBut");
    
    // 3. Tự động tải về máy
    XLSX.writeFile(workbook, `Bao_Cao_Toa_Soan_${new Date().getTime()}.xlsx`);
    toast.success("📥 Xuất file Excel thành công! Đã tải về máy.");
  };

  // --- THUẬT TOÁN TÍNH TOÁN (Giữ nguyên) ---
  const tongSoBai = danhSachBaiViet.length;
  const tongTienHienTai = danhSachBaiViet.reduce((sum, bai) => sum + (Number(bai.thucLanh) || 0), 0);
  const tienDaChi = danhSachBaiViet.filter(bai => bai.trangThai === "Đã thanh toán").reduce((sum, bai) => sum + (Number(bai.thucLanh) || 0), 0);
  const tienChuaChi = tongTienHienTai - tienDaChi;
  const tongThue = danhSachBaiViet.reduce((sum, bai) => sum + (Number(bai.thue) || 0), 0);
  const tyLeGiaiNgan = tongTienHienTai > 0 ? Math.round((tienDaChi / tongTienHienTai) * 100) : 0;
  
  const demTrangThai = danhSachBaiViet.reduce((acc, bai) => {
    const status = bai.trangThai || "Chờ duyệt";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const dataByIssue = danhSachBaiViet.reduce((acc, bai) => {
    const issue = bai.soBao || "Chưa rõ";
    acc[issue] = (acc[issue] || 0) + (Number(bai.thucLanh) || 0);
    return acc;
  }, {});
  const issueLabels = Object.keys(dataByIssue);
  const issueValues = Object.values(dataByIssue);

  const dataByRegion = danhSachBaiViet.reduce((acc, bai) => {
    const region = bai.tacGia?.khuVuc || "Chưa rõ";
    if (!acc[region]) acc[region] = { count: 0, money: 0 };
    acc[region].count += 1;
    acc[region].money += (Number(bai.thucLanh) || 0);
    return acc;
  }, {});
  const regionLabels = Object.keys(dataByRegion);
  const regionCounts = regionLabels.map(r => dataByRegion[r].count);
  const regionMoneys = regionLabels.map(r => dataByRegion[r].money);

  const pieData = {
    labels: ['Chờ duyệt', 'Trình Lãnh Đạo', 'Đã duyệt', 'Đã thanh toán'],
    datasets: [{
      data: [demTrangThai['Chờ duyệt'] || 0, demTrangThai['Trình Lãnh Đạo'] || 0, demTrangThai['Đã duyệt'] || 0, demTrangThai['Đã thanh toán'] || 0],
      backgroundColor: ['#facc15', '#3b82f6', '#10b981', '#a855f7'],
      borderColor: '#1e293b',
      borderWidth: 2,
    }],
  };

  const barDataIssue = {
    labels: issueLabels,
    datasets: [{ label: 'Số tiền thực chi (VNĐ)', data: issueValues, backgroundColor: '#38bdf8', borderRadius: 5 }],
  };

  const barDataRegion = {
    labels: regionLabels,
    datasets: [
      { label: 'Số lượng bài', data: regionCounts, backgroundColor: '#f8fafc', borderRadius: 5 },
      { label: 'Số tiền chi (Triệu VNĐ)', data: regionMoneys.map(m => (m / 1000000).toFixed(1)), backgroundColor: '#10b981', borderRadius: 5 }
    ],
  };

  if (dangTai) return <h2 style={{ color: "#38bdf8", textAlign: "center", marginTop: "100px" }}>⏳ Hệ thống đang tổng hợp số liệu...</h2>;

  return (
    <div className="thongke-container" style={{ animation: "fadeIn 0.5s ease-out" }}>
      
      {/* KHU VỰC HEADER CÓ THÊM NÚT XUẤT EXCEL */}
      <div className="thongke-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
        <div>
          <h2 className="thongke-title" style={{ color: "#e2e8f0", margin: 0 }}>📊 BÁO CÁO TOÀN CẢNH TÒA SOẠN</h2>
          <p style={{ color: "#94a3b8", margin: "5px 0 0 0" }}>Số liệu cập nhật theo thời gian thực (Real-time)</p>
        </div>
        
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <button 
            onClick={handleXuatExcel}
            style={{ 
              display: "flex", alignItems: "center", gap: "8px", 
              background: "linear-gradient(90deg, #059669 0%, #10b981 100%)", 
              color: "white", padding: "10px 20px", borderRadius: "8px", 
              border: "none", fontWeight: "bold", cursor: "pointer", 
              boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)",
              transition: "transform 0.2s"
            }}
            onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.target.style.transform = "scale(1)"}
          >
            📥 Xuất Báo Cáo (Excel)
          </button>

          <div style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", padding: "10px 15px", borderRadius: "8px", border: "1px solid #38bdf8", color: "#38bdf8", fontWeight: "bold" }}>
            {formatThoiGian(thoiGianThuc)}
          </div>
        </div>
      </div>

      {/* 4 Thẻ tổng quan */}
      <div className="thongke-grid">
        <div className="stat-card card-blue" style={{ backgroundColor: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(59, 130, 246, 0.3)", padding: "20px", borderRadius: "12px" }}>
          <div className="stat-label" style={{ color: "#94a3b8" }}>Tổng Quy Mô Chi Trả</div>
          <div className="stat-value" style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: "bold", margin: "10px 0" }}>{tongTienHienTai.toLocaleString()}đ</div>
          <div className="stat-sub" style={{ color: "#64748b", fontSize: "13px" }}>Tổng: {tongSoBai} bài viết / ảnh</div>
        </div>
        <div className="stat-card card-green" style={{ backgroundColor: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "20px", borderRadius: "12px" }}>
          <div className="stat-label" style={{ color: "#94a3b8" }}>Đã Giải Ngân (Thanh toán)</div>
          <div className="stat-value" style={{ color: "#34d399", fontSize: "24px", fontWeight: "bold", margin: "10px 0" }}>{tienDaChi.toLocaleString()}đ</div>
          <div className="stat-sub" style={{ color: "#64748b", fontSize: "13px" }}>Hoàn tất thủ tục</div>
        </div>
        <div className="stat-card card-red" style={{ backgroundColor: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(248, 113, 113, 0.3)", padding: "20px", borderRadius: "12px" }}>
          <div className="stat-label" style={{ color: "#94a3b8" }}>Công Nợ Tồn Đọng (Chưa chi)</div>
          <div className="stat-value" style={{ color: "#f87171", fontSize: "24px", fontWeight: "bold", margin: "10px 0" }}>{tienChuaChi.toLocaleString()}đ</div>
          <div className="stat-sub" style={{ color: "#64748b", fontSize: "13px" }}>Đang chờ Ký duyệt / Xuất quỹ</div>
        </div>
        <div className="stat-card card-yellow" style={{ backgroundColor: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(250, 204, 21, 0.3)", padding: "20px", borderRadius: "12px" }}>
          <div className="stat-label" style={{ color: "#94a3b8" }}>Tổng Thuế Thu Hộ (TNCN)</div>
          <div className="stat-value" style={{ color: "#facc15", fontSize: "24px", fontWeight: "bold", margin: "10px 0" }}>{tongThue.toLocaleString()}đ</div>
          <div className="stat-sub" style={{ color: "#64748b", fontSize: "13px" }}>Tạm giữ để nộp ngân sách</div>
        </div>
      </div>

      {/* Thanh tiến độ giải ngân */}
      <div className="progress-section" style={{ backgroundColor: "rgba(30, 41, 59, 0.6)", padding: "20px", borderRadius: "12px", marginTop: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="progress-header" style={{ display: "flex", justifyContent: "space-between", color: "#e2e8f0", fontWeight: "bold", marginBottom: "10px" }}>
          <span>Tiến độ Giải Ngân Quỹ Nhuận Bút</span>
          <span style={{ color: "#34d399", fontSize: "18px" }}>{tyLeGiaiNgan}%</span>
        </div>
        <div className="progress-bar-bg" style={{ backgroundColor: "#0f172a", height: "20px", borderRadius: "10px", overflow: "hidden" }}>
          <div className="progress-bar-fill" style={{ width: `${tyLeGiaiNgan}%`, backgroundColor: "#10b981", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px", fontWeight: "bold", transition: "width 1s ease-in-out" }}>
            {tyLeGiaiNgan > 5 && `${tyLeGiaiNgan}%`}
          </div>
        </div>
      </div>

      {/* Lưới 3 Biểu đồ trực quan */}
      <div className="section-charts" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
        
        <div className="chart-card" style={{ gridColumn: "1 / -1", backgroundColor: "rgba(30, 41, 59, 0.6)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}> 
            <h3 className="chart-title" style={{ color: "#e2e8f0", marginTop: 0 }}>💰 Số tiền Nhuận bút chi cho mỗi Kỳ Báo</h3>
            <div style={{ height: "300px" }}>
                <Bar data={barDataIssue} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } } }} />
            </div>
        </div>

        <div className="chart-card" style={{ backgroundColor: "rgba(30, 41, 59, 0.6)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 className="chart-title" style={{ color: "#e2e8f0", marginTop: 0 }}>📁 Cơ cấu Trạng Thái Xử Lý</h3>
          <div style={{ height: "250px", display: "flex", justifyContent: "center" }}>
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 13 } } } } }} />
          </div>
        </div>

        <div className="chart-card" style={{ backgroundColor: "rgba(30, 41, 59, 0.6)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 className="chart-title" style={{ color: "#e2e8f0", marginTop: 0 }}>📍 Hoạt Động Theo Khu Vực</h3>
          <div style={{ height: "250px" }}>
            <Bar data={barDataRegion} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: '#94a3b8', font: { size: 12 } } } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' } }, y: { grid: { display: false } } } }} />
          </div>
        </div>
      </div>

    </div>
  );
}

export default ThongKe;