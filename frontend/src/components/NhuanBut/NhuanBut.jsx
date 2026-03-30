import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./NhuanBut.css";

function NhuanBut() {
  const [danhSachBaiViet, setDanhSachBaiViet] = useState([]);
  const [danhSachTacGia, setDanhSachTacGia] = useState([]);
  const [danhSachSoBao, setDanhSachSoBao] = useState([]);
  const [isEditing, setIsEditing] = useState(null);

  const [formData, setFormData] = useState({
    tenBai: "",
    tacGia: "",
    muc: "",
    tienNhuanBut: "",
    soBao: "",
    ghiChu: "",
  });

  const [thue, setThue] = useState(0);
  const [thucLanh, setThucLanh] = useState(0);

  // --- HÀM TẢI DỮ LIỆU TỪ BACKEND ---
  const layDuLieu = async () => {
    try {
      const resBaiViet = await axios.get("http://localhost:5000/api/nhuanbut/danh-sach");
      setDanhSachBaiViet(resBaiViet.data);

      const resTacGia = await axios.get("http://localhost:5000/api/tacgia/danh-sach");
      setDanhSachTacGia(resTacGia.data);

      const resSoBao = await axios.get("http://localhost:5000/api/sobao/danh-sach");
      setDanhSachSoBao(resSoBao.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      toast.error("Không thể kết nối đến máy chủ!");
    }
  };

  useEffect(() => {
    layDuLieu();
  }, []);

  // --- XỬ LÝ NHẬP LIỆU & TỰ ĐỘNG TÍNH THUẾ ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "tienNhuanBut") {
      const tienGoc = Number(value) || 0;
      // Thuế 10% chỉ áp dụng cho thu nhập từ 2.000.000đ trở lên
      const tienThue = tienGoc >= 2000000 ? tienGoc * 0.1 : 0;
      setThue(tienThue);
      setThucLanh(tienGoc - tienThue);
    }
  };

  // --- CÁC HÀM THAO TÁC CRUD ---
  const handleXoa = async (id) => {
    if (window.confirm("Đồng chí có chắc chắn muốn xóa bài viết này khỏi hệ thống?")) {
      try {
        await axios.delete(`http://localhost:5000/api/nhuanbut/${id}`);
        toast.success("Đã xóa bài viết thành công! 🗑️");
        layDuLieu();
      } catch (error) {
        toast.error("Lỗi khi xóa bài viết! ❌");
      }
    }
  };

  const handleChonSua = (bai) => {
    setIsEditing(bai._id);
    setFormData({
      tenBai: bai.tenBai,
      tacGia: bai.tacGia?._id || "",
      muc: bai.muc || "",
      tienNhuanBut: bai.tienNhuanBut,
      soBao: bai.soBao || "",
      ghiChu: bai.ghiChu || "",
    });

    const tienGoc = Number(bai.tienNhuanBut) || 0;
    const tienThue = tienGoc >= 2000000 ? tienGoc * 0.1 : 0;
    setThue(tienThue);
    setThucLanh(tienGoc - tienThue);
  };

  const handleHuySua = () => {
    setIsEditing(null);
    setFormData({ tenBai: "", tacGia: "", muc: "", tienNhuanBut: "", soBao: "", ghiChu: "" });
    setThue(0);
    setThucLanh(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/nhuanbut/${isEditing}`, formData);
        toast.success("Cập nhật bài viết thành công! ✨");
      } else {
        await axios.post("http://localhost:5000/api/nhuanbut/nhap-bai", formData);
        toast.success("Thêm bài viết mới thành công! 📝");
      }
      handleHuySua();
      layDuLieu();
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu! ⚠️");
    }
  };

  // --- LOGIC HỆ THỐNG CẢNH BÁO VƯỢT NGÂN SÁCH ---
  const soBaoHienTai = danhSachSoBao.find(sb => sb.maSoBao === formData.soBao);
  const nganSachToiDa = soBaoHienTai ? soBaoHienTai.nganSach : 0;

  const tongTienDaChi = danhSachBaiViet
    .filter(bai => bai.soBao === formData.soBao)
    .reduce((tong, bai) => tong + (Number(bai.tienNhuanBut) || 0), 0);

  let tienDaChiThucTe = tongTienDaChi;
  if (isEditing) {
    const baiCu = danhSachBaiViet.find(b => b._id === isEditing);
    if (baiCu) {
      tienDaChiThucTe -= (Number(baiCu.tienNhuanBut) || 0);
    }
  }

  const tienDangNhap = Number(formData.tienNhuanBut) || 0;
  const isVuotNganSach = nganSachToiDa > 0 && (tienDaChiThucTe + tienDangNhap) > nganSachToiDa;

  return (
    <div className="nhuanbut-container">
      {/* KHU VỰC FORM NHẬP LIỆU */}
      <div className="form-box">
        <h3 style={{ color: isEditing ? "#38bdf8" : "#ffffff", borderLeft: "4px solid #38bdf8", paddingLeft: "10px" }}>
          {isEditing ? "🛠️ Sửa Thông Tin Bài Viết" : "📝 Nhập Nhuận Bút & Tính Thuế"}
        </h3>
        
        <form className="form-nhap" onSubmit={handleSubmit}>
          <input type="text" name="tenBai" value={formData.tenBai} onChange={handleChange} placeholder="Tên bài viết" required style={{ width: "100%", marginBottom: "15px" }} />

          <div style={{ display: "flex", gap: "15px", width: "100%", marginBottom: "15px" }}>
            <select name="tacGia" value={formData.tacGia} onChange={handleChange} required style={{ flex: 1 }}>
              <option value="">-- Chọn Tác Giả --</option>
              {danhSachTacGia.map((tg) => (
                <option key={tg._id} value={tg._id}>
                  {tg.hoTen}
                </option>
              ))}
            </select>
            
            <select name="soBao" value={formData.soBao} onChange={handleChange} required style={{ flex: 1 }}>
              <option value="">-- Chọn Kỳ Báo / Số Báo --</option>
              {danhSachSoBao.map((bao) => (
                <option key={bao._id} value={bao.maSoBao}>
                  {bao.maSoBao} - {bao.tenSoBao || "Kỳ báo này"}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "15px", width: "100%", alignItems: "center", marginBottom: "15px" }}>
            <input 
              type="number" 
              name="tienNhuanBut" 
              value={formData.tienNhuanBut} 
              onChange={handleChange} 
              placeholder="💰 Nhập Tiền Gốc (VNĐ)" 
              required 
              min="0" // Chặn nhập số âm
              style={{ flex: 1 }} 
            />

            <div style={{ flex: 1, padding: "12px", backgroundColor: "rgba(244, 63, 94, 0.1)", color: "#f87171", borderRadius: "8px", border: "1px solid rgba(244, 63, 94, 0.3)", display: "flex", alignItems: "center", fontSize: "14px" }}>
              Thuế TNCN (10%): <strong>&nbsp;{thue.toLocaleString()}đ</strong>
            </div>

            <div style={{ flex: 1, padding: "12px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#34d399", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.3)", display: "flex", alignItems: "center", fontSize: "15px" }}>
              Thực lãnh: <strong style={{ fontSize: "18px" }}>&nbsp;{thucLanh.toLocaleString()}đ</strong>
            </div>
          </div>

          {/* GIAO DIỆN HỆ THỐNG CẢNH BÁO */}
          {formData.soBao && nganSachToiDa > 0 && (
            <div style={{ marginBottom: "15px", padding: "15px", borderRadius: "8px", backgroundColor: isVuotNganSach ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)", border: `1px solid ${isVuotNganSach ? "#ef4444" : "#10b981"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "#cbd5e1" }}>Ngân sách cấp cho <b>{formData.soBao}</b>:</span>
                <span style={{ color: "#38bdf8", fontWeight: "bold" }}>{nganSachToiDa.toLocaleString()} đ</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "#cbd5e1" }}>Tổng đã chi + Bài hiện tại:</span>
                <span style={{ color: isVuotNganSach ? "#ef4444" : "#10b981", fontWeight: "bold" }}>
                  {(tienDaChiThucTe + tienDangNhap).toLocaleString()} đ
                </span>
              </div>
              {isVuotNganSach && (
                <div style={{ marginTop: "10px", color: "#f87171", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                  🚨 TÍT TÍT! CẢNH BÁO: Đã vượt tổng ngân sách. Hệ thống tạm khóa nút Lưu!
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              type="submit" 
              className="btn-luu-bai" 
              disabled={isVuotNganSach}
              style={{ 
                opacity: isVuotNganSach ? 0.5 : 1, 
                cursor: isVuotNganSach ? "not-allowed" : "pointer", 
                backgroundColor: isVuotNganSach ? "#64748b" : "" 
              }}
            >
              {isEditing ? "Cập Nhật Dữ Liệu" : "Lưu Bài & Tính Toán"}
            </button>
            {isEditing && (
              <button type="button" onClick={handleHuySua} className="btn-luu-bai" style={{ backgroundColor: "#64748b" }}>
                Hủy Thao Tác
              </button>
            )}
          </div>
        </form>
      </div>

      {/* KHU VỰC BẢNG HIỂN THỊ */}
      <h3 style={{ marginTop: "30px", marginBottom: "15px", color: "#e2e8f0" }}>Bảng Kê Chi Tiết Nhuận Bút</h3>
      <div style={{ overflowX: "auto", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
        <table className="bang-danh-sach">
          <thead>
            <tr>
              <th>Tên Bài</th>
              <th>Tác Giả</th>
              <th>Số Báo</th>
              <th>Tiền Gốc</th>
              <th style={{ color: "#f87171" }}>Thuế (10%)</th>
              <th style={{ color: "#34d399" }}>Thực Lãnh</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {danhSachBaiViet.map((bai) => {
              const tien = Number(bai.tienNhuanBut) || 0;
              const tienThue = tien >= 2000000 ? tien * 0.1 : 0;
              const tienThuc = tien - tienThue;

              return (
                <tr key={bai._id}>
                  <td style={{ color: "#f8fafc", fontWeight: "500" }}>{bai.tenBai}</td>
                  <td>{bai.tacGia?.hoTen}</td>
                  <td>
                    <span style={{ fontWeight: "bold", color: "#4facfe" }}>{bai.soBao}</span>
                  </td>
                  <td style={{ fontWeight: "bold" }}>{tien.toLocaleString()}đ</td>
                  <td style={{ color: "#f87171" }}>{tienThue > 0 ? `-${tienThue.toLocaleString()}đ` : "0đ"}</td>
                  <td style={{ color: "#34d399", fontWeight: "bold", fontSize: "15px" }}>{tienThuc.toLocaleString()}đ</td>
                  <td>
                    <span className={bai.trangThai === "Đã duyệt" || bai.trangThai === "Đã thanh toán" ? "badge-xong" : "badge-cho"}>
                      {bai.trangThai || "Chờ duyệt"}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleChonSua(bai)} title="Sửa bài">✏️</button>
                    <button onClick={() => handleXoa(bai._id)} title="Xóa bài">🗑️</button>
                  </td>
                </tr>
              );
            })}
            {danhSachBaiViet.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                  Chưa có dữ liệu bài viết
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NhuanBut;