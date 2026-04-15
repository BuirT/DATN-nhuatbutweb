import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./PhieuChi.css";

const danhSachTinhThanh = [
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bạc Liêu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Cần Thơ",
  "Đà Nẵng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Nội",
  "Hà Tĩnh",
  "Hải Dương",
  "Hải Phòng",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "TP. Hồ Chí Minh",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

function PhieuChi() {
  const [danhSachBaiViet, setDanhSachBaiViet] = useState([]);
  const [danhSachSoBao, setDanhSachSoBao] = useState([]);
  const tenNguoiDung = localStorage.getItem("hoTen") || "Kế Toán Vô Danh";

  const [tabHienTai, setTabHienTai] = useState("ChoTrinhDuyet");
  const [locSoBao, setLocSoBao] = useState("");
  const [locKhuVuc, setLocKhuVuc] = useState("");

  const [danhSachGom, setDanhSachGom] = useState([]);
  const [isLapping, setIsLapping] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]);

  const [formData, setFormData] = useState({
    hinhThuc: "Chuyển khoản",
    lyDo: "Thanh toán nhuận bút kỳ báo",
  });

  const layDuLieu = async () => {
    try {
      const resBai = await axios.get("http://localhost:5000/api/nhuanbut/danh-sach");
      const resBao = await axios.get("http://localhost:5000/api/sobao/danh-sach");
      setDanhSachBaiViet(resBai.data);
      setDanhSachSoBao(resBao.data);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu hệ thống!");
    }
  };

  useEffect(() => {
    layDuLieu();
  }, []);

  // --- Gom nhóm theo tác giả ---
  useEffect(() => {
    let dataLoc = danhSachBaiViet.filter((bai) => (tabHienTai === "ChoTrinhDuyet" ? bai.trangThai === "Chờ duyệt" || !bai.trangThai : bai.trangThai === "Đã duyệt"));

    dataLoc = dataLoc.filter((bai) => {
      const khopSoBao = locSoBao === "" || bai.soBao === locSoBao;
      const khopKhuVuc = locKhuVuc === "" || (bai.tacGia && bai.tacGia.khuVuc === locKhuVuc);
      return khopSoBao && khopKhuVuc;
    });

    const groupedData = dataLoc.reduce((acc, bai) => {
      const idTG = bai.tacGia?._id;
      if (!idTG) return acc;

      if (!acc[idTG]) {
        acc[idTG] = { tacGia: bai.tacGia, danhSachBai: [], tongGoc: 0 };
      }
      acc[idTG].danhSachBai.push(bai);
      acc[idTG].tongGoc += Number(bai.tienNhuanBut) || 0;
      return acc;
    }, {});

    const finalData = Object.values(groupedData).map((nhom) => {
      const tongThue = nhom.danhSachBai.reduce((s, b) => s + (Number(b.thue) || 0), 0);
      const tongThucLanh = nhom.danhSachBai.reduce((s, b) => s + (Number(b.thucLanh) || 0), 0);
      return { ...nhom, tongThue, tongThucLanh };
    });

    setDanhSachGom(finalData);
  }, [danhSachBaiViet, tabHienTai, locSoBao, locKhuVuc]);

  const toggleRow = (idTG) => {
    setExpandedRows((prev) => (prev.includes(idTG) ? prev.filter((id) => id !== idTG) : [...prev, idTG]));
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleMoForm = (nhom) => setIsLapping(nhom);
  const handleHuyForm = () => {
    setIsLapping(null);
    setFormData({ hinhThuc: "Chuyển khoản", lyDo: "Thanh toán nhuận bút kỳ báo" });
  };

  const handleTrinhLanhDao = async (e) => {
    e.preventDefault();
    try {
      await Promise.all(isLapping.danhSachBai.map((bai) => axios.put(`http://localhost:5000/api/nhuanbut/${bai._id}`, { trangThai: "Trình Lãnh Đạo", nguoiThaoTac: tenNguoiDung })));
      toast.success("Đã lập phiếu trình Lãnh Đạo thành công!");
      handleHuyForm();
      layDuLieu();
    } catch (error) {
      toast.error("Lỗi khi trình duyệt!");
    }
  };

  // 👉 HÀM QUAN TRỌNG: CẬP NHẬT TRẠNG THÁI VÀ HÌNH THỨC CHI XUỐNG TỪNG BÀI VIẾT
  const handleXuatPhieu = async (e) => {
    e.preventDefault();
    try {
      // BƯỚC 1: Cập nhật Trạng thái và "hinhThucChi" (CK hay TM) vào từng Bài Viết
      await Promise.all(
        isLapping.danhSachBai.map((bai) =>
          axios.put(`http://localhost:5000/api/nhuanbut/${bai._id}`, {
            trangThai: "Đã thanh toán",
            hinhThucChi: formData.hinhThuc, // Truyền thông tin CK/TM xuống DB Bài Viết
            nguoiThaoTac: tenNguoiDung,
          }),
        ),
      );

      // BƯỚC 2: Tạo Phiếu Chi tổng (Giữ nguyên logic cũ của sếp)
      const payload = {
        tacGia: isLapping.tacGia._id,
        danhSachBai: isLapping.danhSachBai.map((b) => b._id),
        tongTien: isLapping.tongGoc,
        tongThue: isLapping.tongThue,
        thucLanh: isLapping.tongThucLanh,
        hinhThuc: formData.hinhThuc,
        lyDo: formData.lyDo,
        nguoiThaoTac: tenNguoiDung,
      };

      await axios.post("http://localhost:5000/api/phieuchi/tao-phieu", payload);

      toast.success("Xuất quỹ và Tất toán thành công!");
      handleHuyForm();
      layDuLieu();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi hệ thống khi thanh toán — phiếu chưa được lưu.");
    }
  };

  return (
    <div className="phieuchi-container">
      {/* KHU VỰC ĐIỀU HƯỚNG CỦA KẾ TOÁN */}
      <div className="tab-container">
        <button
          onClick={() => {
            setTabHienTai("ChoTrinhDuyet");
            handleHuyForm();
            setExpandedRows([]);
          }}
          className={`btn-tab ${tabHienTai === "ChoTrinhDuyet" ? "active-blue" : ""}`}
        >
          1. Gửi Lãnh Đạo Duyệt
        </button>
        <button
          onClick={() => {
            setTabHienTai("ChoThanhToan");
            handleHuyForm();
            setExpandedRows([]);
          }}
          className={`btn-tab ${tabHienTai === "ChoThanhToan" ? "active-green" : ""}`}
        >
          2. Xuất Phiếu Thanh Toán (Đã Duyệt)
        </button>
      </div>

      {/* BỘ LỌC TÌM KIẾM */}
      <div className="filter-container">
        <select value={locSoBao} onChange={(e) => setLocSoBao(e.target.value)} className="filter-select">
          <option value="">-- Tất cả Số Báo --</option>
          {danhSachSoBao.map((sb) => (
            <option key={sb._id} value={sb.maSoBao}>
              {sb.maSoBao} - {sb.tenSoBao}
            </option>
          ))}
        </select>
        <select value={locKhuVuc} onChange={(e) => setLocKhuVuc(e.target.value)} className="filter-select">
          <option value="">-- Tất cả Tỉnh / Thành phố --</option>
          {danhSachTinhThanh.map((tinh, index) => (
            <option key={index} value={tinh}>
              {tinh}
            </option>
          ))}
        </select>
      </div>

      {/* FORM LẬP PHIẾU HIỂN THỊ KHI BẤM NÚT */}
      {isLapping && (
        <div className={`form-lap-phieu ${tabHienTai === "ChoTrinhDuyet" ? "border-blue" : "border-green"}`}>
          <h3 className={tabHienTai === "ChoTrinhDuyet" ? "form-title-blue" : "form-title-green"}>{tabHienTai === "ChoTrinhDuyet" ? "LẬP PHIẾU TRÌNH DUYỆT" : "XUẤT PHIẾU THANH TOÁN"}</h3>
          <p className="text-light">
            Tác giả thụ hưởng: <strong style={{ fontSize: "16px" }}>{isLapping.tacGia.hoTen}</strong> ({isLapping.danhSachBai.length} bài viết)
          </p>
          <p className="text-light">
            Tổng Thực Lãnh: <strong className="text-highlight">{isLapping.tongThucLanh.toLocaleString("vi-VN")}đ</strong>
          </p>

          <form onSubmit={tabHienTai === "ChoTrinhDuyet" ? handleTrinhLanhDao : handleXuatPhieu} style={{ marginTop: "20px" }}>
            {tabHienTai === "ChoThanhToan" && (
              <div className="form-group-row">
                <select name="hinhThuc" value={formData.hinhThuc} onChange={handleChange} className="filter-select">
                  <option value="Chuyển khoản">Chuyển khoản (CK)</option>
                  <option value="Tiền mặt">Tiền mặt (TM)</option>
                </select>
                <input type="text" name="lyDo" value={formData.lyDo} onChange={handleChange} placeholder="Nhập lý do chi tiền..." className="input-lydo" required />
              </div>
            )}

            <div className="btn-action-group">
              <button type="submit" className={`btn-submit ${tabHienTai === "ChoTrinhDuyet" ? "blue" : "green"}`}>
                {tabHienTai === "ChoTrinhDuyet" ? "Trình Lãnh Đạo Ký Duyệt" : "Xác Nhận Đã Chuyển Tiền"}
              </button>
              <button type="button" onClick={handleHuyForm} className="btn-cancel">
                Hủy Bỏ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BẢNG TỔNG HỢP CÔNG NỢ */}
      <h3 className="table-section-title">{tabHienTai === "ChoTrinhDuyet" ? "Danh Sách Chờ Trình Duyệt" : "Danh Sách Chờ Thanh Toán"}</h3>

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
                  {/* DÒNG TỔNG HỢP TÁC GIẢ */}
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
                        Xử Lý Phiếu
                      </button>
                    </td>
                  </tr>

                  {/* BẢNG CON CHI TIẾT KHI XỔ RA */}
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
