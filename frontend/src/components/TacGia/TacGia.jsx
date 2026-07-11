import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./TacGia.css";

// Danh sách 63 Tỉnh/Thành phố Việt Nam (Xếp theo A-Z)
const danhSachTinhThanh = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Giang", "Bắc Kạn", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Cần Thơ", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái",
];

function TacGia() {
  const [danhSachTacGia, setDanhSachTacGia] = useState([]);
  const [isEditing, setIsEditing] = useState(null);

  const [formData, setFormData] = useState({
    maTacGia: "",
    maThe: "",
    hoTen: "",
    ngaySinh: "",
    butDanh: "",
    loaiTacGia: "CTV",
    khuVuc: "TP. Hồ Chí Minh",
    dienThoai: "",
    email: "",
    soTaiKhoan: "",
    phongBan: "",
    nganHang: ""
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
    const { name, value } = e.target;
    if (name === "dienThoai") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      if (onlyNums.length <= 10) {
        setFormData({ ...formData, [name]: onlyNums });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleXoa = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tác giả này không?")) {
      try {
        await axios.delete(`http://localhost:5000/api/tacgia/${id}`);
        toast.success("Đã xóa tác giả thành công!");
        layDuLieu();
      } catch (error) {
        toast.error("Lỗi khi xóa tác giả!");
      }
    }
  };

  const handleChonSua = (tacGia) => {
    setIsEditing(tacGia._id);
    setFormData({
      maTacGia: tacGia.maTacGia || "",
      maThe: tacGia.maThe || "",
      hoTen: tacGia.hoTen || "",
      ngaySinh: tacGia.ngaySinh ? new Date(tacGia.ngaySinh).toISOString().split('T')[0] : "",
      butDanh: tacGia.butDanh || "",
      loaiTacGia: tacGia.loaiTacGia || "CTV",
      khuVuc: tacGia.khuVuc || "TP. Hồ Chí Minh",
      dienThoai: tacGia.dienThoai || "",
      email: tacGia.email || "",
      soTaiKhoan: tacGia.soTaiKhoan || "",
      phongBan: tacGia.phongBan || "",
      nganHang: tacGia.nganHang || ""
    });
  };

  const handleHuySua = () => {
    setIsEditing(null);
    setFormData({ maTacGia: "", maThe: "", hoTen: "", ngaySinh: "", butDanh: "", loaiTacGia: "CTV", khuVuc: "TP. Hồ Chí Minh", dienThoai: "", email: "", soTaiKhoan: "", phongBan: "", nganHang: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.dienThoai && formData.dienThoai.length !== 10) {
      toast.error("Số điện thoại phải bao gồm đúng 10 chữ số!");
      return;
    }
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/tacgia/${isEditing}`, formData);
        toast.success("Cập nhật thông tin thành công!");
      } else {
        await axios.post("http://localhost:5000/api/tacgia/them", formData);
        toast.success("Đã thêm Tác giả mới thành công!");
      }
      handleHuySua();
      layDuLieu();
    } catch (error) {
      toast.error("Lỗi thao tác! Vui lòng kiểm tra lại.");
    }
  };

  return (
    <div className="tacgia-container">
      {/* KHU VỰC FORM NHẬP LIỆU */}
      <div className="form-box">
        <h2>{isEditing ? "Cập nhật thông tin tác giả" : "Thêm tác giả / phóng viên"}</h2>

        <form className="form-tacgia" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input type="text" name="maTacGia" value={formData.maTacGia} onChange={handleChange} placeholder="Mã TG (*)" required />
            <input type="text" name="maThe" value={formData.maThe} onChange={handleChange} placeholder="Mã thẻ / CCCD" />
          </div>

          <input type="text" name="hoTen" value={formData.hoTen} onChange={handleChange} placeholder="Họ và Tên (*)" required />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input type="date" name="ngaySinh" value={formData.ngaySinh} onChange={handleChange} placeholder="Ngày sinh" />
            <input type="text" name="butDanh" value={formData.butDanh} onChange={handleChange} placeholder="Bút Danh" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <select name="loaiTacGia" value={formData.loaiTacGia} onChange={handleChange}>
              <option value="CTV">Cộng Tác Viên</option>
              <option value="Phóng viên">Phóng Viên</option>
            </select>
            <select name="khuVuc" value={formData.khuVuc} onChange={handleChange} required>
              <option value="">-- Chọn Tỉnh / Thành Phố --</option>
              {danhSachTinhThanh.map((tinh, index) => (
                <option key={index} value={tinh}>{tinh}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input type="text" name="dienThoai" value={formData.dienThoai} onChange={handleChange} placeholder="Số điện thoại" />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input type="text" name="soTaiKhoan" value={formData.soTaiKhoan} onChange={handleChange} placeholder="Số Tài Khoản" />
            <input type="text" name="nganHang" value={formData.nganHang} onChange={handleChange} placeholder="Ngân Hàng" />
          </div>
          
          <input type="text" name="phongBan" value={formData.phongBan} onChange={handleChange} placeholder="Phòng ban" />

          <div className="tacgia-btn-row">
            <button type="submit" className="btn-luu">
              {isEditing ? "Lưu thay đổi" : "Lưu tác giả"}
            </button>
            {isEditing && (
              <button type="button" className="btn-luu btn-huy-tacgia" onClick={handleHuySua}>
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* KHU VỰC BẢNG DANH SÁCH */}
      <h3 className="tacgia-page-title">Danh sách tác giả / phóng viên</h3>

      <div className="tacgia-table-wrap">
        <table className="bang-tacgia">
          <thead>
            <tr>
              <th>Mã TG</th>
              <th>Họ Tên</th>
              <th>CCCD</th>
              <th>Bút Danh</th>
              <th>Loại</th>
              <th>STK</th>
              <th>Điện Thoại</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {danhSachTacGia.map((tacGia) => (
              <tr key={tacGia._id}>
                <td className="tg-code">{tacGia.maTacGia}</td>
                <td className="tg-name">{tacGia.hoTen}</td>
                <td>{tacGia.maThe}</td>
                <td>{tacGia.butDanh}</td>
                <td>
                  <span className={tacGia.loaiTacGia === "Phóng viên" ? "tg-badge-pv" : "tg-badge-ctv"}>{tacGia.loaiTacGia}</span>
                </td>
                <td>{tacGia.soTaiKhoan}</td>
                <td>{tacGia.dienThoai}</td>
                <td>
                  <button type="button" onClick={() => handleChonSua(tacGia)} title="Sửa thông tin">
                    ✏️
                  </button>
                  <button type="button" onClick={() => handleXoa(tacGia._id)} title="Xóa tác giả">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {danhSachTacGia.length === 0 && (
              <tr>
                <td colSpan="8" className="table-empty">
                  Chưa có dữ liệu tác giả
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TacGia;
