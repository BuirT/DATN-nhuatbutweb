import { useState, useEffect } from "react"; // Đã bổ sung useEffect ở đây
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Menu, Sun, Moon } from "lucide-react"; // Đã gộp chung import cho gọn

// --- IMPORT CÁC TRANG ---
import AppSidebar from "./components/Sidebar/AppSidebar";
import TacGia from "./components/TacGia/TacGia";
import NhuanBut from "./components/NhuanBut/NhuanBut";
import DuyetChi from "./components/DuyetChi/DuyetChi";
import ThongKe from "./components/ThongKe/ThongKe";
import Login from "./components/Login/Login";
import SoBao from "./components/SoBao/SoBao";
import PhieuChi from "./components/PhieuChi/PhieuChi";
import TaiKhoan from "./components/TaiKhoan/TaiKhoan";
import CauHinh from "./components/CauHinh/CauHinh";

// 👉 BẮT BUỘC IMPORT CSS TỔNG ĐỂ CÓ NỀN TÍM VÀ NÚT LIGHT/DARK MODE
import "./App.css";
import "./components/Sidebar/AppSidebar.css";

import axios from "axios";
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [vaiTro, setVaiTro] = useState(localStorage.getItem("vaiTro") || "");
  const [hoTen, setHoTen] = useState(localStorage.getItem("hoTen") || "");

  // QUẢN LÝ ĐÓNG/MỞ SIDEBAR
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // QUẢN LÝ LIGHT/DARK MODE
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem("theme") === "light";
  });

  useEffect(() => {
    const theme = isLightMode ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [isLightMode]);

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

  const isThuKy = vaiTro === "Nhập Liệu" || vaiTro === "Thư ký" || vaiTro === "Admin" || vaiTro === "Quản trị viên" || vaiTro === "Tổng thư ký";
  const isKeToan = vaiTro === "Kế Toán" || vaiTro === "Kế toán" || vaiTro === "Admin" || vaiTro === "Quản trị viên";
  const isLanhDao = vaiTro === "Lãnh đạo" || vaiTro === "Lãnh Đạo" || vaiTro === "Admin" || vaiTro === "Quản trị viên";
  const isAdmin = vaiTro === "Admin" || vaiTro === "Quản trị viên";

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} theme={isLightMode ? "light" : "colored"} />

      {/* KHUNG BỐ CỤC TỔNG */}
      <div className="app-layout">
        {/* LỚP ÁNH SÁNG NỀN TÍM (Đã ráp lại) */}
        <div className="bg-glow-effect" />

        {/* LỚP NỘI DUNG CHÍNH NỔI LÊN TRÊN */}
        <div className="main-content-wrapper">
          {/* SIDEBAR BÊN TRÁI */}
          <AppSidebar vaiTro={vaiTro} hoTen={hoTen} handleLogout={handleLogout} isOpen={isSidebarOpen} />

          {/* CỘT NỘI DUNG BÊN PHẢI */}
          <div className="page-container">
            {/* THANH HEADER ĐIỀU KHIỂN BÊN TRÊN */}
            <header className="top-header">
              <button className="btn-toggle-sidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <Menu size={24} />
              </button>
              <div className="header-brand">
                <span className="header-brand-kicker">Editorial desk</span>
                <span className="header-brand-title">Hệ thống quản lý nhuận bút</span>
              </div>

              <button
                type="button"
                className="btn-theme-toggle"
                onClick={() => setIsLightMode(!isLightMode)}
                title={isLightMode ? "Chuyển giao diện tối" : "Chuyển giao diện sáng"}
                aria-label={isLightMode ? "Chuyển giao diện tối" : "Chuyển giao diện sáng"}
              >
                {isLightMode ? <Moon size={20} strokeWidth={2} /> : <Sun size={20} strokeWidth={2} className="header-icon-sun" />}
              </button>
            </header>

            {/* KHU VỰC HIỂN THỊ TRANG */}
            <div className="content-area">
              <Routes>
                <Route path="/" element={<ThongKe />} />
                {isThuKy && (
                  <>
                    <Route path="/tac-gia" element={<TacGia />} />
                    <Route path="/so-bao" element={<SoBao />} />
                    <Route path="/nhuan-but" element={<NhuanBut />} />
                  </>
                )}
                {isKeToan && <Route path="/phieu-chi" element={<PhieuChi />} />}
                {isLanhDao && <Route path="/duyet-chi" element={<DuyetChi />} />}
                {isAdmin && (
                  <>
                    <Route path="/quan-ly-tai-khoan" element={<TaiKhoan />} />
                    <Route path="/cau-hinh" element={<CauHinh />} />
                  </>
                )}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
