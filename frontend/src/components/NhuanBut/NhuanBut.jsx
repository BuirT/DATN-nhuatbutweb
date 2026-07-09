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

  const myRole = localStorage.getItem("vaiTro") || "";
  const myName = localStorage.getItem("hoTen") || "";
  
  const roleLower = myRole.toLowerCase();
  const isAdmin = roleLower.includes("admin") || roleLower.includes("quản trị viên");

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
        toast.success("Đã xóa bài viết khỏi hệ thống! 🗑️");
        layDuLieu();
      } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi xóa bài viết!");
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
        await axios.put(`http://localhost:5000/api/nhuanbut/${isEditing}`, {
           action: "UPDATE_INFO",
           ...formData
        });
        toast.success("Cập nhật bài viết thành công!");
      } else {
        await axios.post("http://localhost:5000/api/nhuanbut/nhap-bai", {
           ...formData,
           nguoiNhap: myName
        });
        toast.success("Thêm bài viết mới thành công!");
      }
      handleHuySua();
      layDuLieu();
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu!");
    }
  };

  // --- LOGIC PHÂN QUYỀN DUYỆT BÀI 5 BƯỚC WINFORM ---
  const thucHienDuyet = async (bai, action, tienMoi = null, lyDo = null) => {
    try {
      await axios.put(`http://localhost:5000/api/nhuanbut/${bai._id}`, {
        action: action,
        tienNhuanBut: tienMoi !== null ? tienMoi : bai.tienNhuanBut,
        lyDoBaoSai: lyDo,
        nguoiThaoTac: myName
      });
      toast.success("Thao tác thành công!");
      layDuLieu();
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái bài viết!");
    }
  }

  const handleDuyetBai = (bai) => {
    if (isAdmin) {
       thucHienDuyet(bai, "DUYET_NHANH");
       return;
    }
    if (roleLower.includes("thư ký")) {
       const tienInput = window.prompt("Nhập số tiền nhuận bút để CHẤM TIỀN (VNĐ):", bai.tienNhuanBut || 0);
       if (tienInput !== null && !isNaN(tienInput)) {
         thucHienDuyet(bai, "CHAM_TIEN", Number(tienInput));
       }
    } else if (roleLower.includes("kế toán")) {
       if (window.confirm("Kế toán: Xác nhận ĐÃ NHẬP LIỆU bài viết này?")) {
         thucHienDuyet(bai, "XAC_NHAN_NHAP_LIEU");
       }
    } else if (roleLower.includes("kiểm tra viên")) {
       if (window.confirm("Kiểm tra viên: Xác nhận TÍNH CHÍNH XÁC của bài viết này?")) {
         thucHienDuyet(bai, "XAC_NHAN_KIEM_TRA");
       }
    } else if (roleLower.includes("tổng thư ký")) {
       if (window.confirm("Tổng thư ký: KÝ DUYỆT bài viết này?")) {
         thucHienDuyet(bai, "KY_DUYET");
       }
    }
  }

  const handleTuChoi = (bai) => {
     if (isAdmin) {
       if (window.confirm("Đưa bài này về lại trạng thái Chờ chấm tiền?")) {
          thucHienDuyet(bai, "DUA_VE_CHO_CHAM_TIEN");
       }
       return;
     }
     
     if (roleLower.includes("kế toán")) {
        const lyDo = window.prompt("Nhập lý do sai sót để trả bài về cho Thư ký:");
        if (lyDo) {
           thucHienDuyet(bai, "BAO_SAI_SOT", null, lyDo);
        }
     } else if (roleLower.includes("kiểm tra viên")) {
        if (window.confirm("Trả bài này về cho Kế toán soát lại?")) {
           thucHienDuyet(bai, "TRA_VE_KE_TOAN");
        }
     } else if (roleLower.includes("tổng thư ký")) {
        if (window.confirm("Trả bài này về cho Kiểm tra viên soát lại?")) {
           thucHienDuyet(bai, "TRA_VE_KIEM_TRA");
        }
     }
  }

  // Helper hàm lấy trạng thái Text và Class CSS dựa vào số 0-4
  const getTrangThaiText = (trangThaiDuyet) => {
     switch (trangThaiDuyet) {
       case 0: return "Chờ chấm tiền";
       case 1: return "Đã chấm tiền";
       case 2: return "Đã nhập liệu";
       case 3: return "Đã kiểm tra";
       case 4: return "Đã ký duyệt";
       default: return "Không xác định";
     }
  }

  const getTrangThaiClass = (trangThaiDuyet) => {
     switch (trangThaiDuyet) {
       case 0: return "badge-cho";
       case 1: return "badge-trinh";
       case 2: return "badge-xong";
       case 3: return "badge-thanhtoan";
       case 4: return "badge-thanhtoan";
       default: return "badge-cho";
     }
  }

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
      {/* KHU VỰC FORM NHẬP LIỆU (Chỉ hiện cho Thư ký / Quản trị viên) */}
      {(isAdmin || roleLower.includes("thư ký")) && (
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
      )}

      {/* KHU VỰC BẢNG HIỂN THỊ CÓ KÈM NÚT IN ẤN */}
      <div className="nhuanbut-toolbar">
        <h3 className="section-heading">Luồng Phê Duyệt Nhuận Bút</h3>
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
              <th>Hành động (Theo Quyền)</th>
            </tr>
          </thead>
          <tbody>
            {danhSachBaiViet.map((bai) => {
              const tien = Number(bai.tienNhuanBut) || 0;
              const tienThue = Number(bai.thue) || 0;
              const tienThuc = Number.isFinite(Number(bai.thucLanh)) ? Number(bai.thucLanh) : Math.max(0, tien - tienThue);

              // Điều kiện hiển thị Nút Duyệt
              let showDuyet = false;
              let btnText = "✅ Xác nhận";
              let showTuChoi = false;
              let btnTuChoiText = "❌ Trả về";

              if (isAdmin && bai.trangThaiDuyet < 4) {
                 showDuyet = true; btnText = "✅ Duyệt (Tiếp theo)";
                 showTuChoi = true; btnTuChoiText = "🔄 Về chờ chấm tiền";
              } else if (roleLower.includes("thư ký") && bai.trangThaiDuyet === 0) {
                 showDuyet = true; btnText = "✅ Chấm tiền";
              } else if (roleLower.includes("kế toán") && bai.trangThaiDuyet === 1) {
                 showDuyet = true; btnText = "✅ Đã nhập liệu";
                 showTuChoi = true; btnTuChoiText = "📨 Báo sai sót";
              } else if (roleLower.includes("kiểm tra viên") && bai.trangThaiDuyet === 2) {
                 showDuyet = true; btnText = "✅ Xác nhận đúng";
                 showTuChoi = true; btnTuChoiText = "❌ Trả về Kế toán";
              } else if (roleLower.includes("tổng thư ký") && bai.trangThaiDuyet === 3) {
                 showDuyet = true; btnText = "✅ Ký duyệt";
                 showTuChoi = true; btnTuChoiText = "❌ Trả về Kiểm tra";
              }

              // Sửa và xóa (Chỉ Thư ký & Admin khi ở giai đoạn 0 hoặc 1)
              const showEditDelete = (isAdmin || roleLower.includes("thư ký")) && bai.trangThaiDuyet <= 1;

              return (
                <tr key={bai._id}>
                  <td className="td-title">
                     {bai.tenBai}
                     {bai.lyDoBaoSai && (
                       <div style={{color: 'red', fontSize: '11px', marginTop: '4px'}}>
                         ⚠️ Báo lỗi: {bai.lyDoBaoSai}
                       </div>
                     )}
                  </td>
                  <td>{bai.tacGia?.hoTen}</td>
                  <td>
                    <span className="issue-pill">{bai.soBao}</span>
                  </td>
                  <td className="td-amount">{tien.toLocaleString()}đ</td>
                  <td className="td-money-warn">{tienThue > 0 ? `-${tienThue.toLocaleString()}đ` : "0đ"}</td>
                  <td className="td-money-ok">{tienThuc.toLocaleString()}đ</td>
                  <td>
                    <span className={getTrangThaiClass(bai.trangThaiDuyet)}>
                      {getTrangThaiText(bai.trangThaiDuyet)}
                    </span>
                  </td>
                  <td style={{display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center'}}>
                    {showEditDelete && (
                      <>
                        <button type="button" className="btn-action-sm btn-edit-sm" onClick={() => handleChonSua(bai)} title="Sửa bài">✏️ Sửa</button>
                        <button type="button" className="btn-action-sm btn-del-sm" onClick={() => handleXoa(bai._id)} title="Xóa bài">🗑️</button>
                      </>
                    )}
                    {showDuyet && (
                      <button type="button" className="btn-action-sm btn-approve-sm" onClick={() => handleDuyetBai(bai)}>
                        {btnText}
                      </button>
                    )}
                    {showTuChoi && (
                      <button type="button" className="btn-action-sm btn-reject-sm" onClick={() => handleTuChoi(bai)}>
                        {btnTuChoiText}
                      </button>
                    )}
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
