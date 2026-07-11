import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./LoaiBao.css";

function LoaiBao() {
  const [danhSach, setDanhSach] = useState([]);
  const [isEditing, setIsEditing] = useState(null);

  const [formData, setFormData] = useState({
    maSo: "",
    tenLoai: "",
  });

  const layDuLieu = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/loaibao/danh-sach");
      setDanhSach(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      toast.error("Không thể tải danh sách Loại báo!");
    }
  };

  useEffect(() => {
    layDuLieu();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleXoa = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa loại báo này?")) {
      try {
        await axios.delete(`http://localhost:5000/api/loaibao/${id}`);
        toast.success("Đã xóa loại báo thành công!");
        layDuLieu();
      } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi xóa loại báo!");
      }
    }
  };

  const handleChonSua = (item) => {
    setIsEditing(item.Maso);
    setFormData({
      maSo: item.Maso,
      tenLoai: item.Tenloai,
    });
  };

  const handleHuySua = () => {
    setIsEditing(null);
    setFormData({ maSo: "", tenLoai: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/loaibao/${isEditing}`, { tenLoai: formData.tenLoai });
        toast.success("Cập nhật thành công!");
      } else {
        await axios.post("http://localhost:5000/api/loaibao/them", formData);
        toast.success("Đã thêm Loại báo mới thành công!");
      }
      handleHuySua();
      layDuLieu();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi thao tác!");
    }
  };

  return (
    <div className="loaibao-container">
      <div className="form-box">
        <h2>{isEditing ? "Cập nhật Loại Báo" : "Thêm Loại Báo Mới"}</h2>

        <form className="form-loaibao" onSubmit={handleSubmit}>
          <div className="input-group">
            <input 
              type="text" 
              name="maSo" 
              value={formData.maSo} 
              onChange={handleChange} 
              placeholder="Mã Loại Báo (*)" 
              required 
              disabled={isEditing} 
              className={isEditing ? "input-disabled" : ""}
            />
            <input 
              type="text" 
              name="tenLoai" 
              value={formData.tenLoai} 
              onChange={handleChange} 
              placeholder="Tên Loại Báo (*)" 
              required 
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-luu">
              {isEditing ? "Lưu thay đổi" : "Lưu Loại Báo"}
            </button>
            {isEditing && (
              <button type="button" className="btn-huy" onClick={handleHuySua}>
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      <h3 className="page-title">Danh sách Loại Báo</h3>

      <div className="table-wrap">
        <table className="bang-danh-sach">
          <thead>
            <tr>
              <th>Mã Loại</th>
              <th>Tên Loại Báo</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {danhSach.map((item) => (
              <tr key={item.Maso}>
                <td className="text-bold">{item.Maso}</td>
                <td>{item.Tenloai}</td>
                <td>
                  <button type="button" className="btn-action btn-edit" onClick={() => handleChonSua(item)} title="Sửa">
                    ✏️
                  </button>
                  <button type="button" className="btn-action btn-del" onClick={() => handleXoa(item.Maso)} title="Xóa">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {danhSach.length === 0 && (
              <tr>
                <td colSpan="3" className="table-empty">
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

export default LoaiBao;
