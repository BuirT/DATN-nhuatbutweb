import { Link, useLocation } from "react-router-dom";
import { Home, Users, Newspaper, CircleDollarSign, FileCheck, ShieldCheck, UserCog, Settings, LogOut, PenTool, BookOpen, Search, PieChart } from "lucide-react";
import "./AppSidebar.css";

export default function AppSidebar({ vaiTro, hoTen, handleLogout, isOpen }) {
  const location = useLocation();

  // Đổ bê tông: Đảm bảo không bị crash nếu hoTen chưa kịp load
  const tenHienThi = hoTen || "User";
  const chuCaiDau = tenHienThi.charAt(0).toUpperCase();

  const isThuKy = vaiTro === "Nhập Liệu" || vaiTro === "Thư ký" || vaiTro === "Admin" || vaiTro === "Quản trị viên" || vaiTro === "Tổng thư ký";
  const isKeToan = vaiTro === "Kế Toán" || vaiTro === "Kế toán" || vaiTro === "Admin" || vaiTro === "Quản trị viên";
  const isLanhDao = vaiTro === "Lãnh đạo" || vaiTro === "Lãnh Đạo" || vaiTro === "Admin" || vaiTro === "Quản trị viên";
  const isAdmin = vaiTro === "Admin" || vaiTro === "Quản trị viên";

  return (
    <div className={`sidebar-container ${isOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}>
      {/* HEADER LOGO */}
      <div className="sidebar-header">
        <div className="logo-box">TS</div>
        <div className="logo-text">
          <span className="logo-tagline">Tòa soạn</span>
          <span className="logo-title">Quản lý nhuận bút</span>
        </div>
      </div>

      {/* MENU CHÍNH */}
      <div className="sidebar-menu">
        <div className="menu-label">Nghiệp Vụ</div>

        <Link to="/" className={`menu-item ${location.pathname === "/" ? "active" : ""}`}>
          <Home size={20} />
          {isOpen && <span>Báo Cáo Thống Kê</span>}
        </Link>
        <Link to="/bao-cao" className={`menu-item ${location.pathname === "/bao-cao" ? "active" : ""}`}>
          <PieChart size={20} />
          {isOpen && <span>Báo Cáo Chi Tiết</span>}
        </Link>
        <Link to="/tra-cuu" className={`menu-item ${location.pathname === "/tra-cuu" ? "active" : ""}`}>
          <Search size={20} />
          {isOpen && <span>Tra Cứu / Lọc Bài</span>}
        </Link>

        {isThuKy && (
          <>
            <div className="menu-label menu-label-spaced">Danh Mục</div>
            <Link to="/tac-gia" className={`menu-item ${location.pathname === "/tac-gia" ? "active" : ""}`}>
              <Users size={20} />
              {isOpen && <span>Quản lý Tác Giả</span>}
            </Link>
            <Link to="/but-danh" className={`menu-item ${location.pathname === "/but-danh" ? "active" : ""}`}>
              <PenTool size={20} />
              {isOpen && <span>Quản lý Bút Danh</span>}
            </Link>
            <Link to="/loai-bao" className={`menu-item ${location.pathname === "/loai-bao" ? "active" : ""}`}>
              <BookOpen size={20} />
              {isOpen && <span>Quản lý Loại Báo</span>}
            </Link>
            <Link to="/so-bao" className={`menu-item ${location.pathname === "/so-bao" ? "active" : ""}`}>
              <Newspaper size={20} />
              {isOpen && <span>Quản lý Số Báo</span>}
            </Link>
            
            <div className="menu-label menu-label-spaced">Biên Tập & Nhuận Bút</div>
            <Link to="/nhuan-but" className={`menu-item ${location.pathname === "/nhuan-but" ? "active" : ""}`}>
              <CircleDollarSign size={20} />
              {isOpen && <span>Quản lý Nhuận Bút</span>}
            </Link>
          </>
        )}

        {isKeToan && (
          <Link to="/phieu-chi" className={`menu-item ${location.pathname === "/phieu-chi" ? "active" : ""}`}>
            <FileCheck size={20} />
            {isOpen && <span>Kế Toán Xuất Phiếu</span>}
          </Link>
        )}

        {isLanhDao && (
          <Link to="/duyet-chi" className={`menu-item ${location.pathname === "/duyet-chi" ? "active" : ""}`}>
            <ShieldCheck size={20} />
            {isOpen && <span>Lãnh Đạo Duyệt</span>}
          </Link>
        )}

        {isAdmin && (
          <>
            <div className="menu-label menu-label-spaced">
              Hệ thống
            </div>
            <Link to="/quan-ly-tai-khoan" className={`menu-item ${location.pathname === "/quan-ly-tai-khoan" ? "active" : ""}`}>
              <UserCog size={20} />
              {isOpen && <span>Quản Lý Tài Khoản</span>}
            </Link>
            <Link to="/cau-hinh" className={`menu-item ${location.pathname === "/cau-hinh" ? "active" : ""}`}>
              <Settings size={20} />
              {isOpen && <span>Cấu Hình Thuế</span>}
            </Link>
          </>
        )}
      </div>

      {/* FOOTER USER */}
      <div className="sidebar-footer">
        <div className="user-card" style={{ display: isOpen ? "flex" : "none" }}>
          <div className="user-avatar">{chuCaiDau}</div>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span className="user-name">{tenHienThi}</span>
            <span className="user-role">{vaiTro}</span>
          </div>
        </div>
        <button type="button" className="btn-logout" onClick={handleLogout}>
          <LogOut size={20} strokeWidth={2} />
          {isOpen && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  );
}
