import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./DuyetChi.css";

function DuyetChi() {
  const [danhSachPhieu, setDanhSachPhieu] = useState([]);
  const [tabHienTai, setTabHienTai] = useState("ChoDuyet"); // ChoDuyet, ChoThanhToan, DaThanhToan

  const tenNguoiDung = localStorage.getItem("hoTen") || "Lãnh Đạo Vô Danh";
  const myRole = localStorage.getItem("vaiTro") || "";
  const roleLower = myRole.toLowerCase();

  const isLanhDao = roleLower.includes("lãnh đạo") || roleLower.includes("admin") || roleLower.includes("quản trị viên");
  const isKeToan = roleLower.includes("kế toán");

  const layDuLieu = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/duyetchi/danh-sach");
      setDanhSachPhieu(res.data);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu trình duyệt!");
    }
  };

  useEffect(() => {
    layDuLieu();
  }, []);

  // Lọc dữ liệu theo tab
  const dsHienThi = danhSachPhieu.filter(p => {
    if (tabHienTai === "ChoDuyet") {
      return p.trangThaiDuyet === 0;
    } else if (tabHienTai === "ChoThanhToan") {
      return p.trangThaiDuyet === 1 && p.dathutien !== 'Y';
    } else if (tabHienTai === "DaThanhToan") {
      return p.trangThaiDuyet === 1 && p.dathutien === 'Y';
    } else if (tabHienTai === "TuChoi") {
      return p.trangThaiDuyet === -1;
    }
    return true;
  });

  const formatNgay = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
  }

  // --- HÀNH ĐỘNG CỦA LÃNH ĐẠO ---
  const handleDuyetPhieu = async (phieu) => {
    if (window.confirm(`Sếp có chắc chắn DUYỆT phiếu chi ${phieu.soPhieu} (${phieu.thucLanh.toLocaleString("vi-VN")}đ) cho ${phieu.tenTacGia}?`)) {
      try {
        await axios.put(`http://localhost:5000/api/duyetchi/${phieu.soPhieu}`, {
          action: "DUYET",
          nguoiThaoTac: tenNguoiDung
        });
        toast.success(`Đã PHÊ DUYỆT phiếu chi ${phieu.soPhieu}!`);
        layDuLieu();
      } catch (error) {
        toast.error("Lỗi khi duyệt phiếu!");
      }
    }
  };

  const handleTuChoi = async (phieu) => {
    const lyDo = window.prompt(`Nhập lý do từ chối phiếu chi ${phieu.soPhieu}:`);
    if (lyDo) {
      try {
        await axios.put(`http://localhost:5000/api/duyetchi/${phieu.soPhieu}`, {
          action: "TU_CHOI",
          lyDoTuChoi: lyDo,
          nguoiThaoTac: tenNguoiDung
        });
        toast.warning(`Đã TỪ CHỐI phiếu chi ${phieu.soPhieu} và trả bài viết về trạng thái chờ lập phiếu!`);
        layDuLieu();
      } catch (error) {
        toast.error("Lỗi khi từ chối phiếu!");
      }
    }
  };

  // --- HÀNH ĐỘNG CỦA KẾ TOÁN ---
  const handleThanhToan = async (phieu) => {
    if (window.confirm(`Xác nhận ĐÃ CHUYỂN TIỀN/CHI TIỀN MẶT cho phiếu chi ${phieu.soPhieu} (${phieu.thucLanh.toLocaleString("vi-VN")}đ)?`)) {
      try {
        await axios.put(`http://localhost:5000/api/duyetchi/${phieu.soPhieu}`, {
          action: "THANH_TOAN",
          nguoiThaoTac: tenNguoiDung
        });
        toast.success(`Đã đánh dấu ĐÃ THANH TOÁN cho phiếu ${phieu.soPhieu}!`);
        layDuLieu();
      } catch (error) {
        toast.error("Lỗi khi thanh toán phiếu!");
      }
    }
  };

  return (
    <div className="duyetchi-container">
      <div className="filter-bar">
        <div style={{ display: 'flex', gap: '10px' }}>
          {(isLanhDao || isKeToan) && (
            <button
              className={`btn-tab ${tabHienTai === "ChoDuyet" ? "active-blue" : ""}`}
              onClick={() => setTabHienTai("ChoDuyet")}
            >
              Chờ Lãnh Đạo Duyệt
            </button>
          )}
          {(isKeToan || isLanhDao) && (
            <button
              className={`btn-tab ${tabHienTai === "ChoThanhToan" ? "active-green" : ""}`}
              onClick={() => setTabHienTai("ChoThanhToan")}
            >
              Chờ Kế Toán Chi Tiền
            </button>
          )}
          <button
            className={`btn-tab ${tabHienTai === "DaThanhToan" ? "active-blue" : ""}`}
            style={tabHienTai === "DaThanhToan" ? { backgroundColor: '#10b981', color: 'white' } : {}}
            onClick={() => setTabHienTai("DaThanhToan")}
          >
            Đã Thanh Toán
          </button>
          <button
            className={`btn-tab ${tabHienTai === "TuChoi" ? "active-blue" : ""}`}
            style={tabHienTai === "TuChoi" ? { backgroundColor: '#ef4444', color: 'white' } : {}}
            onClick={() => setTabHienTai("TuChoi")}
          >
            Đã Từ Chối
          </button>
        </div>
        <div className="filter-count">Đang hiển thị: {dsHienThi.length} Phiếu</div>
      </div>

      <div className="table-wrapper">
        <table className="bang-danh-sach">
          <thead>
            <tr>
              <th>Số Phiếu</th>
              <th>Ngày Lập</th>
              <th>Tác Giả</th>
              <th>Người Nhận (Thông Tin)</th>
              <th className="text-highlight">Thực Lãnh</th>
              <th>Lý Do</th>
              <th>Hình Thức</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {dsHienThi.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b", fontSize: "16px" }}>
                  Hiện tại không có phiếu chi nào trong mục này.
                </td>
              </tr>
            ) : (
              dsHienThi.map((phieu) => (
                <tr key={phieu.soPhieu}>
                  <td className="text-bold">{phieu.soPhieu}</td>
                  <td>{formatNgay(phieu.ngayLap)}</td>
                  <td className="text-bold">{phieu.tenTacGia}</td>
                  <td className="text-italic">{phieu.nguoiNhan}</td>
                  <td className="text-highlight" style={{ fontSize: '16px' }}>{phieu.thucLanh.toLocaleString("vi-VN")}đ</td>
                  <td>{phieu.lyDo}</td>
                  <td>{phieu.hinhThuc}</td>
                  <td>
                    <div className="action-buttons">
                      {tabHienTai === "ChoDuyet" && isLanhDao && (
                        <>
                          <button onClick={() => handleDuyetPhieu(phieu)} className="btn-approve">
                            DUYỆT
                          </button>
                          <button onClick={() => handleTuChoi(phieu)} className="btn-reject">
                            TỪ CHỐI
                          </button>
                        </>
                      )}
                      {tabHienTai === "ChoThanhToan" && isKeToan && (
                        <button onClick={() => handleThanhToan(phieu)} className="btn-approve" style={{ backgroundColor: '#059669' }}>
                          ĐÃ CHI TIỀN
                        </button>
                      )}
                      {tabHienTai === "TuChoi" && (
                        <span style={{ color: 'red', fontSize: '13px' }}>
                          Lý do: {phieu.lyDoTuChoi}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DuyetChi;
