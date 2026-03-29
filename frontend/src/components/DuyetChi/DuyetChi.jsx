import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import axios from "axios";
import "./DuyetChi.css";

function DuyetChi() {
  const [danhSachBaiViet, setDanhSachBaiViet] = useState([]);

  // --- STATE CHO BỘ LỌC ---
  const [locKhuVuc, setLocKhuVuc] = useState("Tất cả");
  const [locSoBao, setLocSoBao] = useState("Tất cả");

  const layDuLieu = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/nhuanbut/danh-sach");
      setDanhSachBaiViet(res.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    }
  };

  useEffect(() => {
    layDuLieu();
  }, []);

  const handleDuyetBai = async (id) => {
    const xacNhan = window.confirm("Xác nhận duyệt chi trả cho bài viết này?");
    if (!xacNhan) return;

    try {
      await axios.put(`http://localhost:5000/api/duyetchi/duyet-bai/${id}`, {
        trangThai: "Đã duyệt",
      });
      toast.success("Đã duyệt chi thành công! Tiền đã xuất kho 💸");
      layDuLieu();
    } catch (error) {
      toast.error("Có lỗi xảy ra, không thể duyệt bài!");
    }
  };

  // --- THUẬT TOÁN TẠO DANH SÁCH LỌC TỰ ĐỘNG ---
  const dsKhuVuc = ["Tất cả", ...new Set(danhSachBaiViet.map((b) => b.tacGia?.khuVuc).filter(Boolean))];
  const dsSoBao = ["Tất cả", ...new Set(danhSachBaiViet.map((b) => b.soBao).filter(Boolean))];

  // --- ÁP DỤNG BỘ LỌC VÀO DỮ LIỆU ---
  const danhSachHienThi = danhSachBaiViet.filter((bai) => {
    const matchKhuVuc = locKhuVuc === "Tất cả" || bai.tacGia?.khuVuc === locKhuVuc;
    const matchSoBao = locSoBao === "Tất cả" || bai.soBao === locSoBao;
    return matchKhuVuc && matchSoBao;
  });

  return (
    <div className="duyetchi-container">
      <h2>Ban Lãnh Đạo Ký Duyệt</h2>

      {/* --- THANH CÔNG CỤ LỌC (FILTER BAR) --- */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px", backgroundColor: "#1e293b", padding: "15px", borderRadius: "10px", alignItems: "center" }}>
        <h4 style={{ margin: 0, color: "#94a3b8" }}>🔍 Bộ Lọc Nhanh:</h4>

        <select
          value={locSoBao}
          onChange={(e) => setLocSoBao(e.target.value)}
          style={{ padding: "8px 15px", borderRadius: "8px", backgroundColor: "#0f172a", color: "white", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
        >
          {dsSoBao.map((sb) => (
            <option key={sb} value={sb}>
              {sb === "Tất cả" ? "-- Tất cả Số Báo --" : `Kỳ báo: ${sb}`}
            </option>
          ))}
        </select>

        <select
          value={locKhuVuc}
          onChange={(e) => setLocKhuVuc(e.target.value)}
          style={{ padding: "8px 15px", borderRadius: "8px", backgroundColor: "#0f172a", color: "white", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
        >
          {dsKhuVuc.map((kv) => (
            <option key={kv} value={kv}>
              {kv === "Tất cả" ? "-- Tất cả Khu Vực --" : `Khu vực: ${kv}`}
            </option>
          ))}
        </select>

        <div style={{ marginLeft: "auto", color: "#38bdf8", fontWeight: "bold" }}>Đang hiển thị: {danhSachHienThi.length} bài viết</div>
      </div>

      <table className="bang-duyet">
        <thead>
          <tr>
            <th>Tên Bài</th>
            <th>Tác Giả</th>
            <th>Khu Vực</th>
            <th>Số Báo</th>
            <th>Tiền Gốc</th>
            <th style={{ color: "#f87171" }}>Thuế TNCN</th>
            <th style={{ color: "#34d399" }}>Thực Lãnh</th>
            <th>Trạng Thái</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {danhSachHienThi.map((bai) => {
            const tienGoc = bai.tienNhuanBut || 0;
            const tienThue = bai.thue || 0;
            const thucLanh = bai.thucLanh || tienGoc;

            return (
              <tr key={bai._id}>
                <td>
                  <strong>{bai.tenBai}</strong>
                </td>
                <td>{bai.tacGia?.hoTen}</td>

                {/* Hiển thị Khu Vực của Tác Giả */}
                <td>
                  <span style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", padding: "4px 8px", borderRadius: "5px", fontSize: "12px" }}>{bai.tacGia?.khuVuc || "Chưa rõ"}</span>
                </td>

                <td style={{ fontWeight: "bold", color: "#4facfe" }}>{bai.soBao}</td>
                <td style={{ fontWeight: "bold" }}>{tienGoc.toLocaleString("vi-VN")}đ</td>
                <td style={{ color: "#f87171" }}>{tienThue > 0 ? `-${tienThue.toLocaleString("vi-VN")}đ` : "0đ"}</td>
                <td style={{ color: "#34d399", fontWeight: "bold", fontSize: "16px" }}>{thucLanh.toLocaleString("vi-VN")}đ</td>
                <td>
                  <span className={bai.trangThai === "Chờ duyệt" ? "badge-cho" : "badge-xong"}>{bai.trangThai}</span>
                </td>
                <td>
                  {bai.trangThai === "Chờ duyệt" ? (
                    <button className="btn-duyet" onClick={() => handleDuyetBai(bai._id)}>
                      ✔️ Duyệt Chi
                    </button>
                  ) : (
                    <button className="btn-da-duyet" disabled>
                      Đã Duyệt
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DuyetChi;
