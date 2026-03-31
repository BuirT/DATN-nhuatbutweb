import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Menu } from "lucide-react"; // Nút mở Sidebar

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
import "./components/Sidebar/AppSidebar.css"; // Gọi layout tổng

import axios from "axios";
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [vaiTro, setVaiTro] = useState(localStorage.getItem("vaiTro") || "");
  const [hoTen, setHoTen] = useState(localStorage.getItem("hoTen") || "");
  
  // 👉 QUẢN LÝ ĐÓNG/MỞ SIDEBAR
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  const isThuKy = vaiTro === "Nhập Liệu" || vaiTro === "Thư ký" || vaiTro === "Admin";
  const isKeToan = vaiTro === "Kế Toán" || vaiTro === "Kế toán" || vaiTro === "Admin";
  const isLanhDao = vaiTro === "Lãnh đạo" || vaiTro === "Lãnh Đạo" || vaiTro === "Admin";
  const isAdmin = vaiTro === "Admin";

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
      {/* KHUNG BỐ CỤC TỔNG CHIA 2 CỘT */}
      <div className="app-layout">
        
        {/* SIDEBAR BÊN TRÁI */}
        <AppSidebar 
          vaiTro={vaiTro} 
          hoTen={hoTen} 
          handleLogout={handleLogout} 
          isOpen={isSidebarOpen} 
        />

        {/* CỘT NỘI DUNG BÊN PHẢI */}
        <div className="main-wrapper">
          
          {/* THANH HEADER ĐIỀU KHIỂN BÊN TRÊN */}
          <header className="top-header">
            <button className="btn-toggle-sidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu size={24} />
            </button>
            <div style={{ color: "#e2e8f0", fontWeight: "bold", fontSize: "16px" }}>Hệ Thống Quản Lý Nhuận Bút</div>
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
    </Router>
  );
}

export default App;