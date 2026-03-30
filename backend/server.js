const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// ==========================================================
// 1. CẤU HÌNH ĐƯỜNG LINK KẾT NỐI (HÀN CHẾT ĐỂ TRÁNH LỖI)
// ==========================================================
const MONGO_URI="mongodb://BuirT:2412BuirT@ac-230zzdo-shard-00-00.zznc5o0.mongodb.net:27017,ac-230zzdo-shard-00-01.zznc5o0.mongodb.net:27017,ac-230zzdo-shard-00-02.zznc5o0.mongodb.net:27017/?ssl=true&replicaSet=atlas-jmm3op-shard-0&authSource=admin&appName=Cluster0"

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================================
// 2. KẾT NỐI DATABASE
// ==========================================================
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Đã kết nối MongoDB Atlas thành công!"))
  .catch((err) => {
      console.log("❌ Lỗi kết nối rồi anh ơi! Kiểm tra lại link hoặc mạng nhé.");
      console.error(err);
  });

// ==========================================================
// 3. ĐĂNG KÝ CÁC ROUTE (API)
// ==========================================================
// Lưu ý: Đảm bảo các file trong thư mục routes đã được export đúng kiểu CommonJS (module.exports)
const tacGiaRoute = require("./routes/tacGiaRoute");
const nhuanButRoute = require("./routes/nhuanButRoute");
const duyetChiRoute = require("./routes/duyetChiRoute");
const thongKeRoute = require("./routes/thongKeRoute");
const authRoute = require("./routes/authRoute");
const soBaoRoute = require("./routes/soBaoRoute");
const phieuChiRoute = require('./routes/phieuChiRoute');

app.use("/api/tacgia", tacGiaRoute);
app.use("/api/nhuanbut", nhuanButRoute);
app.use("/api/duyetchi", duyetChiRoute);
app.use("/api/thongke", thongKeRoute);
app.use("/api/sobao", soBaoRoute);
app.use("/api/phieuchi", phieuChiRoute);
app.use("/api/users", require("./routes/userRoute"));
app.use("/api/auth", require("./routes/authRoute"));

// Thêm route kiểm tra nhanh cho đồng chí
app.get("/", (req, res) => {
    res.send("🚀 Server Đồ Án Nhuận Bút đang hoạt động xanh mượt!");
});

// ==========================================================
// 4. KHỞI CHẠY SERVER
// ==========================================================
const PORT = process.env.PORT || 3000; // Ưu tiên cổng 3000 cho đồng bộ với Frontend
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy cực bốc tại: http://localhost:${PORT}`);
});