import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./ButDanh.css";

function ButDanh() {
  const [danhSach, setDanhSach] = useState([]);
  const [danhSachTacGia, setDanhSachTacGia] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [oldButDanh, setOldButDanh] = useState("");

  const [formData, setFormData] = useState({
    butDanh: "",
    msTacGia: "",
  });

  const layDuLieu = async () => {
    try {
      const [resButDanh, resTacGia] = await Promise.all([
        axios.get("http://localhost:5000/api/butdanh/danh-sach"),
        axios.get("http://localhost:5000/api/tacgia/danh-sach"),
      ]);
      setDanhSach(resButDanh.data);
      setDanhSachTacGia(resTacGia.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      toast.error("Không thể tải danh sách!");
    }
  };

  useEffect(() => {
    layDuLieu();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleXoa = async (butDanh) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bút danh "${butDanh}"?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/butdanh/${encodeURIComponent(butDanh)}`);
        toast.success("Đã xóa bút danh thành công!");
        layDuLieu();
      } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi xóa bút danh!");
      }
    }
  };

  const handleChonSua = (item) => {
    setIsEditing(true);
    setOldButDanh(item.butDanh);
    setFormData({
      butDanh: item.butDanh,
      msTacGia: item.msTacGia || "",
    });
  };

  const handleHuySua = () => {
    setIsEditing(false);
    setOldButDanh("");
    setFormData({ butDanh: "", msTacGia: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.butDanh.trim()) {
        toast.error("Bút danh không được để trống!");
        return;
    }
    
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/butdanh/sua`, { 
            oldButDanh: oldButDanh,
            newButDanh: formData.butDanh.trim(),
            msTacGia: formData.msTacGia 
        });
        toast.success("Cập nhật thành công!");
      } else {
        await axios.post("http://localhost:5000/api/butdanh/them", {
            butDanh: formData.butDanh.trim(),
            msTacGia: formData.msTacGia 
        });
        toast.success("Đã thêm Bút danh mới thành công!");
      }
      handleHuySua();
      layDuLieu();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi thao tác!");
    }
  };

  return (
    <div className="butdanh-container">
      <div className="form-box">
        <h2>{isEditing ? "Cập nhật Bút Danh" : "Thêm Bút Danh Mới"}</h2>

        <form className="form-butdanh" onSubmit={handleSubmit}>
          <div className="input-group">
            <input 
              type="text" 
              name="butDanh" 
              value={formData.butDanh} 
              onChange={handleChange} 
              placeholder="Tên Bút Danh (*)" 
              required 
            />
            
            <select name="msTacGia" value={formData.msTacGia} onChange={handleChange}>
              <option value="">-- Thuộc Tác Giả (Có thể để trống) --</option>
              {danhSachTacGia.map((tg) => (
                <option key={tg._id} value={tg._id}>
                  {tg.hoTen} ({tg._id})
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-luu">
              {isEditing ? "Lưu thay đổi" : "Lưu Bút Danh"}
            </button>
            {isEditing && (
              <button type="button" className="btn-huy" onClick={handleHuySua}>
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      <h3 className="page-title">Danh sách Bút Danh</h3>

      <div className="table-wrap">
        <table className="bang-danh-sach">
          <thead>
            <tr>
              <th>Bút Danh</th>
              <th>Mã Tác Giả Gốc</th>
              <th>Tên Tác Giả</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {danhSach.map((item, index) => (
              <tr key={index}>
                <td className="text-bold">{item.butDanh}</td>
                <td>{item.msTacGia || <span className="text-muted">Chưa liên kết</span>}</td>
                <td>{item.tenTacGia || <span className="text-muted">-</span>}</td>
                <td>
                  <button type="button" className="btn-action btn-edit" onClick={() => handleChonSua(item)} title="Sửa">
                    ✏️
                  </button>
                  <button type="button" className="btn-action btn-del" onClick={() => handleXoa(item.butDanh)} title="Xóa">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {danhSach.length === 0 && (
              <tr>
                <td colSpan="4" className="table-empty">
                  Chưa có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ButDanh;
