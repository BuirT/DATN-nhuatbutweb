import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import "./ThongKe.css";

function ThongKe() {
  const [dataThongKe, setDataThongKe] = useState([]);
  const [tongToanBo, setTongToanBo] = useState(0);
  const [thang, setThang] = useState(new Date().getMonth() + 1);
  const [nam, setNam] = useState(new Date().getFullYear());

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  const layThongKe = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/thongke/thong-ke-tong?thang=${thang}&nam=${nam}`);

      const formattedData = res.data.map((item) => ({
        name: item.infoTacGia.butDanh || item.infoTacGia.hoTen,
        tien: item.tongTien,
      }));
      setDataThongKe(formattedData);

      const tong = res.data.reduce((acc, item) => acc + item.tongTien, 0);
      setTongToanBo(tong);
    } catch (error) {
      console.error("Lỗi tải thống kê", error);
    }
  };

  useEffect(() => {
    layThongKe();
  }, [thang, nam]);

  const handleXuatExcel = () => {
    const dataExcel = dataThongKe.map((item, index) => ({
      STT: index + 1,
      "Tác giả": item.name,
      "Tổng Nhuận Bút (VNĐ)": item.tien,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCao");
    XLSX.writeFile(workbook, `Bao-Cao-${thang}-${nam}.xlsx`);
  };

  return (
    <div className="thongke-container">
      <div className="card-tong">
        <h2>
          TỔNG CHI NHUẬN BÚT THÁNG {thang}/{nam}
        </h2>
        <h1 style={{ fontSize: "2.5rem" }}>{tongToanBo.toLocaleString()} VNĐ</h1>
        <button onClick={handleXuatExcel} className="btn-excel">
          📥 Xuất Báo Cáo Excel
        </button>
      </div>

      <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", marginBottom: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <h3 style={{ textAlign: "center", color: "#333" }}>Biểu đồ Nhuận bút theo Tác giả</h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={dataThongKe}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip formatter={(value) => value.toLocaleString() + " VNĐ"} />
              <Bar dataKey="tien" radius={[5, 5, 0, 0]}>
                {dataThongKe.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="filter-box">
        <label>Tháng: </label>
        <select value={thang} onChange={(e) => setThang(e.target.value)}>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              Tháng {i + 1}
            </option>
          ))}
        </select>
        <label> Năm: </label>
        <select value={nam} onChange={(e) => setNam(e.target.value)}>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
        </select>
      </div>

      <table className="bang-thongke">
        <thead>
          <tr>
            <th>Tác giả</th>
            <th>Tổng Tiền</th>
          </tr>
        </thead>
        <tbody>
          {dataThongKe.map((item, idx) => (
            <tr key={idx}>
              <td>{item.name}</td>
              <td className="money">{item.tien.toLocaleString()} đ</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ThongKe;
