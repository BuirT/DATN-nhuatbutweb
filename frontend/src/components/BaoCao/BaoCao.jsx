import React, { useState } from "react";
import TabCongNo from "./TabCongNo";
import TabLanhDao from "./TabLanhDao";
import TabPhongVien from "./TabPhongVien";
import "./BaoCao.css";

function BaoCao() {
  const [activeTab, setActiveTab] = useState("CongNo");

  const vaiTro = localStorage.getItem("vaiTro") || "";
  const roleLower = vaiTro.toLowerCase();
  
  // Phân quyền tab hiển thị
  const isLanhDao = roleLower.includes("lãnh đạo") || roleLower.includes("admin") || roleLower.includes("quản trị viên");
  
  return (
    <div className="baocao-container">
      <div className="baocao-header">
        <h2 className="baocao-title">Trung Tâm Báo Cáo Chuyên Sâu</h2>
        <div className="baocao-tabs">
          <button 
            className={`tab-btn ${activeTab === "CongNo" ? "active" : ""}`}
            onClick={() => setActiveTab("CongNo")}
          >
            📊 Công Nợ Tác Giả
          </button>
          
          <button 
            className={`tab-btn ${activeTab === "PhongVien" ? "active" : ""}`}
            onClick={() => setActiveTab("PhongVien")}
          >
            ✍️ Thống Kê Phóng Viên
          </button>

          {(isLanhDao) && (
            <button 
                className={`tab-btn ${activeTab === "LanhDao" ? "active" : ""}`}
                onClick={() => setActiveTab("LanhDao")}
            >
                👑 Báo Cáo Lãnh Đạo
            </button>
          )}
        </div>
      </div>

      <div className="baocao-content">
        {activeTab === "CongNo" && <TabCongNo />}
        {activeTab === "LanhDao" && isLanhDao && <TabLanhDao />}
        {activeTab === "PhongVien" && <TabPhongVien />}
      </div>
    </div>
  );
}

export default BaoCao;
