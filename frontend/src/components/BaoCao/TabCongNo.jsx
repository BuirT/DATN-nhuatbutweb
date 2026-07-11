import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";

ChartJS.register(Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function TabCongNo() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCongNo = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/thongke/cong-no");
      setData(res.data);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu công nợ!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCongNo();
  }, []);

  const handleExport = () => {
    if (data.length === 0) return toast.warning("Không có dữ liệu!");
    const wsData = data.map((item, index) => ({
      STT: index + 1,
      "Tác Giả": item.tenTacGia,
      "Tổng Tiền Nhuận Bút": item.tongNo,
      "Đã Thanh Toán": item.daTra,
      "Còn Nợ": item.conNo
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CongNo");
    XLSX.writeFile(wb, `BaoCao_CongNo_${new Date().getTime()}.xlsx`);
  };

  const tongNo = data.reduce((sum, item) => sum + (item.tongNo || 0), 0);
  const tongTra = data.reduce((sum, item) => sum + (item.daTra || 0), 0);
  const tongConNo = data.reduce((sum, item) => sum + (item.conNo || 0), 0);

  // Lấy Top 10 người nợ nhiều nhất để vẽ biểu đồ
  const topData = [...data].sort((a, b) => b.conNo - a.conNo).slice(0, 10);
  
  const chartData = {
    labels: topData.map(d => d.tenTacGia),
    datasets: [
      {
        label: "Đã Trả",
        data: topData.map(d => d.daTra),
        backgroundColor: "#10b981",
      },
      {
        label: "Còn Nợ",
        data: topData.map(d => d.conNo),
        backgroundColor: "#ef4444",
      }
    ]
  };

  return (
    <div className="tab-content">
      <div className="filter-bar">
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0 }}>Báo Cáo Công Nợ Tác Giả</h3>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>Đối chiếu tiền chưa thanh toán</p>
        </div>
        <button className="btn-fetch" onClick={fetchCongNo}>🔄 Cập nhật</button>
        <button className="btn-export" onClick={handleExport}>🖨 Xuất Excel</button>
      </div>

      <div className="summary-cards">
        <div className="card">
            <div className="card-title">Tổng Nhuận Bút</div>
            <div className="card-value val-blue">{tongNo.toLocaleString()}đ</div>
        </div>
        <div className="card">
            <div className="card-title">Đã Thanh Toán</div>
            <div className="card-value val-green">{tongTra.toLocaleString()}đ</div>
        </div>
        <div className="card">
            <div className="card-title">Còn Nợ (Cần Chi)</div>
            <div className="card-value val-red">{tongConNo.toLocaleString()}đ</div>
        </div>
      </div>

      {data.length > 0 && (
        <div className="chart-section">
            <Bar 
                data={chartData} 
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Top 10 Tác giả còn nợ cao nhất' } },
                    scales: { x: { stacked: true }, y: { stacked: true } }
                }} 
            />
        </div>
      )}

      <div className="table-section">
        {loading ? <div style={{padding: "20px", textAlign: "center"}}>Đang tải...</div> : (
          <table className="bang-danh-sach" style={{width: "100%"}}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tác Giả</th>
                <th className="text-right">Tổng Nhuận Bút (Gốc)</th>
                <th className="text-right">Đã Thanh Toán</th>
                <th className="text-right">CÒN NỢ</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className="text-bold">{item.tenTacGia}</td>
                  <td className="text-right val-blue text-bold">{item.tongNo.toLocaleString()}đ</td>
                  <td className="text-right val-green text-bold">{item.daTra.toLocaleString()}đ</td>
                  <td className="text-right val-red text-bold">{item.conNo.toLocaleString()}đ</td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan="5" style={{textAlign:"center", padding: "20px"}}>Chưa có dữ liệu</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TabCongNo;
