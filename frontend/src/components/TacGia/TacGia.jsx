import { useState, useEffect } from "react";
import axios from "axios";
import "./TacGia.css"; // Gọi file CSS riêng vào đây

function TacGia() {
  const [danhSachTacGia, setDanhSachTacGia] = useState([]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/tacgia/them", formData);
      alert("Đã thêm Tác giả thành công!");
      layDuLieu();
      setFormData({ maTacGia: "", hoTen: "", butDanh: "", loaiTacGia: "CTV", khuVuc: "TP.HCM", dienThoai: "" });
    } catch (error) {
      alert("Lỗi: Mã Tác Giả có thể bị trùng!");
    }
  };

  return (
    <div className="tacgia-container">
      {/* KHU VỰC NHẬP LIỆU */}
      <div className="form-box">
        <h3>Thêm Tác Giả / Phóng Viên Mới</h3>
        <form className="form-nhap" onSubmit={handleSubmit}>
          <input type="text" name="maTacGia" value={formData.maTacGia} onChange={handleChange} placeholder="Mã TG (VD: TG002)" required />
          <input type="text" name="hoTen" value={formData.hoTen} onChange={handleChange} placeholder="Họ và Tên" required />
          <input type="text" name="butDanh" value={formData.butDanh} onChange={handleChange} placeholder="Bút Danh" />
          <select name="loaiTacGia" value={formData.loaiTacGia} onChange={handleChange}>
            <option value="CTV">Cộng Tác Viên</option>
            <option value="Phóng viên">Phóng Viên</option>
          </select>
          <input type="text" name="dienThoai" value={formData.dienThoai} onChange={handleChange} placeholder="Số điện thoại" />
          <button type="submit" className="btn-luu">
            Lưu Tác Giả
          </button>
        </form>
      </div>

      {/* KHU VỰC HIỂN THỊ BẢNG */}
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TacGia;
