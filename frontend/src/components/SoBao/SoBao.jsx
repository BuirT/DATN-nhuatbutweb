import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./SoBao.css";

function SoBao() {
  const [danhSachSoBao, setDanhSachSoBao] = useState([]);
  const [isEditing, setIsEditing] = useState(null);

  const [formData, setFormData] = useState({
    maSoBao: "",
    tenSoBao: "", // Sửa thành tên mới
    ngayPhatHanh: "", // Sửa thành tên mới
    loaiBao: "Báo In",
  });

  const layDuLieu = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/sobao/danh-sach");
      setDanhSachSoBao(response.data);
    } catch (error) {
      console.error("Chưa có API Backend, dữ liệu tạm thời trống.");
    }
  };

  useEffect(() => {
    layDuLieu();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleXoa = async (id) => {
    if (window.confirm("Đồng chí có chắc chắn muốn xóa Số báo này? Các bài viết thuộc số báo này có thể bị ảnh hưởng!")) {
      try {
        await axios.delete(`http://localhost:5000/api/sobao/${id}`);
        toast.success("Đã xóa Số báo thành công! 🗑️");
        layDuLieu();
      } catch (error) {
        toast.error("Lỗi khi xóa! ❌");
      }
    }
  };

  const handleChonSua = (bao) => {
    setIsEditing(bao._id);
    setFormData({
      maSoBao: bao.maSoBao,
      tenSoBao: bao.tenSoBao,
      ngayPhatHanh: bao.ngayPhatHanh ? bao.ngayPhatHanh.substring(0, 10) : "", // Cắt lấy ngày YYYY-MM-DD
      loaiBao: bao.loaiBao || "Báo In",
    });
  };

  const handleHuySua = () => {
    setIsEditing(null);
    setFormData({ maSoBao: "", tenSoBao: "", ngayPhatHanh: "", loaiBao: "Báo In" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/sobao/${isEditing}`, formData);
        toast.success("Cập nhật Số báo thành công! ✨");
      } else {
        await axios.post("http://localhost:5000/api/sobao/them", formData);
        toast.success("Đã phát hành Số báo mới! 📰");
      }
      handleHuySua();
      layDuLieu();
    } catch (error) {
      toast.error("Lỗi thao tác! Vui lòng kiểm tra lại. ⚠️");
    }
  };

  return (
    <div className="sobao-container">
      <div className="form-box">
        <h3 style={{ color: isEditing ? "#2196F3" : "#4facfe" }}>{isEditing ? "🛠️ Sửa Thông Tin Số Báo" : "📰 Phát Hành Số Báo Mới"}</h3>
        <form className="form-nhap" onSubmit={handleSubmit}>
          <input type="text" name="maSoBao" value={formData.maSoBao} onChange={handleChange} placeholder="Mã Số Báo (VD: B01)" required />
          <input type="text" name="tenSoBao" value={formData.tenSoBao} onChange={handleChange} placeholder="Tên Số Báo (VD: Tuổi Trẻ Cuối Tuần)" required style={{ flex: 2 }} />

          <div style={{ display: "flex", gap: "15px", flex: 2 }}>
            <input type="date" name="ngayPhatHanh" value={formData.ngayPhatHanh} onChange={handleChange} required style={{ flex: 1 }} title="Ngày Phát Hành" />
            <select name="loaiBao" value={formData.loaiBao} onChange={handleChange} style={{ flex: 1 }}>
              <option value="Báo In">Báo In</option>
              <option value="Báo Điện Tử">Báo Điện Tử</option>
              <option value="Tạp Chí">Tạp Chí</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "10px" }}>
            <button type="submit" className="btn-luu-bao">
              {isEditing ? "Lưu Cập Nhật" : "Tạo Số Báo"}
            </button>
            {isEditing && (
              <button type="button" onClick={handleHuySua} className="btn-luu-bao" style={{ backgroundColor: "#64748b" }}>
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      <h3 style={{ color: "#e2e8f0", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px", marginTop: "30px", marginBottom: "20px" }}>Danh sách Các Kỳ Báo Đã Phát Hành</h3>
      <table className="bang-danh-sach">
        <thead>
          <tr>
            <th>Mã Số</th>
            <th>Tên Số Báo</th>
            <th>Ngày Phát Hành</th>
            <th>Loại Báo</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {danhSachSoBao.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                Chưa có dữ liệu Số báo. (Cần viết API Backend)
              </td>
            </tr>
          ) : (
            danhSachSoBao.map((bao) => (
              <tr key={bao._id}>
                <td style={{ fontWeight: "bold", color: "#00f2fe" }}>{bao.maSoBao}</td>
                <td>{bao.tenSoBao}</td>
                <td>{new Date(bao.ngayPhatHanh).toLocaleDateString("vi-VN")}</td>
                <td>
                  <span className="badge-loai">{bao.loaiBao}</span>
                </td>
                <td>
                  <button onClick={() => handleChonSua(bao)}>✏️</button>
                  <button onClick={() => handleXoa(bao._id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SoBao;
