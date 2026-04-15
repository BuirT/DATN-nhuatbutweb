import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./NhuanBut.css";

function NhuanBut() {
  const [danhSachBaiViet, setDanhSachBaiViet] = useState([]);
  const [danhSachTacGia, setDanhSachTacGia] = useState([]);
  const [danhSachSoBao, setDanhSachSoBao] = useState([]);
  const [cauHinh, setCauHinh] = useState({ mucChiuThue: 2000000, phanTramThue: 10 });
  const [isEditing, setIsEditing] = useState(null);

  const [formData, setFormData] = useState({
    tenBai: "",
    tacGia: "",
    muc: "",
    tienNhuanBut: "",
    soBao: "",
    ghiChu: "",
  });

  const [thue, setThue] = useState(0);
  const [thucLanh, setThucLanh] = useState(0);

  // --- HÀM TẢI DỮ LIỆU TỪ BACKEND ---
  const layDuLieu = async () => {
    try {
      const [resBaiViet, resTacGia, resSoBao] = await Promise.all([
        axios.get("http://localhost:5000/api/nhuanbut/danh-sach"),
        axios.get("http://localhost:5000/api/tacgia/danh-sach"),
        axios.get("http://localhost:5000/api/sobao/danh-sach"),
      ]);
      setDanhSachBaiViet(resBaiViet.data);
      setDanhSachTacGia(resTacGia.data);
      setDanhSachSoBao(resSoBao.data);

      try {
        const resCauHinh = await axios.get("http://localhost:5000/api/cauhinh");
        if (resCauHinh.data) {
          setCauHinh({
            mucChiuThue: Number(resCauHinh.data.mucChiuThue) || 2000000,
            phanTramThue: Number(resCauHinh.data.phanTramThue) || 10,
          });
        }
      } catch {
        /* giữ mặc định nếu không đọc được cấu hình */
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      toast.error("Không thể kết nối đến máy chủ!");
    }
  };

  useEffect(() => {
    layDuLieu();
  }, []);

  // --- XỬ LÝ NHẬP LIỆU & TỰ ĐỘNG TÍNH THUẾ ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "tienNhuanBut") {
      const tienGoc = Number(value) || 0;
      const tienThue = tienGoc >= cauHinh.mucChiuThue ? tienGoc * (cauHinh.phanTramThue / 100) : 0;
      setThue(tienThue);
      setThucLanh(tienGoc - tienThue);
    }
  };

  // --- CÁC HÀM THAO TÁC CRUD ---
  const handleXoa = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này khỏi hệ thống?")) {
      try {
        await axios.delete(`http://localhost:5000/api/nhuanbut/${id}`);
        toast.success("Đã chuyển bài viết vào thùng rác/Lưu trữ! 🗑️");
        layDuLieu();
      } catch (error) {
        toast.error("Lỗi khi xóa bài viết!");
      }
    }
  };

  const handleChonSua = (bai) => {
    setIsEditing(bai._id);
    setFormData({
      tenBai: bai.tenBai,
      tacGia: bai.tacGia?._id || "",
      muc: bai.muc || "",
      tienNhuanBut: bai.tienNhuanBut,
      soBao: bai.soBao || "",
      ghiChu: bai.ghiChu || "",
    });

    const tienGoc = Number(bai.tienNhuanBut) || 0;
    const thueLuu = Number(bai.thue) || 0;
    const thucNum = Number(bai.thucLanh);
    setThue(thueLuu);
    setThucLanh(Number.isFinite(thucNum) ? thucNum : Math.max(0, tienGoc - thueLuu));
  };

  const handleHuySua = () => {
    setIsEditing(null);
    setFormData({ tenBai: "", tacGia: "", muc: "", tienNhuanBut: "", soBao: "", ghiChu: "" });
    setThue(0);
    setThucLanh(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/nhuanbut/${isEditing}`, formData);
        toast.success("Cập nhật bài viết thành công!");
      } else {
        await axios.post("http://localhost:5000/api/nhuanbut/nhap-bai", formData);
        toast.success("Thêm bài viết mới thành công!");
      }
      handleHuySua();
      layDuLieu();
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu!");
    }
  };

  // --- LOGIC HỆ THỐNG CẢNH BÁO VƯỢT NGÂN SÁCH ---
  const soBaoHienTai = danhSachSoBao.find((sb) => sb.maSoBao === formData.soBao);
  const nganSachToiDa = soBaoHienTai ? soBaoHienTai.nganSach : 0;

  const tongTienDaChi = danhSachBaiViet.filter((bai) => bai.soBao === formData.soBao).reduce((tong, bai) => tong + (Number(bai.tienNhuanBut) || 0), 0);

  let tienDaChiThucTe = tongTienDaChi;
  if (isEditing) {
    const baiCu = danhSachBaiViet.find((b) => b._id === isEditing);
    if (baiCu) {
      tienDaChiThucTe -= Number(baiCu.tienNhuanBut) || 0;
    }
  }

  const tienDangNhap = Number(formData.tienNhuanBut) || 0;
  const isVuotNganSach = nganSachToiDa > 0 && tienDaChiThucTe + tienDangNhap > nganSachToiDa;

  return (
    <div className="nhuanbut-container">
      {/* KHU VỰC FORM NHẬP LIỆU */}
      <div className="form-box">
        <h3 className={isEditing ? "nhuanbut-title-editing" : undefined}>{isEditing ? "Sửa thông tin bài viết" : "Nhập nhuận bút & tính thuế"}</h3>

        <form className="form-nhap" onSubmit={handleSubmit}>
          <input className="input-full" type="text" name="tenBai" value={formData.tenBai} onChange={handleChange} placeholder="Tên bài viết" required />

          <div className="form-row-2">
            <select name="tacGia" value={formData.tacGia} onChange={handleChange} required>
              <option value="">-- Chọn Tác Giả --</option>
              {danhSachTacGia.map((tg) => (
                <option key={tg._id} value={tg._id}>
                  {tg.hoTen}
                </option>
              ))}
            </select>

            <select name="soBao" value={formData.soBao} onChange={handleChange} required>
              <option value="">-- Chọn Kỳ Báo / Số Báo --</option>
              {danhSachSoBao.map((bao) => (
                <option key={bao._id} value={bao.maSoBao}>
                  {bao.maSoBao} - {bao.tenSoBao || "Kỳ báo này"}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row-3">
            <input type="number" name="tienNhuanBut" value={formData.tienNhuanBut} onChange={handleChange} placeholder="Nhập Tiền Gốc (VNĐ)" required min="0" />

            <div className="tax-preview tax-preview--danger">
              Thuế TNCN ({cauHinh.phanTramThue}% từ {cauHinh.mucChiuThue.toLocaleString("vi-VN")}đ): <strong>{thue.toLocaleString()}đ</strong>
            </div>

            <div className="tax-preview tax-preview--success">
              Thực lãnh: <strong className="tax-preview-strong">{thucLanh.toLocaleString()}đ</strong>
            </div>
          </div>

          {formData.soBao && nganSachToiDa > 0 && (
            <div className={`budget-panel ${isVuotNganSach ? "budget-panel--warn" : "budget-panel--ok"}`}>
              <div className="budget-row">
                <span>
                  Ngân sách cấp cho <b>{formData.soBao}</b>:
                </span>
                <span className="budget-amount">{nganSachToiDa.toLocaleString()} đ</span>
              </div>
              <div className="budget-row">
                <span>Tổng đã chi + Bài hiện tại:</span>
                <span className={isVuotNganSach ? "text-danger-strong" : "text-success-strong"}>{(tienDaChiThucTe + tienDangNhap).toLocaleString()} đ</span>
              </div>
              {isVuotNganSach && <div className="budget-alert">Đã vượt ngân sách kỳ — tạm khóa lưu.</div>}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className={`btn-luu-bai ${isVuotNganSach ? "btn-luu-bai--blocked" : ""}`} disabled={isVuotNganSach}>
              {isEditing ? "Cập nhật dữ liệu" : "Lưu bài & tính toán"}
            </button>
            {isEditing && (
              <button type="button" onClick={handleHuySua} className="btn-luu-bai btn-luu-bai--muted">
                Hủy thao tác
              </button>
            )}
          </div>
        </form>
      </div>

      {/* KHU VỰC BẢNG HIỂN THỊ CÓ KÈM NÚT IN ẤN */}
      <div className="nhuanbut-toolbar">
        <h3 className="section-heading">Bảng kê chi tiết nhuận bút</h3>
        <button type="button" className="btn-in-an" onClick={() => window.print()}>
          In bảng kê trình ký
        </button>
      </div>

      <div className="nhuanbut-table-wrap">
        <table className="bang-danh-sach">
          <thead>
            <tr>
              <th>Tên bài</th>
              <th>Tác giả</th>
              <th>Số báo</th>
              <th>Tiền gốc</th>
              <th className="th-money-warn">Thuế ({cauHinh.phanTramThue}%)</th>
              <th className="th-money-ok">Thực lãnh</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {danhSachBaiViet.map((bai) => {
              const tien = Number(bai.tienNhuanBut) || 0;
              const tienThue = Number(bai.thue) || 0;
              const tienThuc = Number.isFinite(Number(bai.thucLanh)) ? Number(bai.thucLanh) : Math.max(0, tien - tienThue);

              return (
                <tr key={bai._id}>
                  <td className="td-title">{bai.tenBai}</td>
                  <td>{bai.tacGia?.hoTen}</td>
                  <td>
                    <span className="issue-pill">{bai.soBao}</span>
                  </td>
                  <td className="td-amount">{tien.toLocaleString()}đ</td>
                  <td className="td-money-warn">{tienThue > 0 ? `-${tienThue.toLocaleString()}đ` : "0đ"}</td>
                  <td className="td-money-ok">{tienThuc.toLocaleString()}đ</td>
                  <td>
                    {/* 👉 ĐÃ CẬP NHẬT LOGIC 4 BƯỚC MÀU SẮC */}
                    <span
                      className={bai.trangThai === "Đã thanh toán" ? "badge-thanhtoan" : bai.trangThai === "Đã duyệt" ? "badge-xong" : bai.trangThai === "Trình Lãnh Đạo" ? "badge-trinh" : "badge-cho"}
                    >
                      {bai.trangThai || "Chờ duyệt"}
                    </span>
                  </td>
                  <td>
                    <button type="button" onClick={() => handleChonSua(bai)} title="Sửa bài">
                      ✏️
                    </button>
                    <button type="button" onClick={() => handleXoa(bai._id)} title="Xóa bài">
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
            {danhSachBaiViet.length === 0 && (
              <tr>
                <td colSpan="8" className="table-empty">
                  Chưa có dữ liệu bài viết
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* KHU VỰC CHỮ KÝ (Chỉ hiện ra trên giấy in) */}
      <div className="khu-vuc-chu-ky">
        <div className="chu-ky-box">
          <div className="chu-ky-title">Người Nhập Liệu</div>
          <div className="chu-ky-note">(Ký, ghi rõ họ tên)</div>
        </div>

        <div className="chu-ky-box">
          <div className="chu-ky-title">Người Kiểm Tra</div>
          <div className="chu-ky-note">(Ký, ghi rõ họ tên)</div>
        </div>

        <div className="chu-ky-box">
          <div className="chu-ky-title">Tổng Thư Ký Tòa Soạn</div>
          <div className="chu-ky-note">(Ký, ghi rõ họ tên)</div>
        </div>
      </div>
    </div>
  );
}

export default NhuanBut;
