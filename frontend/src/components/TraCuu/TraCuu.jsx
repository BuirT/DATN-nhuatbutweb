import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./TraCuu.css";

function TraCuu() {
  const [danhSachBaiViet, setDanhSachBaiViet] = useState([]);
  const [danhSachSoBao, setDanhSachSoBao] = useState([]);

  const [timKiem, setTimKiem] = useState({
    butDanh: "",
    soBao: "",
    trangThai: "",
    tuNgay: "",
    denNgay: "",
  });

  const [loading, setLoading] = useState(false);

  const layDuLieuCoBan = async () => {
    try {
      const resSoBao = await axios.get("http://localhost:5000/api/sobao/danh-sach");
      setDanhSachSoBao(resSoBao.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu cơ bản:", error);
    }
  };

  useEffect(() => {
    layDuLieuCoBan();
    // Khởi tạo lấy tất cả danh sách ban đầu
    handleTimKiem();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTimKiem({ ...timKiem, [name]: value });
  };

  const handleTimKiem = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (timKiem.butDanh) params.append("butDanh", timKiem.butDanh);
      if (timKiem.soBao) params.append("soBao", timKiem.soBao);
      if (timKiem.trangThai) params.append("trangThai", timKiem.trangThai);
      if (timKiem.tuNgay) params.append("tuNgay", timKiem.tuNgay);
      if (timKiem.denNgay) params.append("denNgay", timKiem.denNgay);

      const response = await axios.get(`http://localhost:5000/api/nhuanbut/tra-cuu?${params.toString()}`);
      setDanhSachBaiViet(response.data);
    } catch (error) {
      console.error("Lỗi tra cứu:", error);
      toast.error("Lỗi khi tra cứu dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const getTrangThaiText = (trangThaiDuyet) => {
     switch (trangThaiDuyet) {
       case -1: return "Từ chối / Báo sai sót";
       case 0: return "Chờ chấm tiền";
       case 1: return "Đã chấm tiền";
       case 2: return "Đã nhập liệu";
       case 3: return "Đã kiểm tra";
       case 4: return "Đã ký duyệt";
       case 5: return "Đã thanh toán";
       default: return "Không xác định";
     }
  }

  const tongTienGoc = danhSachBaiViet.reduce((sum, item) => sum + (Number(item.tienNhuanBut) || 0), 0);
  const tongTienThucLanh = danhSachBaiViet.reduce((sum, item) => sum + (Number(item.thucLanh) || 0), 0);

  return (
    <div className="tracuu-container">
      <div className="form-box">
        <h2>Tra Cứu Báo Cáo Nhuận Bút</h2>

        <form className="form-tracuu" onSubmit={handleTimKiem}>
          <div className="input-group-4">
            <div className="form-group">
              <label>Từ ngày (Chấm tiền)</label>
              <input type="date" name="tuNgay" value={timKiem.tuNgay} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Đến ngày</label>
              <input type="date" name="denNgay" value={timKiem.denNgay} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Bút danh / Tác giả</label>
              <input type="text" name="butDanh" value={timKiem.butDanh} onChange={handleChange} placeholder="Nhập bút danh..." />
            </div>
            <div className="form-group">
              <label>Kỳ báo / Số báo</label>
              <select name="soBao" value={timKiem.soBao} onChange={handleChange}>
                <option value="">-- Tất cả Số báo --</option>
                {danhSachSoBao.map((bao) => (
                  <option key={bao._id} value={bao.maSoBao}>
                    {bao.maSoBao} - {bao.tenSoBao}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="input-group-2">
            <div className="form-group">
              <label>Trạng thái</label>
              <select name="trangThai" value={timKiem.trangThai} onChange={handleChange}>
                <option value="">-- Tất cả trạng thái --</option>
                <option value="0">Chờ chấm tiền</option>
                <option value="1">Đã chấm tiền</option>
                <option value="2">Đã nhập liệu</option>
                <option value="3">Đã kiểm tra</option>
                <option value="4">Đã ký duyệt (Chờ chi)</option>
                <option value="5">Đã thanh toán</option>
                <option value="-1">Bị từ chối</option>
              </select>
            </div>
            
            <div className="form-actions align-bottom">
                <button type="button" className="btn-print" onClick={() => window.print()}>🖨️ Xuất / In</button>
                <button type="submit" className="btn-search">🔍 Tìm Kiếm</button>
            </div>
          </div>
        </form>
      </div>

      <div className="tracuu-summary">
        <div className="summary-box">
            <div className="summary-title">Tổng số bài</div>
            <div className="summary-value text-blue">{danhSachBaiViet.length}</div>
        </div>
        <div className="summary-box">
            <div className="summary-title">Tổng Tiền Gốc</div>
            <div className="summary-value text-yellow">{tongTienGoc.toLocaleString()}đ</div>
        </div>
        <div className="summary-box">
            <div className="summary-title">Tổng Thực Lãnh</div>
            <div className="summary-value text-green">{tongTienThucLanh.toLocaleString()}đ</div>
        </div>
      </div>

      <div className="table-wrap">
        {loading ? (
            <div className="loading-text">Đang tải dữ liệu...</div>
        ) : (
            <table className="bang-danh-sach">
            <thead>
                <tr>
                <th>Tên bài</th>
                <th>Bút danh</th>
                <th>Kỳ báo</th>
                <th>Trang</th>
                <th>Mục</th>
                <th>Ngày chấm</th>
                <th>Tiền gốc</th>
                <th>Thực lãnh</th>
                <th>Trạng thái</th>
                </tr>
            </thead>
            <tbody>
                {danhSachBaiViet.map((item) => (
                <tr key={item._id}>
                    <td className="text-bold">{item.tenBai}</td>
                    <td>{item.butDanh}</td>
                    <td>{item.soBao}</td>
                    <td>{item.trang}</td>
                    <td>{item.muc}</td>
                    <td>{item.ngayChamTien ? new Date(item.ngayChamTien).toLocaleDateString('vi-VN') : ""}</td>
                    <td>{(Number(item.tienNhuanBut) || 0).toLocaleString()}đ</td>
                    <td className="text-green text-bold">{(Number(item.thucLanh) || 0).toLocaleString()}đ</td>
                    <td>{getTrangThaiText(item.trangThaiDuyet)}</td>
                </tr>
                ))}
                {danhSachBaiViet.length === 0 && (
                <tr>
                    <td colSpan="9" className="table-empty">
                    Không tìm thấy bài viết nào phù hợp với điều kiện lọc
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        )}
      </div>
    </div>
  );
}

export default TraCuu;
