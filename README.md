# 📰 HỆ THỐNG QUẢN LÝ NHUẬN BÚT TÒA SOẠN BÁO

Luôn luôn đọc README.md để tạo thói quen theo dõi tiến độ.
Đọc README.md để cập nhật thêm kiến thức bổ ích.
Đọc README.md để hiểu đồ án đang viết cái gì và làm tới đâu.
Có đọc thì có viết.
Viết README.md để người khác biết mình cần thông báo cái gì, những thứ gì cần chú ý.
Viết README.md để người khác biết đồ án có cái gì.

---

Mỗi lần code xong, dùng 3 lệnh này để lưu code lại và chia sẻ cho nhóm.
`git add .`
`git commit -m "lời nhắn của bạn"`
`git push origin <tên-nhánh>`

Muốn cập nhật code mới nhất thì nhập lệnh: `git pull origin main`

---

Hệ thống web ứng dụng quản lý quy trình chấm và chi trả nhuận bút cho các phóng viên, cộng tác viên tại Tòa soạn báo. Đồ án được xây dựng với kiến trúc MERN Stack hiện đại, phân quyền rõ ràng giữa Lãnh đạo và Thư ký.

## 🚀 Các Tính Năng Nổi Bật

- **🔐 Xác thực & Phân quyền:** Đăng nhập bảo mật bằng JWT, phân chia quyền hạn nghiêm ngặt (Lãnh đạo được duyệt chi, Thư ký chỉ được nhập liệu).
- **👥 Quản lý Tác giả/Phóng viên:** Thêm, sửa, xóa thông tin chi tiết của người viết bài.
- **📝 Quản lý Nhuận bút:** Ghi nhận bài viết, tính toán số tiền nhuận bút cho từng đầu báo.
- **✅ Lãnh đạo Ký duyệt:** Giao diện duyệt chi nhanh chóng chỉ với một thao tác click.
- **📊 Báo cáo Thống kê:** \* Biểu đồ trực quan (Recharts) phân tích chi phí theo từng tháng/năm.
  - Tính năng xuất báo cáo tự động ra file **Excel** nộp cho kế toán.

## 🛠️ Công Nghệ Sử Dụng (MERN Stack)

- **Frontend:** React.js, React Router, Axios, Recharts (Biểu đồ), XLSX (Xuất Excel).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB & Mongoose.
- **Bảo mật:** Bcrypt.js (Mã hóa mật khẩu), JSON Web Token (JWT).

## ⚙️ Hướng Dẫn Cài Đặt & Chạy Dự Án

Để chạy hệ thống trên máy tính cá nhân, vui lòng thực hiện các bước sau:

### Bước 1: Khởi động Backend (Máy chủ & CSDL)

1. Mở Terminal và di chuyển vào thư mục backend: `cd backend`
2. Cài đặt các thư viện cần thiết: `npm install`
3. Khởi động server: `node server.js`
   _(Máy chủ sẽ chạy tại địa chỉ http://localhost:5000)_

### Bước 2: Khởi động Frontend (Giao diện người dùng)

1. Mở một Terminal mới và di chuyển vào thư mục frontend: `cd frontend`
2. Cài đặt các thư viện React: `npm install`
3. Chạy giao diện web: `npm run dev`
   _(Trình duyệt sẽ tự động mở tại http://localhost:5173)_

# Cách mời bạn bè vào chung kho code

Để bạn anh có quyền đẩy code lên, anh cần mời họ vào dự án:
Mở trang kho code <tên-dự-án> của anh trên GitHub.
Bấm vào tab Settings (Cài đặt) có hình bánh răng.
Ở menu bên trái, chọn Collaborators.
Bấm nút xanh Add people và nhập tên tài khoản GitHub (hoặc email) của các đồng chí kia vào.
Bảo các bạn ấy mở email ra bấm Accept Invitation (Chấp nhận lời mời) là xong.

# Cách đồng đội lấy code về bắt đầu làm

Sau khi vào nhóm, các bạn của anh sẽ mở Terminal trên máy họ và gõ:
git clone https://github.com/BuirT/DATN-nhuatbutweb.git (Tải code về máy).
cd <tên-dự-án> (Đi vào thư mục dự án).
Bước cực kỳ quan trọng: Vì anh đã giấu các thư viện nặng ở file .gitignore, nên các bạn ấy phải tự cài lại thư viện trên máy họ bằng cách:
Vào thư mục backend gõ: `npm install`
Vào thư mục frontend gõ: `npm install`

# Cách tách code an toàn cho Branch

Thay vì code thẳng lên nhánh main, mỗi người khi làm một chức năng mới sẽ tự tạo ra một nhánh riêng (giống như copy ra một bản nháp).
Quy trình cho các đồng chí trong nhóm sẽ như sau:
Tạo nhánh nháp: Trước khi code, mhở Terminal gõ lệnh tạo nhánh mới (ví dụ Văn Hải) nhập lệnh: `git checkout -b nhanh-van-hai`
Code bình thường: Gõ code, sửa file thoải mái trên nhánh này. Nó sẽ không ảnh hưởng gì đến main.
Lưu và đẩy nhánh nháp lên GitHub thì nhập lệnh trong terminal:
`git add .`
`git commit -m "Lời nhắn"`
`git push origin nhanh-van-hai`

---

Trưởng nhóm duyệt code bằng Pull Request (PR).
Khi bạn anh đẩy cái nhanh-van-hai lên, trên GitHub của anh sẽ hiện ra một thông báo màu xanh lá hỏi là có muốn Compare & pull request (So sánh và gộp code) không.
Đồng chí kia sẽ tạo một Pull Request (Đơn xin gộp code vào main).
Trưởng nhóm (với tư cách là Leader) sẽ vào GitHub xem cái Pull Request đó. Anh có thể xem chi tiết bạn đó đã viết thêm dòng code nào, xóa dòng nào.
Nếu anh thấy bạn code không phù hợp, bị lỗi, anh cứ để lại Comment (Bình luận) bảo bạn sửa.
Nếu code ngon lành, chạy tốt, trưởng nhóm mới tự tay bấm nút Merge pull request màu xanh lá. Lúc này code mới chính thức được trộn vào nhánh main.

---

Thiết lập "Khiên bảo vệ" cấm đẩy code thẳng vào Main.
Để chắc chắn không ai (kể cả anh lỡ tay) gõ lệnh git push origin main, anh bật khiên bảo vệ lên:
Vào Settings trên GitHub của dự án.
Chọn mục Branches ở menu bên trái.
Bấm nút Add branch protection rule.
Ở ô Branch name pattern, anh gõ chữ main.
Tích vào ô Require a pull request before merging (Bắt buộc phải tạo đơn xin gộp code).
Tích luôn ô Require approvals (Bắt buộc phải có người duyệt - là trưởng nhóm).
Kéo xuống cuối bấm Create.
