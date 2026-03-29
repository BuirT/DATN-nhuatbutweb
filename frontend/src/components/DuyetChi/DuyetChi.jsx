import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import axios from "axios";
import "./DuyetChi.css";

function DuyetChi() {
  const [danhSachBaiViet, setDanhSachBaiViet] = useState([]);

  // Lấy danh sách bài viết (Vẫn giữ nguyên API của Nhuận Bút)
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

  // Hàm xử lý khi Lãnh đạo bấm nút "Duyệt"
  const handleDuyetBai = async (id) => {
    const xacNhan = window.confirm("Xác nhận duyệt chi trả cho bài viết này?");
    if (!xacNhan) return;

    try {
      // Đã đổi đường dẫn thành api/duyetchi/duyet-bai
      await axios.put(`http://localhost:5000/api/duyetchi/duyet-bai/${id}`, {
        trangThai: "Đã duyệt",
      });
      toast.success("Đã duyệt chi thành công! Tiền đã xuất kho 💸");
      layDuLieu(); // Cập nhật lại bảng
    } catch (error) {
      console.error("Lỗi khi duyệt:", error);
      toast.error("Có lỗi xảy ra, không thể duyệt bài!");
    }
  };

  return (
    <div className="duyetchi-container">
      <h2>Ban Lãnh Đạo Ký Duyệt</h2>
      <table className="bang-duyet">
        <thead>
          <tr>
            <th>Tên Bài</th>
            <th>Tác Giả</th>
            <th>Số Tiền</th>
            <th>Số Báo</th>
            <th>Trạng Thái</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {danhSachBaiViet.map((bai) => (
            <tr key={bai._id}>
              <td>
                <strong>{bai.tenBai}</strong>
              </td>
              <td>{bai.tacGia?.hoTen}</td>
              <td style={{ color: "red", fontWeight: "bold" }}>{bai.tienNhuanBut.toLocaleString("vi-VN")} đ</td>
              <td>{bai.soBao}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DuyetChi;
