const mongoose = require("mongoose");

const taiKhoanSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  hoTen: { type: String, required: true },
  vaiTro: { type: String, required: true, default: "Nhập Liệu" }
}, { timestamps: true });

// Thanh đã thêm tham số thứ 3 ("DanhSachTaiKhoan") để ép MongoDB tạo một bảng hoàn toàn mới, sạch sẽ 100%!
module.exports = mongoose.model("TaiKhoan", taiKhoanSchema, "DanhSachTaiKhoan");