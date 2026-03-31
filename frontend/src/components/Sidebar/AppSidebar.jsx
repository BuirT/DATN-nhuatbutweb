import { Link, useLocation } from "react-router-dom";
import { 
  Home, Users, Newspaper, CircleDollarSign, 
  FileCheck, ShieldCheck, UserCog, Settings, LogOut
} from "lucide-react";
import "./AppSidebar.css"; 

export default function AppSidebar({ vaiTro, hoTen, handleLogout, isOpen }) {
  const location = useLocation();

  // Đổ bê tông: Đảm bảo không bị crash nếu hoTen chưa kịp load
  const tenHienThi = hoTen || "User";
  const chuCaiDau = tenHienThi.charAt(0).toUpperCase();

  const isThuKy = vaiTro === "Nhập Liệu" || vaiTro === "Thư ký" || vaiTro === "Admin";
  const isKeToan = vaiTro === "Kế Toán" || vaiTro === "Kế toán" || vaiTro === "Admin";
  const isLanhDao = vaiTro === "Lãnh đạo" || vaiTro === "Lãnh Đạo" || vaiTro === "Admin";
  const isAdmin = vaiTro === "Admin";

  return (
    <div className={`sidebar-container ${isOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}>
      
      {/* HEADER LOGO */}
      <div className="sidebar-header">
        <div className="logo-box">TS</div>
        <div className="logo-text">
          <span style={{ color: "#38bdf8", fontWeight: "bold", fontSize: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>Tòa Soạn Báo</span>
          
        </div>
      </div>

      {/* MENU CHÍNH */}
      <div className="sidebar-menu">
        <div className="menu-label">Nghiệp Vụ</div>
        
        <Link to="/" className={`menu-item ${location.pathname === "/" ? "active" : ""}`}>
          <Home size={20} />
          {isOpen && <span>Báo Cáo Thống Kê</span>}
        </Link>

        {isThuKy && (
          <>
            <Link to="/tac-gia" className={`menu-item ${location.pathname === "/tac-gia" ? "active" : ""}`}>
              <Users size={20} />
              {isOpen && <span>Quản lý Tác Giả</span>}
            </Link>
            <Link to="/so-bao" className={`menu-item ${location.pathname === "/so-bao" ? "active" : ""}`}>
              <Newspaper size={20} />
              {isOpen && <span>Quản lý Số Báo</span>}
            </Link>
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
            <div className="menu-label" style={{ marginTop: "15px" }}>Hệ Thống</div>
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
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#e2e8f0", fontWeight: "bold", fontSize: "13px" }}>{tenHienThi}</span>
            <span style={{ color: "#38bdf8", fontSize: "11px", fontWeight: "bold" }}>{vaiTro}</span>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout} style={{ justifyContent: isOpen ? "flex-start" : "center" }}>
          <LogOut size={20} />
          {isOpen && <span>Đăng Xuất</span>}
        </button>
      </div>

    </div>
  );
}