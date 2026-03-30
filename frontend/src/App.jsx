import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import TacGia from "./components/TacGia/TacGia";
import NhuanBut from "./components/NhuanBut/NhuanBut";
import DuyetChi from "./components/DuyetChi/DuyetChi";
import ThongKe from "./components/ThongKe/ThongKe";
import Login from "./components/Login/Login";
import SoBao from "./components/SoBao/SoBao";
import PhieuChi from "./components/PhieuChi/PhieuChi";
import TaiKhoan from "./components/TaiKhoan/TaiKhoan"; 
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [vaiTro, setVaiTro] = useState(localStorage.getItem("vaiTro") || "");
  const [hoTen, setHoTen] = useState(localStorage.getItem("hoTen") || "");

  const handleLoginSuccess = () => {
    setVaiTro(localStorage.getItem("vaiTro") || "");
    setHoTen(localStorage.getItem("hoTen") || "");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("hoTen");
    localStorage.removeItem("vaiTro");
    setVaiTro("");
    setHoTen("");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div>
        <nav className="navbar">
          <h1 className="logo">TÒA SOẠN BÁO</h1>

          <ul className="nav-links" style={{ width: "100%", display: "flex", alignItems: "center" }}>
            <li><Link to="/">Báo Cáo Thống Kê</Link></li>
            <li><Link to="/tac-gia">Quản lý Tác Giả</Link></li>
            <li><Link to="/so-bao">Quản lý Số Báo</Link></li>
            <li><Link to="/nhuan-but">Quản lý Nhuận Bút</Link></li>
            <li><Link to="/phieu-chi">Kế Toán Xuất Phiếu</Link></li>

            {/* --- PHÂN QUYỀN ADMIN: Chỉ Admin mới thấy nút này --- */}
            {vaiTro === "Admin" && (
              <li>
                <Link to="/quan-ly-tai-khoan">Quản Lý Tài Khoản</Link>
              </li>
            )}

            {/* --- PHÂN QUYỀN LÃNH ĐẠO: Chỉ Lãnh đạo mới thấy nút này --- */}
            {vaiTro === "Lãnh đạo" && (
              <li>
                <Link to="/duyet-chi">Lãnh Đạo Duyệt</Link>
              </li>
            )}

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

        <div className="main-content">
          <Routes>
            <Route path="/" element={<ThongKe />} />
            <Route path="/tac-gia" element={<TacGia />} />
            <Route path="/so-bao" element={<SoBao />} />
            <Route path="/nhuan-but" element={<NhuanBut />} />
            <Route path="/phieu-chi" element={<PhieuChi />} />
            
            {/* --- BẢO MẬT ĐƯỜNG DẪN ADMIN --- */}
            {vaiTro === "Admin" && (
              <Route path="/quan-ly-tai-khoan" element={<TaiKhoan />} />
            )}

            {/* --- BẢO MẬT ĐƯỜNG DẪN LÃNH ĐẠO --- */}
            {vaiTro === "Lãnh đạo" && (
              <Route path="/duyet-chi" element={<DuyetChi />} />
            )}

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;