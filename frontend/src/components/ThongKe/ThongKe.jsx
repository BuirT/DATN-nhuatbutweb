import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import * as XLSX from "xlsx";
import "./ThongKe.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function ThongKe() {
  const [danhSachBaiViet, setDanhSachBaiViet] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [thoiGianThuc, setThoiGianThuc] = useState(new Date());

  // 👉 Lắng nghe Sáng/Tối chỉ để đổi màu chữ cho cái Biểu đồ (Canvas)
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isLight = document.body.classList.contains("light-mode") || document.body.classList.contains("light") || document.documentElement.getAttribute("data-theme") === "light";
      setIsLightMode(isLight);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

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
    const thuArr = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const thu = thuArr[date.getDay()];
    const gioPhutGiay = date.toLocaleTimeString("vi-VN", { hour12: false });
    const ngayThangNam = date.toLocaleDateString("vi-VN");
    return `${thu}, ${ngayThangNam} | ${gioPhutGiay}`;
  };

  const handleXuatExcel = () => {
    if (danhSachBaiViet.length === 0) {
      toast.warning("Chưa có dữ liệu để xuất báo cáo!");
      return;
    }

    const dataToExport = danhSachBaiViet.map((bai, index) => {
      const tienGoc = Number(bai.tienNhuanBut) || 0;
      const tienThue = tienGoc >= 2000000 ? tienGoc * 0.1 : 0;
      const thucLanhXuat = Number.isFinite(Number(bai.thucLanh)) ? Number(bai.thucLanh) : Math.max(0, tienGoc - tienThue);

      return {
        STT: index + 1,
        "Tác Giả": bai.tacGia?.hoTen || "Chưa cập nhật",
        "Khu Vực": bai.tacGia?.khuVuc || "Chưa cập nhật",
        "Tên Bài Viết": bai.tenBaiViet || bai.tenBai || bai.tieuDe || "Chưa có tên",
        "Kỳ Báo": bai.soBao || "N/A",
        "Tiền Gốc (VNĐ)": tienGoc,
        "Thuế TNCN (VNĐ)": tienThue,
        "Thực Lãnh (VNĐ)": thucLanhXuat,
        "Hình Thức Chi": bai.hinhThucChi || "—",
        "Trạng Thái": bai.trangThai || "Chờ duyệt",
        "Người duyệt / chi": bai.nguoiDuyet || "—",
        "Thời điểm duyệt / chi": bai.ngayDuyet ? new Date(bai.ngayDuyet).toLocaleString("vi-VN") : "—",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCaoNhuanBut");
    XLSX.writeFile(workbook, `Bao_Cao_Toa_Soan_${new Date().getTime()}.xlsx`);
    toast.success("Xuất file Excel thành công! Đã tải về máy.");
  };

  // --- TÍNH TOÁN DỮ LIỆU ---
  const tongSoBai = danhSachBaiViet.length;
  const tongTienHienTai = danhSachBaiViet.reduce((sum, bai) => sum + (Number(bai.thucLanh) || 0), 0);

  const dsDaThanhToan = danhSachBaiViet.filter((bai) => bai.trangThai === "Đã thanh toán");
  const tienDaChi = dsDaThanhToan.reduce((sum, bai) => sum + (Number(bai.thucLanh) || 0), 0);
  const tienChuaChi = tongTienHienTai - tienDaChi;
  const tongThue = danhSachBaiViet.reduce((sum, bai) => sum + (Number(bai.thue) || 0), 0);
  const tyLeGiaiNgan = tongTienHienTai > 0 ? Math.round((tienDaChi / tongTienHienTai) * 100) : 0;

  // CHIA TÁCH CK/TM
  const tienMat = dsDaThanhToan.reduce((sum, bai) => {
    // Lấy trường hinhThucChi hoặc hinhThuc (nếu có), đưa hết về chữ thường để dễ soi
    const hinhThuc = String(bai.hinhThucChi || bai.hinhThuc || "").toLowerCase();
    if (hinhThuc.includes("tm") || hinhThuc.includes("tiền mặt") || hinhThuc.includes("tien mat")) {
      return sum + (Number(bai.thucLanh) || 0);
    }
    return sum;
  }, 0);
  const chuyenKhoan = dsDaThanhToan.reduce((sum, bai) => {
    const hinhThuc = String(bai.hinhThucChi || bai.hinhThuc || "").toLowerCase();
    if (hinhThuc.includes("ck") || hinhThuc.includes("chuyển khoản") || hinhThuc.includes("chuyen khoan")) {
      return sum + (Number(bai.thucLanh) || 0);
    }
    return sum;
  }, 0);

  const tienKhongRoHinhThuc = tienDaChi - tienMat - chuyenKhoan;

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

  const dataByRegion = danhSachBaiViet.reduce((acc, bai) => {
    const region = bai.tacGia?.khuVuc || "Chưa rõ";
    if (!acc[region]) acc[region] = { count: 0, money: 0 };
    acc[region].count += 1;
    acc[region].money += Number(bai.thucLanh) || 0;
    return acc;
  }, {});

  // MÀU BIỂU ĐỒ CHART.JS (Thích nghi với sáng tối để không bị chìm)
  const chartTextColor = isLightMode ? "#475569" : "#94a3b8";
  const chartGridColor = isLightMode ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";

  const pieData = {
    labels: ["Chờ duyệt", "Trình Lãnh Đạo", "Đã duyệt", "Đã thanh toán"],
    datasets: [
      {
        data: [demTrangThai["Chờ duyệt"] || 0, demTrangThai["Trình Lãnh Đạo"] || 0, demTrangThai["Đã duyệt"] || 0, demTrangThai["Đã thanh toán"] || 0],
        backgroundColor: ["#facc15", "#3b82f6", "#10b981", "#a855f7"],
        borderColor: isLightMode ? "#ffffff" : "#1e293b",
        borderWidth: 2,
      },
    ],
  };

  const barDataIssue = {
    labels: Object.keys(dataByIssue),
    datasets: [{ label: "Số tiền thực chi (VNĐ)", data: Object.values(dataByIssue), backgroundColor: "#38bdf8", borderRadius: 5 }],
  };

  const barDataRegion = {
    labels: Object.keys(dataByRegion),
    datasets: [
      { label: "Số lượng bài", data: Object.keys(dataByRegion).map((r) => dataByRegion[r].count), backgroundColor: isLightMode ? "#cbd5e1" : "#475569", borderRadius: 5 },
      { label: "Số tiền chi (Triệu VNĐ)", data: Object.keys(dataByRegion).map((r) => (dataByRegion[r].money / 1000000).toFixed(1)), backgroundColor: "#10b981", borderRadius: 5 },
    ],
  };

  if (dangTai) return <h2 className="loading-text">⏳ Hệ thống đang tổng hợp số liệu...</h2>;

  return (
    <div className="thongke-container">
      {/* HEADER */}
      <div className="thongke-header">
        <div>
          <h2 className="thongke-title">BÁO CÁO TOÀN CẢNH TÒA SOẠN</h2>
          <p className="thongke-subtitle">Số liệu cập nhật theo thời gian thực (Real-time)</p>
        </div>

        <div className="header-actions">
          <button className="btn-export" onClick={handleXuatExcel}>
            Xuất Báo Cáo (Excel)
          </button>
          <div className="time-box">{formatThoiGian(thoiGianThuc)}</div>
        </div>
      </div>

      {/* 4 THẺ TỔNG QUAN */}
      <div className="thongke-grid">
        <div className="stat-card card-blue">
          <div className="stat-label">Tổng Quy Mô Chi Trả</div>
          <div className="stat-value">{tongTienHienTai.toLocaleString()}đ</div>
          <div className="stat-sub">Tổng: {tongSoBai} bài viết / ảnh</div>
        </div>

        <div className="stat-card card-green">
          <div className="stat-label">Đã Giải Ngân (Thanh toán)</div>
          <div className="stat-value text-green">{tienDaChi.toLocaleString()}đ</div>
          <div className="payment-split">
            <div className="split-item">
              <span>Chuyển khoản:</span>
              <strong className="text-green">{chuyenKhoan.toLocaleString()}đ</strong>
            </div>
            <div className="split-item">
              <span>Tiền mặt:</span>
              <strong className="text-green">{tienMat.toLocaleString()}đ</strong>
            </div>
            {/* Hiển thị thêm nếu có hồ sơ cũ bị thiếu dữ liệu CK/TM */}
            {tienKhongRoHinhThuc > 0 && (
              <div className="split-item" style={{ opacity: 0.6 }}>
                <span>Chưa phân loại:</span>
                <strong style={{ color: "var(--warning)" }}>{tienKhongRoHinhThuc.toLocaleString()}đ</strong>
              </div>
            )}
          </div>
        </div>

        <div className="stat-card card-red">
          <div className="stat-label">Công Nợ Tồn Đọng (Chưa chi)</div>
          <div className="stat-value text-red">{tienChuaChi.toLocaleString()}đ</div>
          <div className="stat-sub">Đang chờ Ký duyệt / Xuất quỹ</div>
        </div>

        <div className="stat-card card-yellow">
          <div className="stat-label">Tổng Thuế Thu Hộ (TNCN)</div>
          <div className="stat-value text-yellow">{tongThue.toLocaleString()}đ</div>
          <div className="stat-sub">Tạm giữ để nộp ngân sách</div>
        </div>
      </div>

      {/* THANH TIẾN ĐỘ */}
      <div className="progress-section">
        <div className="progress-header">
          <span>Tiến độ Giải Ngân Quỹ Nhuận Bút</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${tyLeGiaiNgan}%` }}>
            {tyLeGiaiNgan > 5 && `${tyLeGiaiNgan}%`}
          </div>
        </div>
      </div>

      {/* BIỂU ĐỒ TRỰC QUAN */}
      <div className="section-charts">
        <div className="chart-card chart-full">
          <h3 className="chart-title">Số tiền Nhuận bút chi cho mỗi Kỳ Báo</h3>
          <div className="chart-wrapper-large">
            <Bar
              data={barDataIssue}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { grid: { color: chartGridColor }, ticks: { color: chartTextColor } }, x: { grid: { display: false }, ticks: { color: chartTextColor } } },
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Cơ cấu Trạng Thái Xử Lý</h3>
          <div className="chart-wrapper-small">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { color: chartTextColor, font: { size: 13 } } } } }} />
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Hoạt Động Theo Khu Vực</h3>
          <div className="chart-wrapper-small">
            <Bar
              data={barDataRegion}
              options={{
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "top", labels: { color: chartTextColor, font: { size: 12 } } } },
                scales: { x: { grid: { color: chartGridColor }, ticks: { color: chartTextColor } }, y: { grid: { display: false }, ticks: { color: chartTextColor } } },
              }}
            />
          </div>
        </div>
      </div>

      {/* BẢNG CHI TIẾT NHANH */}
      <div className="progress-section no-margin-bottom">
        <h3 className="chart-title border-bottom">Phân Tích Hồ Sơ Nhanh</h3>
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
                <span className="dot-yellow">●</span> Chờ duyệt (Mới nhập liệu)
              </td>
              <td className="bold-text">{demTrangThai["Chờ duyệt"] || 0} bài</td>
              <td className="text-subtle">Nằm tại Phòng Thư Ký</td>
            </tr>
            <tr>
              <td>
                <span className="dot-blue">●</span> Trình Lãnh Đạo
              </td>
              <td className="bold-text">{demTrangThai["Trình Lãnh Đạo"] || 0} bài</td>
              <td className="text-subtle">Chờ Giám đốc phê duyệt chi</td>
            </tr>
            <tr>
              <td>
                <span className="dot-green">●</span> Đã duyệt (Chờ xuất tiền)
              </td>
              <td className="bold-text">{demTrangThai["Đã duyệt"] || 0} bài</td>
              <td className="text-subtle">Nằm tại Phòng Kế toán</td>
            </tr>
            <tr>
              <td>
                <span className="dot-purple">●</span> Đã thanh toán (Hoàn tất)
              </td>
              <td className="bold-text text-green">{demTrangThai["Đã thanh toán"] || 0} bài</td>
              <td className="text-green">Tiền đã vào tài khoản Tác giả</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ThongKe;
