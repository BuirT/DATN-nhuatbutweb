import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./PhieuChi.css";

function PhieuChi() {
  const [danhSachBaiViet, setDanhSachBaiViet] = useState([]);
  const [cauHinh, setCauHinh] = useState({ mucChiuThue: 2000000, phanTramThue: 10 });
  const tenNguoiDung = localStorage.getItem("hoTen") || "Kế Toán Vô Danh";

  const [danhSachGom, setDanhSachGom] = useState([]);
  const [isLapping, setIsLapping] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]);

  const [formData, setFormData] = useState({
    hinhThuc: "Chuyển khoản",
    lyDo: "Thanh toán nhuận bút",
    mst: "",
    cccd: "",
    dienThoai: "",
    nguoiNhan: ""
  });

  const layDuLieu = async () => {
    try {
      // 1. Lấy danh sách bài viết CHƯA THANH TOÁN (Trạng thái 4, chưa lập phiếu)
      const resBai = await axios.get("http://localhost:5000/api/phieuchi/bai-chua-thanh-toan");
      // 2. Lấy danh sách nhuận bút đầy đủ để mapping tác giả (hoặc ta có thể map ngay trong sql)
      const resNB = await axios.get("http://localhost:5000/api/nhuanbut/danh-sach");
      
      try {
        const resCauHinh = await axios.get("http://localhost:5000/api/cauhinh");
        if (resCauHinh.data) {
          setCauHinh({
            mucChiuThue: Number(resCauHinh.data.mucChiuThue) || 2000000,
            phanTramThue: Number(resCauHinh.data.phanTramThue) || 10,
          });
        }
      } catch {}

      // Lọc ra các bài viết chưa thanh toán từ danh sách đầy đủ
      const unpaidIds = resBai.data.map(b => b._id);
      const dataFull = resNB.data.filter(b => unpaidIds.includes(b._id));
      
      setDanhSachBaiViet(dataFull);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu hệ thống!");
    }
  };

  useEffect(() => {
    layDuLieu();
  }, []);

  // --- Gom nhóm theo tác giả ---
  useEffect(() => {
    const groupedData = danhSachBaiViet.reduce((acc, bai) => {
      // Lấy id tác giả, nếu ko có thì gom theo bút danh hoặc tên
      const keyTG = bai.tacGia?._id || bai.tacGia?.hoTen || 'khong-ro';
      
      if (!acc[keyTG]) {
        acc[keyTG] = { 
          tacGia: bai.tacGia || { hoTen: "Không xác định", _id: keyTG }, 
          danhSachBai: [], 
          tongGoc: 0 
        };
      }
      acc[keyTG].danhSachBai.push(bai);
      acc[keyTG].tongGoc += Number(bai.tienNhuanBut) || 0;
      return acc;
    }, {});

    const finalData = Object.values(groupedData).map((nhom) => {
      // TÍNH THUẾ DỰA TRÊN TỔNG THU NHẬP
      let tongThue = 0;
      if (nhom.tongGoc >= cauHinh.mucChiuThue) {
         tongThue = nhom.tongGoc * (cauHinh.phanTramThue / 100);
      }
      const tongThucLanh = nhom.tongGoc - tongThue;
      return { ...nhom, tongThue, tongThucLanh };
    });

    setDanhSachGom(finalData);
  }, [danhSachBaiViet, cauHinh]);

  const toggleRow = (idTG) => {
    setExpandedRows((prev) => (prev.includes(idTG) ? prev.filter((id) => id !== idTG) : [...prev, idTG]));
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleMoForm = (nhom) => {
    setIsLapping(nhom);
    setFormData({ 
      hinhThuc: "Chuyển khoản", 
      lyDo: "Thanh toán nhuận bút kỳ này",
      mst: "",
      cccd: "",
      dienThoai: "",
      nguoiNhan: nhom.tacGia?.hoTen || ""
    });
  };

  const handleHuyForm = () => {
    setIsLapping(null);
  };

  const handleXuatPhieu = async (e) => {
    e.preventDefault();
    try {
      // Tạo Phiếu Chi theo Winform Logic
      const payload = {
        tacGia_id: isLapping.tacGia._id,
        tacGia_butDanh: isLapping.tacGia.hoTen, // Bút danh tạm lấy tên
        danhSachBai: isLapping.danhSachBai.map((b) => ({
          _id: b._id,
          tienNhuanBut: b.tienNhuanBut
        })),
        tongTien: isLapping.tongGoc,
        tongThue: isLapping.tongThue,
        thucLanh: isLapping.tongThucLanh,
        hinhThuc: formData.hinhThuc,
        lyDo: formData.lyDo,
        nguoiNhan: formData.nguoiNhan,
        mst: formData.mst,
        cccd: formData.cccd,
        dienThoai: formData.dienThoai,
        thueSuat: isLapping.tongGoc >= cauHinh.mucChiuThue ? cauHinh.phanTramThue : 0,
        nguoiThaoTac: tenNguoiDung,
      };

      await axios.post("http://localhost:5000/api/phieuchi/tao-phieu", payload);

      toast.success("Lập Phiếu Chi thành công! Đang chờ Lãnh đạo duyệt.");
      handleHuyForm();
      layDuLieu();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi hệ thống khi thanh toán — phiếu chưa được lưu.");
    }
  };

  return (
    <div className="phieuchi-container">
      <div className="tab-container">
        <button className="btn-tab active-blue">
          Lập Phiếu Chi Nhuận Bút
        </button>
      </div>

      {/* FORM LẬP PHIẾU HIỂN THỊ KHI BẤM NÚT */}
      {isLapping && (
        <div className="form-lap-phieu border-blue">
          <h3 className="form-title-blue">LẬP PHIẾU CHI TỔNG HỢP</h3>
          <p className="text-light">
            Tác giả thụ hưởng: <strong style={{ fontSize: "16px" }}>{isLapping.tacGia.hoTen}</strong> ({isLapping.danhSachBai.length} bài viết)
          </p>
          <div style={{ display: "flex", gap: "20px", marginTop: "10px", marginBottom: "15px" }}>
            <p className="text-light">
              Tổng Gốc: <strong>{isLapping.tongGoc.toLocaleString("vi-VN")}đ</strong>
            </p>
            <p className="text-light" style={{ color: "var(--danger)" }}>
              Tổng Thuế: <strong>{isLapping.tongThue.toLocaleString("vi-VN")}đ</strong>
            </p>
            <p className="text-light">
              Tổng Thực Lãnh: <strong className="text-highlight">{isLapping.tongThucLanh.toLocaleString("vi-VN")}đ</strong>
            </p>
          </div>

          <form onSubmit={handleXuatPhieu} style={{ marginTop: "20px" }}>
            <div className="form-group-row">
              <input type="text" name="nguoiNhan" value={formData.nguoiNhan} onChange={handleChange} placeholder="Người nhận tiền..." className="input-lydo" required />
              <input type="text" name="dienThoai" value={formData.dienThoai} onChange={handleChange} placeholder="Điện thoại..." className="input-lydo" />
            </div>
            <div className="form-group-row" style={{ marginTop: "10px" }}>
              <input type="text" name="cccd" value={formData.cccd} onChange={handleChange} placeholder="CMND / CCCD..." className="input-lydo" />
              <input type="text" name="mst" value={formData.mst} onChange={handleChange} placeholder="Mã số thuế..." className="input-lydo" />
            </div>
            <div className="form-group-row" style={{ marginTop: "10px" }}>
              <select name="hinhThuc" value={formData.hinhThuc} onChange={handleChange} className="filter-select">
                <option value="Chuyển khoản">Chuyển khoản (CK)</option>
                <option value="Tiền mặt">Tiền mặt (TM)</option>
              </select>
              <input type="text" name="lyDo" value={formData.lyDo} onChange={handleChange} placeholder="Nhập lý do chi tiền..." className="input-lydo" required />
            </div>

            <div className="btn-action-group" style={{ marginTop: "20px" }}>
              <button type="submit" className="btn-submit blue">
                Lưu Phiếu Chi (Chờ Duyệt)
              </button>
              <button type="button" onClick={handleHuyForm} className="btn-cancel">
                Hủy Bỏ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BẢNG TỔNG HỢP CÔNG NỢ */}
      <h3 className="table-section-title">Danh Sách Bài Đã Ký Duyệt (Chờ Kế Toán Xuất Phiếu)</h3>

      <div className="table-wrapper">
        <table className="phieuchi-table">
          <thead>
            <tr>
              <th>Tác Giả</th>
              <th>Khu Vực</th>
              <th>Số Lượng Bài</th>
              <th className="text-red">Tổng Thuế</th>
              <th className="text-green-bold">Tổng Thực Lãnh</th>
              <th style={{ textAlign: "center" }}>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {danhSachGom.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px" }} className="text-italic">
                  Hiện không có hồ sơ nào trong mục này.
                </td>
              </tr>
            ) : (
              danhSachGom.map((nhom) => (
                <span key={nhom.tacGia._id} style={{ display: "contents" }}>
                  <tr className={expandedRows.includes(nhom.tacGia._id) ? "row-expanded" : ""}>
                    <td className="text-bold">{nhom.tacGia.hoTen}</td>
                    <td className="text-italic">{nhom.tacGia.khuVuc || "Chưa rõ"}</td>
                    <td>
                      <button onClick={() => toggleRow(nhom.tacGia._id)} className="btn-toggle">
                        {expandedRows.includes(nhom.tacGia._id) ? "Đóng" : "Xem chi tiết"} ({nhom.danhSachBai.length} bài)
                      </button>
                    </td>
                    <td className="text-red">{nhom.tongThue > 0 ? `-${nhom.tongThue.toLocaleString("vi-VN")}đ` : "0đ"}</td>
                    <td className="text-green-bold">{nhom.tongThucLanh.toLocaleString("vi-VN")}đ</td>
                    <td style={{ textAlign: "center" }}>
                      <button onClick={() => handleMoForm(nhom)} className="btn-process">
                        Lập Phiếu Chi
                      </button>
                    </td>
                  </tr>

                  {/* BẢNG CON CHI TIẾT */}
                  {expandedRows.includes(nhom.tacGia._id) && (
                    <tr className="sub-table-row">
                      <td colSpan="6" className="sub-table-cell">
                        <div className="sub-table-content">
                          <h4 className="sub-table-title">Danh sách bài báo:</h4>
                          <table className="sub-table">
                            <tbody>
                              {nhom.danhSachBai.map((bai, idx) => (
                                <tr key={bai._id}>
                                  <td className="col-index">{idx + 1}.</td>
                                  <td className="col-name">{bai.tenBaiViet || bai.tenBai || bai.tieuDe || "Chưa cập nhật tên bài"}</td>
                                  <td className="col-issue">Kỳ: {bai.soBao || "N/A"}</td>
                                  <td className="col-money">{Number(bai.tienNhuanBut).toLocaleString("vi-VN")}đ</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </span>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PhieuChi;
