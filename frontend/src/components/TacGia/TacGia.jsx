import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // Nhúng động cơ thông báo
import "./TacGia.css";

function TacGia() {
  const [danhSachTacGia, setDanhSachTacGia] = useState([]);
  const [isEditing, setIsEditing] = useState(null);

  const [formData, setFormData] = useState({
    maTacGia: "",
    hoTen: "",
    butDanh: "",
    loaiTacGia: "CTV",
    khuVuc: "TP.HCM",
    dienThoai: "",
  });

  const layDuLieu = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/tacgia/danh-sach");
      setDanhSachTacGia(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  useEffect(() => {
    layDuLieu();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleXoa = async (id) => {
    if (window.confirm("Đồng chí có chắc chắn muốn xóa tác giả này không?")) {
      try {
        await axios.delete(`http://localhost:5000/api/tacgia/${id}`);
        toast.success("Đã xóa tác giả thành công! 🗑️"); // Thay alert bằng toast
        layDuLieu();
      } catch (error) {
        toast.error("Lỗi khi xóa tác giả! ❌");
      }
    }
  };

  const handleChonSua = (tacGia) => {
    setIsEditing(tacGia._id);
    setFormData({
      maTacGia: tacGia.maTacGia,
      hoTen: tacGia.hoTen,
      butDanh: tacGia.butDanh || "",
      loaiTacGia: tacGia.loaiTacGia,
      khuVuc: tacGia.khuVuc,
      dienThoai: tacGia.dienThoai || "",
    });
  };

  const handleHuySua = () => {
    setIsEditing(null);
    setFormData({ maTacGia: "", hoTen: "", butDanh: "", loaiTacGia: "CTV", khuVuc: "TP.HCM", dienThoai: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/tacgia/${isEditing}`, formData);
        toast.success("Cập nhật thông tin thành công! ✨"); // Thay alert bằng toast
      } else {
        await axios.post("http://localhost:5000/api/tacgia/them", formData);
        toast.success("Đã thêm Tác giả mới thành công! 🎉"); // Thay alert bằng toast
      }
      handleHuySua();
      layDuLieu();
    } catch (error) {
      toast.error("Lỗi thao tác! Vui lòng kiểm tra lại Mã Tác Giả. ⚠️");
    }
  };

  return (
    <div className="tacgia-container">
      <div className="form-box">
        <h3 style={{ color: isEditing ? "#2196F3" : "#4CAF50" }}>{isEditing ? "🛠️ Cập Nhật Thông Tin Tác Giả" : "➕ Thêm Tác Giả / Phóng Viên Mới"}</h3>
        <form className="form-nhap" onSubmit={handleSubmit}>
          <input type="text" name="maTacGia" value={formData.maTacGia} onChange={handleChange} placeholder="Mã TG" required />
          <input type="text" name="hoTen" value={formData.hoTen} onChange={handleChange} placeholder="Họ và Tên" required />
          <input type="text" name="butDanh" value={formData.butDanh} onChange={handleChange} placeholder="Bút Danh" />
          <select name="loaiTacGia" value={formData.loaiTacGia} onChange={handleChange}>
            <option value="CTV">Cộng Tác Viên</option>
            <option value="Phóng viên">Phóng Viên</option>
          </select>
          <input type="text" name="dienThoai" value={formData.dienThoai} onChange={handleChange} placeholder="Số điện thoại" />

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" className="btn-luu">
              {isEditing ? "Lưu Thay Đổi" : "Lưu Tác Giả"}
            </button>
            {isEditing && (
              <button type="button" onClick={handleHuySua} style={{ backgroundColor: "#666" }} className="btn-luu">
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      <h3>Danh sách Tác giả / Phóng viên</h3>
      <table border="1" className="bang-danh-sach">
        <thead>
          <tr>
            <th>Mã TG</th>
            <th>Họ Tên</th>
            <th>Bút Danh</th>
            <th>Loại</th>
            <th>Khu Vực</th>
            <th>Điện Thoại</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {danhSachTacGia.map((tacGia) => (
            <tr key={tacGia._id}>
              <td>{tacGia.maTacGia}</td>
              <td>{tacGia.hoTen}</td>
              <td>{tacGia.butDanh}</td>
              <td>{tacGia.loaiTacGia}</td>
              <td>{tacGia.khuVuc}</td>
              <td>{tacGia.dienThoai}</td>
              <td>
                <button onClick={() => handleChonSua(tacGia)} style={{ marginRight: "5px", cursor: "pointer" }}>
                  ✏️
                </button>
                <button onClick={() => handleXoa(tacGia._id)} style={{ color: "red", cursor: "pointer" }}>
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TacGia;
