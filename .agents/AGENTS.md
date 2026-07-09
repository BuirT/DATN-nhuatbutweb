# QUY TRÌNH HỆ THỐNG VÀ CƠ SỞ DỮ LIỆU ĐỒ ÁN NHUẬN BÚT

Tài liệu này dùng để các AI Agent ghi nhớ luật lệ và quy trình nghiệp vụ (Workflow) của hệ thống Quản lý Nhuận Bút (đã được đồng bộ với Winform). Mọi nâng cấp và tính năng mới bắt buộc phải tuân theo luồng quy trình này.

## 1. QUY TRÌNH DUYỆT BÀI 5 BƯỚC (BẢNG `Nhuanbut`)

Cột `TrangThaiDuyet` (kiểu INT) được dùng làm xương sống cho toàn bộ quy trình:

- **Bước 0 (Chờ chấm tiền):** `TrangThaiDuyet = 0`
  - Người thực hiện: Thư ký.
  - Hành động: Nhập bài mới, sau đó nhập số tiền nhuận bút cho bài viết.
  - Cập nhật khi xong: `TrangThaiDuyet = 1`, lưu `NguoiChamTien`, `NgayChamTien`.

- **Bước 1 (Xác nhận nhập liệu):** `TrangThaiDuyet = 1`
  - Người thực hiện: Kế toán.
  - Hành động: Kế toán kiểm tra xem Thư ký nhập tiền đúng chưa. Có thể xác nhận đi tiếp, hoặc trả lại bằng cách "Báo sai sót" (cập nhật `LyDoBaoSai` và trả về `0`).
  - Cập nhật khi xong: `TrangThaiDuyet = 2`, lưu `NguoiKeToan`, `NgayNhapLieu`.

- **Bước 2 (Kiểm tra chéo):** `TrangThaiDuyet = 2`
  - Người thực hiện: Kiểm tra viên.
  - Hành động: Soát xét lại các thông tin. Có thể trả về cho Kế toán soát lại (trả về `2` ? Thực tế trong logic trả về `2` hoặc `1`).
  - Cập nhật khi xong: `TrangThaiDuyet = 3`, lưu `NguoiKiemTra`, `NgayKiemTra`.

- **Bước 3 (Ký duyệt):** `TrangThaiDuyet = 3`
  - Người thực hiện: Tổng thư ký.
  - Hành động: Quyết định cuối cùng để thông qua số tiền nhuận bút của bài viết.
  - Cập nhật khi xong: `TrangThaiDuyet = 4`, lưu `TongThuKy`, `NgayKy`.

- **Bước 4 (Chờ thanh toán):** `TrangThaiDuyet = 4`
  - Trạng thái bài viết đã chốt, chờ Kế toán lập `Phieuchi`. Không cho phép chỉnh sửa hay xóa bài ở bước này trừ khi Lãnh đạo hủy phiếu chi liên quan.

## 2. QUY TRÌNH DUYỆT CHI & THANH TOÁN (BẢNG `Phieuchi` & `NhuanbutCT`)

Bài viết sau khi ở trạng thái `4` sẽ được gom theo từng Tác giả để tạo 1 Phiếu Chi.

- **Lập Phiếu Chi (Kế toán):**
  - Điều kiện: Các bài viết của Tác giả có `TrangThaiDuyet = 4` VÀ KHÔNG tồn tại trong bảng `NhuanbutCT`.
  - Hành động: Kế toán tạo `Phieuchi` với trạng thái `TrangThaiDuyet = 0` (Chờ Lãnh đạo duyệt).
  - Hành động kèm theo: Các bài viết liên quan được INSERT vào bảng `NhuanbutCT` (lưu mã tác giả, mã bài viết, số phiếu `SoPC`).

- **Duyệt Phiếu Chi (Lãnh đạo):**
  - Điều kiện: Phiếu chi có `TrangThaiDuyet = 0`.
  - Hành động Duyệt: Cập nhật phiếu lên `TrangThaiDuyet = 1`, lưu `NguoiDuyet`.
  - Hành động Từ chối: Cập nhật phiếu thành `-1`, nhập lý do, đồng thời **XÓA các bản ghi liên quan trong bảng `NhuanbutCT`** (nhả bài viết ra) để kế toán lập lại phiếu. Các bài trong `Nhuanbut` sẽ được đưa về `TrangThaiDuyet = 0` hoặc để nguyên `4` tùy nghiệp vụ.

- **Thanh Toán (Kế toán):**
  - Điều kiện: Phiếu chi có `TrangThaiDuyet = 1` và `Dathutien = 'N'`.
  - Hành động: Đánh dấu đã chi tiền. Cập nhật `Phieuchi.Dathutien = 'Y'`, `NhuanbutCT.SauThanhToan = 'Y'`, `Nhuanbut.DaThanhToan = 1`, `Nhuanbut.TrangThai = 'Đã thanh toán'`, `Nhuanbut.TrangThaiDuyet = 5`.

## 3. LƯU Ý KHI NÂNG CẤP VÀ FIX BUG

1. **Khớp nối Winform:** Mọi thao tác ghi dữ liệu từ Web (Node.js/React) phải giữ nguyên tên Cột, kiểu dữ liệu và Cấu trúc quan hệ giống hệt với Winform (C#/SQL Server).
2. **Quyền hạn (Vai trò):** Hệ thống phân quyền dựa trên `vaiTro` (Admin, Thư ký, Kế toán, Kiểm tra viên, Tổng thư ký, Lãnh đạo). Giao diện (UI) và API bắt buộc phải kiểm tra quyền hạn chặt chẽ.
3. **Logic Thuế TNCN:** Bất cứ khi nào cập nhật tiền nhuận bút, luôn kiểm tra mức cấu hình thuế hiện hành (`gThongso` - Mặc định >= 2.000.000 VNĐ sẽ tính thuế 10%).

> AI Agent: Please read this file carefully before implementing any new feature related to Nhuanbut or Phieuchi to ensure consistency between Web and Winform platforms.
