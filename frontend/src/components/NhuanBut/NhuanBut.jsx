import { useState, useEffect } from "react";
import axios from "axios";
import "./NhuanBut.css";

function NhuanBut() {
  const [danhSachBaiViet, setDanhSachBaiViet] = useState([]);
  const [danhSachTacGia, setDanhSachTacGia] = useState([]); // Để làm menu chọn tác giả

  const [formData, setFormData] = useState({
    tenBai: "",
    tacGia: "",
    muc: "",
    tienNhuanBut: "",
    soBao: "",
    ghiChu: "",
  });

  // Gọi API lấy dữ liệu khi mở trang
  const layDuLieu = async () => {
    try {
      // Lấy danh sách bài viết
      const resBaiViet = await axios.get("http://localhost:5000/api/nhuanbut/danh-sach");
      setDanhSachBaiViet(resBaiViet.data);

      // Lấy danh sách tác giả để đưa vào thẻ <select>
      const resTacGia = await axios.get("http://localhost:5000/api/tacgia/danh-sach");
      setDanhSachTacGia(resTacGia.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
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
    if (!formData.tacGia) {
      alert("Vui lòng chọn Tác giả cho bài viết này!");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/nhuanbut/nhap-bai", formData);
      alert("Đã nhập bài viết thành công!");
      layDuLieu(); // Cập nhật lại bảng
      setFormData({ tenBai: "", tacGia: "", muc: "", tienNhuanBut: "", soBao: "", ghiChu: "" });
    } catch (error) {
      alert("Có lỗi xảy ra khi lưu bài viết, vui lòng kiểm tra lại!");
      console.error(error);
    }
  };

  return (
    <div className="nhuanbut-container">
      <div className="form-box">
        <h3>Nhập Nhuận Bút Bài Viết Mới</h3>
        <form className="form-nhap" onSubmit={handleSubmit}>
          <input type="text" name="tenBai" value={formData.tenBai} onChange={handleChange} placeholder="Tên bài viết" required style={{ flex: 1, minWidth: "200px" }} />

          {/* Dropdown chọn tác giả từ Database */}
          <select name="tacGia" value={formData.tacGia} onChange={handleChange} required>
            <option value="">-- Chọn Tác Giả --</option>
            {danhSachTacGia.map((tg) => (
              <option key={tg._id} value={tg._id}>
                {tg.hoTen} ({tg.butDanh || "Không có bút danh"})
              </option>
            ))}
          </select>

          <input type="text" name="muc" value={formData.muc} onChange={handleChange} placeholder="Mục (VD: Thời sự)" />
          <input type="number" name="tienNhuanBut" value={formData.tienNhuanBut} onChange={handleChange} placeholder="Tiền nhuận bút (VNĐ)" required />
          <input type="text" name="soBao" value={formData.soBao} onChange={handleChange} placeholder="Số báo phát hành" />
          <input type="text" name="ghiChu" value={formData.ghiChu} onChange={handleChange} placeholder="Ghi chú thêm" />

          <button type="submit" className="btn-luu-bai">
            Lưu Bài Viết
          </button>
        </form>
      </div>

      <h3>Danh sách Bài viết đã nhập</h3>
      <table border="1" className="bang-danh-sach">
        <thead>
          <tr>
            <th>Tên Bài</th>
            <th>Tác Giả</th>
            <th>Mục</th>
            <th>Tiền Nhuận Bút</th>
            <th>Số Báo</th>
            <th>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          {danhSachBaiViet.map((bai) => (
            <tr key={bai._id}>
              <td>{bai.tenBai}</td>
              {/* Do backend đã dùng hàm populate nên mình có thể lấy thẳng hoTen */}
              <td>{bai.tacGia?.hoTen}</td>
              <td>{bai.muc}</td>
              <td>{bai.tienNhuanBut.toLocaleString("vi-VN")} đ</td>
              <td>{bai.soBao}</td>
              <td style={{ color: "#ff9800", fontWeight: "bold" }}>{bai.trangThai}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default NhuanBut;
