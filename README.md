# DATN-nhuatbutweb

Luôn luôn đọc README.md để tạo thói quen theo dõi tiến độ.
Đọc README.md để cập nhật thêm kiến thức bổ ích.
Đọc README.md để hiểu đồ án đang viết cái gì và làm tới đâu.
Có đọc thì có viết.
Viết README.md để người khác biết mình cần thông báo cái gì, những thứ gì cần chú ý.
Viết README.md để người khác biết đồ án có cái gì.

---

Mỗi lần code xong một tính năng, cứ dùng 3 lệnh này để lưu code lại và chia sẻ cho nhóm.
"git add ."
"git commit -m "lời nhắn của bạn" "
"git push origin main"

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
Vào thư mục backend gõ: npm install.
Vào thư mục frontend gõ: npm install.

# Cách tách code an toàn cho Branch

Thay vì code thẳng lên nhánh main, mỗi người khi làm một chức năng mới sẽ tự tạo ra một nhánh riêng (giống như copy ra một bản nháp).
Quy trình cho các đồng chí trong nhóm sẽ như sau:
Tạo nhánh nháp: Trước khi code, mhở Terminal gõ lệnh tạo nhánh mới (ví dụ Văn Hải) nhập lệnh: git checkout -b nhanh-van-hai.
Code bình thường: Gõ code, sửa file thoải mái trên nhánh này. Nó sẽ không ảnh hưởng gì đến main.
Lưu và đẩy nhánh nháp lên GitHub thì nhập lệnh trong terminal:
"git add ."
"git commit -m "Lời nhắn" "
"git push origin nhanh-van-hai"

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
