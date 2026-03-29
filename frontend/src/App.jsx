import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import TacGia from "./components/TacGia/TacGia";
import NhuanBut from "./components/NhuanBut/NhuanBut";
import DuyetChi from "./components/DuyetChi/DuyetChi";
import ThongKe from "./components/ThongKe/ThongKe";
import Login from "./components/Login/Login";
import "./App.css";

function App() {
  // 1. Kiểm tra trạng thái đăng nhập từ thẻ nhớ trình duyệt
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // 2. Đưa Thông tin user vào State để giao diện cập nhật mượt mà
  const [vaiTro, setVaiTro] = useState(localStorage.getItem("vaiTro") || "");
  const [hoTen, setHoTen] = useState(localStorage.getItem("hoTen") || "");

  // Hàm mở cửa (gọi khi đăng nhập thành công)
  const handleLoginSuccess = () => {
    setVaiTro(localStorage.getItem("vaiTro") || "");
    setHoTen(localStorage.getItem("hoTen") || "");
    setIsLoggedIn(true);
  };

  // Hàm Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("hoTen");
    localStorage.removeItem("vaiTro");

    setVaiTro("");
    setHoTen("");
    setIsLoggedIn(false);
  };

  // NẾU CHƯA ĐĂNG NHẬP -> CHỈ HIỆN MÀN HÌNH KHÓA (LOGIN)
  if (!isLoggedIn) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  // NẾU ĐÃ ĐĂNG NHẬP -> HIỆN ĐẦY ĐỦ GIAO DIỆN
  return (
    <Router>
      {/* TRẠM PHÁT THÔNG BÁO CHO TOÀN BỘ HỆ THỐNG */}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div>
        {/* --- THANH MENU ĐIỀU HƯỚNG --- */}
        <nav className="navbar">
          <h1 className="logo">TÒA SOẠN BÁO</h1>

          <ul className="nav-links" style={{ width: "100%", display: "flex", alignItems: "center" }}>
            <li>
              <Link to="/">Báo Cáo Thống Kê</Link>
            </li>
            <li>
              <Link to="/tac-gia">Quản lý Tác Giả</Link>
            </li>
            <li>
              <Link to="/nhuan-but">Quản lý Nhuận Bút</Link>
            </li>

            {/* TÍNH NĂNG PHÂN QUYỀN: Chỉ Lãnh đạo mới thấy nút này */}
            {vaiTro === "Lãnh đạo" && (
              <li>
                <Link to="/duyet-chi">Lãnh Đạo Duyệt</Link>
              </li>
            )}

            {/* Khu vực Thông tin user & Nút Đăng xuất */}
            <li style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "15px" }}>
              <span style={{ color: "#ffeb3b", fontSize: "14px" }}>
                👤 {vaiTro}: <strong>{hoTen}</strong>
              </span>
              <button onClick={handleLogout} style={{ backgroundColor: "#f44336", color: "white", border: "none", padding: "6px 12px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                Đăng Xuất 🚪
              </button>
            </li>
          </ul>
        </nav>

        {/* --- KHU VỰC HIỂN THỊ NỘI DUNG TƯƠNG ỨNG VỚI MENU --- */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<ThongKe />} />
            <Route path="/tac-gia" element={<TacGia />} />
            <Route path="/nhuan-but" element={<NhuanBut />} />

            {/* TÍNH NĂNG PHÂN QUYỀN: Chỉ Lãnh đạo mới vào được đường dẫn này */}
            {vaiTro === "Lãnh đạo" && <Route path="/duyet-chi" element={<DuyetChi />} />}

            {/* Bắt lỗi: Nếu gõ link bậy bạ hoặc Thư ký cố tình gõ link /duyet-chi -> Đẩy về trang chủ */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
