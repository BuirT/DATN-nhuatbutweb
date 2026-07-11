import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(Tooltip, Legend, ArcElement);

function TabLanhDao() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [thang, setThang] = useState(new Date().getMonth() + 1);
  const [nam, setNam] = useState(new Date().getFullYear());

  const fetchLanhDao = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/thongke/lanh-dao?thang=${thang}&nam=${nam}`);
      setData(res.data);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu lãnh đạo!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanhDao();
  }, []);

  const handleExport = () => {
    if (data.length === 0) return toast.warning("Không có dữ liệu!");
    const wsData = data.map((item, index) => ({
      STT: index + 1,
      "Ngày Đăng": new Date(item.ngayDang).toLocaleDateString("vi-VN"),
      "Tên Bài": item.tenBai,
      "Tác Giả": item.tacGia,
      "Tiền Nhuận Bút": item.tienNhuanbut,
      "Thanh Toán": item.thanhToan === 'Y' ? "Đã chi" : "Chưa chi"
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `BaoCao_Thang_${thang}_${nam}`);
    XLSX.writeFile(wb, `BaoCao_LanhDao_${thang}_${nam}.xlsx`);
  };

  const tongSoBai = data.length;
  const tongTien = data.reduce((sum, item) => sum + (item.tienNhuanbut || 0), 0);
  const daChi = data.filter(item => item.thanhToan === 'Y').reduce((sum, item) => sum + (item.tienNhuanbut || 0), 0);
  const chuaChi = tongTien - daChi;

  const chartData = {
    labels: ['Đã Chi (Thanh toán)', 'Chưa Chi (Nợ)'],
    datasets: [{
      data: [daChi, chuaChi],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 1,
    }]
  };

  return (
    <div className="tab-content">
      <form className="filter-bar" onSubmit={fetchLanhDao}>
        <div className="filter-group">
          <label>Tháng</label>
          <input type="number" min="1" max="12" value={thang} onChange={e => setThang(e.target.value)} required />
        </div>
        <div className="filter-group">
          <label>Năm</label>
          <input type="number" min="2000" max="2100" value={nam} onChange={e => setNam(e.target.value)} required />
        </div>
        <button type="submit" className="btn-fetch">🔍 Xem Báo Cáo</button>
        <button type="button" className="btn-export" onClick={handleExport}>🖨 Xuất Excel</button>
      </form>

      <div className="summary-cards">
        <div className="card">
            <div className="card-title">Tổng Số Bài Viết</div>
            <div className="card-value">{tongSoBai}</div>
        </div>
        <div className="card">
            <div className="card-title">Tổng Nhuận Bút</div>
            <div className="card-value val-blue">{tongTien.toLocaleString()}đ</div>
        </div>
        <div className="card">
            <div className="card-title">Đã Giải Ngân</div>
            <div className="card-value val-green">{daChi.toLocaleString()}đ</div>
        </div>
      </div>

      {data.length > 0 && (
        <div className="chart-section" style={{ display: 'flex', justifyContent: 'center', height: '250px' }}>
            <div style={{ width: '250px' }}>
                <Pie data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
        </div>
      )}

      <div className="table-section">
        {loading ? <div style={{padding: "20px", textAlign: "center"}}>Đang tải...</div> : (
          <table className="bang-danh-sach" style={{width: "100%"}}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên Bài</th>
                <th>Bút Danh</th>
                <th>Tác Giả Gốc</th>
                <th>Ngày Đăng</th>
                <th className="text-right">Tiền Nhuận Bút</th>
                <th>Thanh Toán</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className="text-bold">{item.tenBai}</td>
                  <td>{item.butDanh}</td>
                  <td>{item.tacGia}</td>
                  <td>{new Date(item.ngayDang).toLocaleDateString("vi-VN")}</td>
                  <td className="text-right val-blue text-bold">{(item.tienNhuanbut || 0).toLocaleString()}đ</td>
                  <td>
                    <span style={{ 
                        padding: "4px 8px", 
                        borderRadius: "4px", 
                        fontSize: "12px", 
                        fontWeight: "bold",
                        backgroundColor: item.thanhToan === 'Y' ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: item.thanhToan === 'Y' ? "#10b981" : "#ef4444"
                    }}>
                        {item.thanhToan === 'Y' ? "Đã chi" : "Chưa chi"}
                    </span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan="7" style={{textAlign:"center", padding: "20px"}}>Không có bài viết nào trong tháng</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TabLanhDao;
