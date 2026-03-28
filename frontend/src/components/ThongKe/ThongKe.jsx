import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./ThongKe.css";

function ThongKe() {
  const [dataThongKe, setDataThongKe] = useState([]);
  const [tongToanBo, setTongToanBo] = useState(0);
  const [thang, setThang] = useState(new Date().getMonth() + 1);
  const [nam, setNam] = useState(new Date().getFullYear());

  const layThongKe = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/nhuanbut/thong-ke-tong?thang=${thang}&nam=${nam}`);
      setDataThongKe(res.data);
      const tong = res.data.reduce((acc, item) => acc + item.tongTien, 0);
      setTongToanBo(tong);
    } catch (error) {
      console.error("Lỗi tải thống kê", error);
    }
  };

  useEffect(() => {
    layThongKe();
  }, [thang, nam]);

  // --- HÀM XUẤT EXCEL THẦN THÁNH ---
  const handleXuatExcel = () => {
    // 1. Chuẩn bị dữ liệu để đưa vào file Excel
    const dataExcel = dataThongKe.map((item, index) => ({
      STT: index + 1,
      "Họ và Tên": item.infoTacGia.hoTen,
      "Bút Danh": item.infoTacGia.butDanh,
      "Số lượng bài": item.soBai,
      "Tổng Nhuận Bút (VNĐ)": item.tongTien,
    }));

    // 2. Tạo một bảng tính (Workbook)
    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCaoNhuanBut");

    // 3. Tải file về máy với tên file theo Tháng/Năm
    XLSX.writeFile(workbook, `Bao-Cao-Nhuan-But-Thang-${thang}-${nam}.xlsx`);
  };

  return (
    <div className="thongke-container">
      <div className="card-tong">
        <h2>
          TỔNG CHI NHUẬN BÚT THÁNG {thang}/{nam}
        </h2>
        <h1 style={{ fontSize: "3rem" }}>{tongToanBo.toLocaleString()} VNĐ</h1>

        {/* Nút bấm Xuất Excel */}
        <button onClick={handleXuatExcel} style={{ padding: "10px 20px", backgroundColor: "#2e7d32", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
          📥 Xuất Báo Cáo Excel
        </button>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
        <label>Tháng: </label>
        <select value={thang} onChange={(e) => setThang(e.target.value)}>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              Tháng {i + 1}
            </option>
          ))}
        </select>
        <label>Năm: </label>
        <select value={nam} onChange={(e) => setNam(e.target.value)}>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
        </select>
      </div>

      <table className="bang-thongke">
        <thead>
          <tr>
            <th>Họ Tên</th>
            <th>Bút Danh</th>
            <th>Số bài</th>
            <th>Tổng Tiền</th>
          </tr>
        </thead>
        <tbody>
          {dataThongKe.map((item) => (
            <tr key={item._id}>
              <td>{item.infoTacGia.hoTen}</td>
              <td>{item.infoTacGia.butDanh}</td>
              <td>{item.soBai}</td>
              <td className="money">{item.tongTien.toLocaleString()} đ</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ThongKe;
