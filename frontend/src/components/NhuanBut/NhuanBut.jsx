import { useState, useEffect } from "react";
import axios from "axios";
import "./NhuanBut.css";

function NhuanBut() {
  const [danhSachBaiViet, setDanhSachBaiViet] = useState([]);
  const [danhSachTacGia, setDanhSachTacGia] = useState([]);
  const [isEditing, setIsEditing] = useState(null); // Lưu ID bài viết đang sửa

  const [formData, setFormData] = useState({
    tenBai: "",
    tacGia: "",
    muc: "",
    tienNhuanBut: "",
    soBao: "",
    ghiChu: "",
  });

  const layDuLieu = async () => {
    try {
      const resBaiViet = await axios.get("http://localhost:5000/api/nhuanbut/danh-sach");
      setDanhSachBaiViet(resBaiViet.data);
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

  // --- HÀM XÓA BÀI VIẾT ---
  const handleXoa = async (id) => {
    if (window.confirm("Đồng chí có chắc chắn muốn xóa bài viết này?")) {
      try {
        await axios.delete(`http://localhost:5000/api/nhuanbut/${id}`);
        alert("Đã xóa bài viết!");
        layDuLieu();
      } catch (error) {
        alert("Lỗi khi xóa!");
      }
    }
  };

  // --- HÀM CHỌN BÀI ĐỂ SỬA ---
  const handleChonSua = (bai) => {
    setIsEditing(bai._id);
    setFormData({
      tenBai: bai.tenBai,
      tacGia: bai.tacGia?._id || "", // Lấy ID tác giả
      muc: bai.muc || "",
      tienNhuanBut: bai.tienNhuanBut,
      soBao: bai.soBao || "",
      ghiChu: bai.ghiChu || "",
    });
  };

  const handleHuySua = () => {
    setIsEditing(null);
    setFormData({ tenBai: "", tacGia: "", muc: "", tienNhuanBut: "", soBao: "", ghiChu: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/nhuanbut/${isEditing}`, formData);
        alert("Cập nhật bài viết thành công!");
      } else {
        await axios.post("http://localhost:5000/api/nhuanbut/nhap-bai", formData);
        alert("Thêm bài viết thành công!");
      }
      handleHuySua();
      layDuLieu();
    } catch (error) {
      alert("Có lỗi xảy ra, vui lòng kiểm tra dữ liệu!");
    }
  };

  return (
    <div className="nhuanbut-container">
      <div className="form-box">
        <h3 style={{ color: isEditing ? "#2196F3" : "#000" }}>{isEditing ? "🛠️ Sửa Thông Tin Bài Viết" : "Nhập Nhuận Bút Mới"}</h3>
        <form className="form-nhap" onSubmit={handleSubmit}>
          <input type="text" name="tenBai" value={formData.tenBai} onChange={handleChange} placeholder="Tên bài" required />
          <select name="tacGia" value={formData.tacGia} onChange={handleChange} required>
            <option value="">-- Chọn Tác Giả --</option>
            {danhSachTacGia.map((tg) => (
              <option key={tg._id} value={tg._id}>
                {tg.hoTen}
              </option>
            ))}
          </select>
          <input type="number" name="tienNhuanBut" value={formData.tienNhuanBut} onChange={handleChange} placeholder="Số tiền" required />
          <input type="text" name="soBao" value={formData.soBao} onChange={handleChange} placeholder="Số báo" />

          <div style={{ display: "flex", gap: "5px" }}>
            <button type="submit" className="btn-luu-bai">
              {isEditing ? "Cập Nhật" : "Lưu Bài"}
            </button>
            {isEditing && (
              <button type="button" onClick={handleHuySua} className="btn-luu-bai" style={{ backgroundColor: "#666" }}>
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      <h3>Danh sách bài viết</h3>
      <table className="bang-danh-sach">
        <thead>
          <tr>
            <th>Tên Bài</th>
            <th>Tác Giả</th>
            <th>Tiền</th>
            <th>Số Báo</th>
            <th>Trạng Thái</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {danhSachBaiViet.map((bai) => (
            <tr key={bai._id}>
              <td>{bai.tenBai}</td>
              <td>{bai.tacGia?.hoTen}</td>
              <td>{bai.tienNhuanBut.toLocaleString()}đ</td>
              <td>{bai.soBao}</td>
              <td style={{ fontSize: "12px" }}>{bai.trangThai}</td>
              <td>
                <button onClick={() => handleChonSua(bai)} style={{ marginRight: "5px" }}>
                  ✏️
                </button>
                <button onClick={() => handleXoa(bai._id)} style={{ color: "red" }}>
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

export default NhuanBut;
