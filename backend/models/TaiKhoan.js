const mongoose = require("mongoose");

const taiKhoanSchema = new mongoose.Schema(
  {
    taiKhoan: { type: String, required: true, unique: true }, // Tên đăng nhập không được trùng
    matKhau: { type: String, required: true }, // Mật khẩu (sẽ được mã hóa)
    hoTen: { type: String, required: true }, // Tên người dùng (VD: Nguyễn Văn A)
    vaiTro: { type: String, default: "Thư ký" }, // Phân quyền
  },
  { timestamps: true },
);

module.exports = mongoose.model("TaiKhoan", taiKhoanSchema);
