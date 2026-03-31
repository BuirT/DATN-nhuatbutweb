import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import "./ThongKe.css"; // GỌI FILE CSS GIAO DIỆN

// Đăng ký các phần tử biểu đồ với Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function ThongKe() {
  const [danhSachBaiViet, setDanhSachBaiViet] = useState([]);
  const [dangTai, setDangTai] = useState(true);

  // 👉 STATE MỚI: LƯU TRỮ THỜI GIAN THỰC
  const [thoiGianThuc, setThoiGianThuc] = useState(new Date());

  // --- GỌI API LẤY DỮ LIỆU ---
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

    // 👉 THIẾT LẬP ĐỒNG HỒ NHẢY TỪNG GIÂY (1000ms)
    const timer = setInterval(() => {
      setThoiGianThuc(new Date());
    }, 1000);

    // Dọn dẹp bộ nhớ khi tắt trang
    return () => clearInterval(timer);
  }, []);

  // Hàm định dạng thời gian cho đẹp mắt
  const formatThoiGian = (date) => {
    const thuArr = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const thu = thuArr[date.getDay()];
    const gioPhutGiay = date.toLocaleTimeString("vi-VN", { hour12: false });
    const ngayThangNam = date.toLocaleDateString("vi-VN");
    return `${thu}, ${ngayThangNam} | ⏱️ ${gioPhutGiay}`;
  };

  // ==========================================
  // THUẬT TOÁN TÍNH TOÁN DÒNG TIỀN TỔNG QUAN
  // ==========================================
  const tongSoBai = danhSachBaiViet.length;
  const tongTienHienTai = danhSachBaiViet.reduce((sum, bai) => sum + (Number(bai.thucLanh) || 0), 0);
  const tienDaChi = danhSachBaiViet.filter((bai) => bai.trangThai === "Đã thanh toán").reduce((sum, bai) => sum + (Number(bai.thucLanh) || 0), 0);
  const tienChuaChi = tongTienHienTai - tienDaChi;
  const tongThue = danhSachBaiViet.reduce((sum, bai) => sum + (Number(bai.thue) || 0), 0);
  const tyLeGiaiNgan = tongTienHienTai > 0 ? Math.round((tienDaChi / tongTienHienTai) * 100) : 0;

  const demTrangThai = danhSachBaiViet.reduce((acc, bai) => {
    const status = bai.trangThai || "Chờ duyệt";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // ==========================================
  // THUẬT TOÁN BÓC TÁCH DỮ LIỆU CHO 3 BIỂU ĐỒ
  // ==========================================

  // 1. Dữ liệu: Tiền chi theo Số báo
  const dataByIssue = danhSachBaiViet.reduce((acc, bai) => {
    const issue = bai.soBao || "Chưa rõ";
    acc[issue] = (acc[issue] || 0) + (Number(bai.thucLanh) || 0);
    return acc;
  }, {});
  const issueLabels = Object.keys(dataByIssue);
  const issueValues = Object.values(dataByIssue);

  // 2. Dữ liệu: Hoạt động theo Khu vực
  const dataByRegion = danhSachBaiViet.reduce((acc, bai) => {
    const region = bai.tacGia?.khuVuc || "Chưa rõ";
    if (!acc[region]) acc[region] = { count: 0, money: 0 };
    acc[region].count += 1;
    acc[region].money += Number(bai.thucLanh) || 0;
    return acc;
  }, {});
  const regionLabels = Object.keys(dataByRegion);
  const regionCounts = regionLabels.map((r) => dataByRegion[r].count);
  const regionMoneys = regionLabels.map((r) => dataByRegion[r].money);

  // ==========================================
  // CẤU HÌNH GIAO DIỆN BIỂU ĐỒ (CHART.JS CONFIG)
  // ==========================================

  const pieData = {
    labels: ["Chờ duyệt", "Trình Lãnh Đạo", "Đã duyệt", "Đã thanh toán"],
    datasets: [
      {
        data: [demTrangThai["Chờ duyệt"] || 0, demTrangThai["Trình Lãnh Đạo"] || 0, demTrangThai["Đã duyệt"] || 0, demTrangThai["Đã thanh toán"] || 0],
        backgroundColor: ["#facc15", "#3b82f6", "#10b981", "#a855f7"],
        borderColor: "#1e293b",
        borderWidth: 2,
      },
    ],
  };

  const barDataIssue = {
    labels: issueLabels,
    datasets: [
      {
        label: "Số tiền thực chi (VNĐ)",
        data: issueValues,
        backgroundColor: "#38bdf8",
        borderRadius: 5,
      },
    ],
  };

  const barDataRegion = {
    labels: regionLabels,
    datasets: [
      {
        label: "Số lượng bài (Cột trắng)",
        data: regionCounts,
        backgroundColor: "#f8fafc",
        borderRadius: 5,
      },
      {
        label: "Số tiền chi (Triệu VNĐ - Cột xanh)",
        data: regionMoneys.map((m) => (m / 1000000).toFixed(1)),
        backgroundColor: "#10b981",
        borderRadius: 5,
      },
    ],
  };

  // --- MÀN HÌNH CHỜ (LOADING) ---
  if (dangTai) {
    return <h2 style={{ color: "#38bdf8", textAlign: "center", marginTop: "100px" }}>⏳ Hệ thống đang tổng hợp số liệu...</h2>;
  }

  // --- GIAO DIỆN CHÍNH ---
  return (
    <div className="thongke-container">
      {/* Tiêu đề trang & Đồng hồ Real-time */}
      <div className="thongke-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 className="thongke-title">📊 BÁO CÁO TOÀN CẢNH TÒA SOẠN</h2>
        </div>

        {/* 👉 KHU VỰC HIỂN THỊ ĐỒNG HỒ */}
        <div
          style={{
            backgroundColor: "#0f172a",
            padding: "8px 15px",
            borderRadius: "8px",
            border: "1px solid #38bdf8",
            color: "#38bdf8",
            fontWeight: "bold",
            boxShadow: "0 0 10px rgba(56, 189, 248, 0.2)",
          }}
        >
          {formatThoiGian(thoiGianThuc)}
        </div>
      </div>

      {/* 4 Thẻ tổng quan */}
      <div className="thongke-grid">
        <div className="stat-card card-blue">
          <div className="stat-label">Tổng Quy Mô Chi Trả</div>
          <div className="stat-value">{tongTienHienTai.toLocaleString()}đ</div>
          <div className="stat-sub">Tổng: {tongSoBai} bài viết / ảnh</div>
        </div>
        <div className="stat-card card-green">
          <div className="stat-label">Đã Giải Ngân (Thanh toán)</div>
          <div className="stat-value" style={{ color: "#34d399" }}>
            {tienDaChi.toLocaleString()}đ
          </div>
          <div className="stat-sub">Hoàn tất thủ tục</div>
        </div>
        <div className="stat-card card-red">
          <div className="stat-label">Công Nợ Tồn Đọng (Chưa chi)</div>
          <div className="stat-value" style={{ color: "#f87171" }}>
            {tienChuaChi.toLocaleString()}đ
          </div>
          <div className="stat-sub">Đang chờ Ký duyệt / Xuất quỹ</div>
        </div>
        <div className="stat-card card-yellow">
          <div className="stat-label">Tổng Thuế Thu Hộ (TNCN)</div>
          <div className="stat-value" style={{ color: "#facc15" }}>
            {tongThue.toLocaleString()}đ
          </div>
          <div className="stat-sub">Tạm giữ để nộp ngân sách</div>
        </div>
      </div>

      {/* Thanh tiến độ giải ngân */}
      <div className="progress-section">
        <div className="progress-header">
          <span>Tiến độ Giải Ngân Quỹ Nhuận Bút</span>
          <span style={{ color: "#34d399", fontSize: "18px" }}>{tyLeGiaiNgan}%</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${tyLeGiaiNgan}%` }}>
            {tyLeGiaiNgan > 5 && `${tyLeGiaiNgan}%`}
          </div>
        </div>
        <p style={{ color: "#64748b", fontSize: "13px", marginTop: "10px", fontStyle: "italic" }}>* Biểu đồ thể hiện tỷ lệ số tiền đã thực chi so với tổng số tiền Tòa soạn cam kết trả.</p>
      </div>

      {/* Lưới 3 Biểu đồ trực quan */}
      <div className="section-charts">
        {/* Biểu đồ cột ngang to: Tiền theo số báo */}
        <div className="chart-card" style={{ gridColumn: "1 / -1" }}>
          <h3 className="chart-title">💰 Số tiền Nhuận bút chi cho mỗi Kỳ Báo</h3>
          <div style={{ height: "300px" }}>
            <Bar
              data={barDataIssue}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { grid: { color: "rgba(255,255,255,0.05)" } }, x: { grid: { display: false } } },
              }}
            />
          </div>
        </div>

        {/* Biểu đồ tròn: Trạng thái */}
        <div className="chart-card">
          <h3 className="chart-title">📁 Cơ cấu Trạng Thái Xử Lý</h3>
          <div style={{ height: "250px", display: "flex", justifyContent: "center" }}>
            <Pie
              data={pieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom", labels: { color: "#94a3b8", font: { size: 13 } } } },
              }}
            />
          </div>
        </div>

        {/* Biểu đồ ngang: Khu vực */}
        <div className="chart-card">
          <h3 className="chart-title">📍 Hoạt Động Theo Khu Vực</h3>
          <div style={{ height: "250px" }}>
            <Bar
              data={barDataRegion}
              options={{
                indexAxis: "y", // Đảo thành biểu đồ ngang
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "top", labels: { color: "#94a3b8", font: { size: 12 } } } },
                scales: { x: { grid: { color: "rgba(255,255,255,0.05)" } }, y: { grid: { display: false } } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Bảng phân tích hồ sơ chi tiết */}
      <div className="progress-section" style={{ marginBottom: "0" }}>
        <h3 style={{ color: "#e2e8f0", marginTop: "0", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>📁 Phân Tích Hồ Sơ Nhanh</h3>
        <table className="mini-table">
          <thead>
            <tr>
              <th>Giai đoạn xử lý</th>
              <th>Số lượng bài</th>
              <th>Đánh giá tiến độ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span style={{ color: "#facc15", fontWeight: "bold" }}>● Chờ duyệt (Mới nhập liệu)</span>
              </td>
              <td style={{ fontWeight: "bold" }}>{demTrangThai["Chờ duyệt"] || 0} bài</td>
              <td style={{ color: "#94a3b8" }}>Nằm tại Phòng Thư Ký</td>
            </tr>
            <tr>
              <td>
                <span style={{ color: "#3b82f6", fontWeight: "bold" }}>● Trình Lãnh Đạo</span>
              </td>
              <td style={{ fontWeight: "bold" }}>{demTrangThai["Trình Lãnh Đạo"] || 0} bài</td>
              <td style={{ color: "#94a3b8" }}>Chờ Giám đốc phê duyệt chi</td>
            </tr>
            <tr>
              <td>
                <span style={{ color: "#10b981", fontWeight: "bold" }}>● Đã duyệt (Chờ xuất tiền)</span>
              </td>
              <td style={{ fontWeight: "bold" }}>{demTrangThai["Đã duyệt"] || 0} bài</td>
              <td style={{ color: "#94a3b8" }}>Nằm tại Phòng Kế toán</td>
            </tr>
            <tr>
              <td>
                <span style={{ color: "#a855f7", fontWeight: "bold" }}>● Đã thanh toán (Hoàn tất)</span>
              </td>
              <td style={{ fontWeight: "bold", color: "#34d399" }}>{demTrangThai["Đã thanh toán"] || 0} bài</td>
              <td style={{ color: "#34d399" }}>Tiền đã vào tài khoản Tác giả</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ThongKe;
