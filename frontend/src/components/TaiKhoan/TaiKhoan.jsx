import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./TaiKhoan.css"; // Đã import file CSS riêng biệt

function QuanLyTaiKhoan() {
  const [danhSachUser, setDanhSachUser] = useState([]);
  const [isEditing, setIsEditing] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    hoTen: "",
    vaiTro: "Nhập Liệu",
  });

  const layDuLieu = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/danh-sach");
      setDanhSachUser(res.data);
    } catch (error) {
      toast.error("Không thể tải danh sách tài khoản!");
    }
  };

  useEffect(() => {
    layDuLieu();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleXoa = async (id) => {
    if (window.confirm("Cảnh báo: Đồng chí có chắc muốn xóa vĩnh viễn tài khoản này?")) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`);
        toast.success("Đã xóa tài khoản khỏi hệ thống! 🗑️");
        layDuLieu();
      } catch (error) {
        toast.error("Lỗi khi xóa tài khoản! ❌");
      }
    }
  };

  const handleChonSua = (user) => {
    setIsEditing(user._id);
    setFormData({
      username: user.username,
      password: "", // Bỏ trống pass cũ, chỉ điền nếu muốn đổi pass mới
      hoTen: user.hoTen,
      vaiTro: user.vaiTro,
    });
  };

  const handleHuySua = () => {
    setIsEditing(null);
    setFormData({ username: "", password: "", hoTen: "", vaiTro: "Nhập Liệu" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/users/${isEditing}`, formData);
        toast.success("Cập nhật quyền thành công! ✨");
      } else {
        await axios.post("http://localhost:5000/api/users/them", formData);
        toast.success("Tạo tài khoản mới thành công! 👤");
      }
      handleHuySua();
      layDuLieu();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại! ⚠️");
    }
  };

  // Hàm render giao diện Huy hiệu phân quyền
  const renderRoleBadge = (vaiTro) => {
    switch(vaiTro) {
      case 'Admin': return <span className="tk-badge tk-badge-admin">Quản Trị Viên</span>;
      case 'Lãnh Đạo': return <span className="tk-badge tk-badge-lanhdao">Lãnh Đạo Duyệt</span>;
      case 'Kế Toán': return <span className="tk-badge tk-badge-ketoan">Kế Toán Viên</span>;
      default: return <span className="tk-badge tk-badge-nhaplieu">Thư Ký / Nhập Liệu</span>;
    }
  };

  return (
    <div className="quanly-taikhoan-container">
      
      {/* --- FORM NHẬP LIỆU TÀI KHOẢN --- */}
      <div className="tk-form-box">
        <h3 className="tk-title">
          {isEditing ? "🛠️ Cập Nhật Quyền Tài Khoản" : "👤 Cấp Tài Khoản Hệ Thống Mới"}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="tk-form-row">
            <input 
              type="text" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              placeholder="Tên đăng nhập (VD: admin_01)" 
              required 
              disabled={isEditing} 
              className="tk-input"
            />
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder={isEditing ? "Nhập mật khẩu mới (để trống nếu giữ nguyên)" : "Nhập mật khẩu an toàn"} 
              required={!isEditing} 
              className="tk-input"
            />
          </div>

          <div className="tk-form-row">
            <input 
              type="text" 
              name="hoTen" 
              value={formData.hoTen} 
              onChange={handleChange} 
              placeholder="Họ và Tên chủ tài khoản" 
              required 
              className="tk-input"
              style={{ flex: 2 }} /* Ô tên cho dài ra một xíu */
            />
            
            <select name="vaiTro" value={formData.vaiTro} onChange={handleChange} required className="tk-select">
              <option value="Nhập Liệu">Thư Ký / Nhập Liệu</option>
              <option value="Kế Toán">Kế Toán Phân Bổ</option>
              <option value="Lãnh Đạo">Lãnh Đạo Tòa Soạn</option>
              <option value="Admin">Admin (Quản Trị)</option>
            </select>
          </div>

          <div className="tk-btn-group">
            <button type="submit" className="tk-btn-submit">
              {isEditing ? "Lưu Thay Đổi" : "Tạo Tài Khoản"}
            </button>
            {isEditing && (
              <button type="button" onClick={handleHuySua} className="tk-btn-cancel">
                Hủy Thao Tác
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- BẢNG DANH SÁCH TÀI KHOẢN --- */}
      <h3 style={{ marginBottom: "15px" }}>Danh Sách Người Dùng Tòa Soạn</h3>
      
      <div className="tk-table-wrapper">
        <table className="tk-table">
          <thead>
            <tr>
              <th>Họ và Tên</th>
              <th>Tên Đăng Nhập</th>
              <th>Quyền Hạn Hệ Thống</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {danhSachUser.map((user) => (
              <tr key={user._id}>
                <td style={{ fontWeight: "bold", color: "#f8fafc" }}>{user.hoTen}</td>
                <td className="tk-username">@{user.username}</td>
                <td>{renderRoleBadge(user.vaiTro)}</td>
                <td>
                  <button onClick={() => handleChonSua(user)} className="tk-action-btn" title="Chỉnh sửa quyền">✏️</button>
                  <button onClick={() => handleXoa(user._id)} className="tk-action-btn" title="Xóa tài khoản">🗑️</button>
                </td>
              </tr>
            ))}
            
            {/* Hiển thị khi chưa có data */}
            {danhSachUser.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                  Hệ thống chưa có tài khoản nào được cấp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default QuanLyTaiKhoan;