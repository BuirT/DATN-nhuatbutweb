# 📰 EDITORIAL DESK - HỆ THỐNG QUẢN LÝ NHUẬN BÚT TÒA SOẠN

Hệ thống **Editorial Desk** là một giải pháp quản lý toàn diện dành cho các tòa soạn báo, giúp số hóa quy trình từ khâu nhập liệu bài viết, tính toán nhuận bút, khấu trừ thuế TNCN đến khâu thanh toán và báo cáo thống kê tài chính.

*Lưu ý: Phiên bản Web này đã được đồng bộ 100% dữ liệu và luồng quy trình nghiệp vụ với phiên bản Desktop (Winform) truyền thống của Tòa soạn.*

---

## 🚀 Công Nghệ Sử Dụng

Dự án được xây dựng trên mô hình hiện đại, tập trung vào hiệu năng và trải nghiệm người dùng:

- **Frontend:** React.js (Vite), Chart.js (Biểu đồ trực quan), Axios, React-Toastify.
- **Backend:** Node.js, Express.js.
- **Database:** Microsoft SQL Server (dùng chung CSDL với bản Winform gốc).
- **Tiện ích tích hợp:** 
  - `xlsx`: Hỗ trợ xuất báo cáo thống kê ra file Excel.
  - `mssql`: Thư viện kết nối dữ liệu SQL Server bền vững.

---

## ✨ Tính Năng Cốt Lõi

### 1. Dashboard Thống Kê Đa Chiều (Real-time)

- Theo dõi tổng quy mô chi trả, công nợ tồn đọng và tổng thuế thu hộ.
- Phân tích dòng tiền chi trả theo hình thức: **Chuyển khoản (CK)** và **Tiền mặt (TM)**.
- Biểu đồ cột theo dõi nhuận bút chi cho mỗi kỳ báo.
- Biểu đồ tròn phân tích cơ cấu trạng thái hồ sơ.
- Biểu đồ theo dõi hoạt động nhuận bút theo khu vực địa lý.

### 2. Quy Trình Xét Duyệt 5 Bước Chuẩn Winform

Hệ thống quản lý trạng thái hồ sơ theo đúng nghiệp vụ 5 bước của báo chí:

- **Bước 1 (Thư ký):** Nhập bài mới và Chấm tiền (Trạng thái 0).
- **Bước 2 (Kế toán):** Xác nhận nhập liệu, kiểm tra số liệu (Trạng thái 1).
- **Bước 3 (Kiểm tra viên):** Soát xét chéo tính hợp lệ (Trạng thái 2).
- **Bước 4 (Tổng thư ký):** Ký duyệt số tiền nhuận bút cuối cùng (Trạng thái 3 -> 4).
- **Bước 5 (Kế toán & Lãnh đạo):** Lập Phiếu Chi tổng hợp theo tác giả, Lãnh đạo duyệt phiếu và Kế toán tiến hành chi trả tiền mặt/chuyển khoản.

### 3. Quản Lý Nhuận Bút & Thuế TNCN

- Tự động tính thuế TNCN dựa trên cấu hình linh hoạt (Mặc định >= 2.000.000đ sẽ tính thuế 10%).
- Tự động gom nhóm bài viết theo Tác giả để lập Phiếu chi tổng hợp.
- Tính năng báo sai sót (nhả bài viết về bước trước) khi phát hiện lỗi dữ liệu.

### 4. Quản Lý Tác Giả & Hệ Thống

- Quản lý danh sách Tác giả, Phóng viên, Cộng tác viên.
- Phân quyền người dùng chặt chẽ: Admin, Lãnh đạo, Tổng thư ký, Kế toán, Kiểm tra viên, Thư ký. Giao diện và thao tác được tự động ẩn hiện tùy theo quyền của người đăng nhập.

### 5. Công Cụ Hỗ Trợ Kế Toán

- Xuất báo cáo thống kê toàn cảnh tòa soạn ra file **Excel**.
- Lập Phiếu chi tự động.
- Tính năng **In bảng kê trình ký** chuẩn format văn phòng (ẩn các thành phần giao diện không cần thiết khi in).

---

## 🌓 Giao Diện (UI/UX)

- Thiết kế đồng bộ, hiện đại với hệ thống Biến CSS (CSS Variables) linh hoạt.
- Hỗ trợ chuyển đổi mượt mà giữa chế độ **Dark Mode** và **Light Mode**.
- Thiết kế Responsive, hiển thị tốt trên nhiều kích thước màn hình.

---

## 🛠 Hướng Dẫn Cài Đặt Khởi Chạy

### 1. Yêu cầu hệ thống

- Node.js đã được cài đặt.
- Có cài đặt SQL Server và đã phục hồi Database `DATNnhuanbut`.

### 2. Cài đặt và khởi chạy Backend

Mở terminal, di chuyển vào thư mục backend và chạy các lệnh sau:

```bash
cd backend
npm install
npm run dev
```

### 3. Cài đặt và khởi chạy Frontend

Mở một terminal khác, di chuyển vào thư mục frontend và chạy:

```bash
cd frontend
npm install
npm run dev
```
