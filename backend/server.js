const express = require("express");

const cors = require("cors");
require("dotenv").config();

// ==========================================================
// 2. KẾT NỐI DATABASE
const { poolPromise } = require("./config/db");
// poolPromise is initiated here, and it will connect automatically.

const app = express();
app.use(cors());
app.use(express.json());

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
app.use("/api/cauhinh", require("./routes/cauHinhRoute"));
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy cực bốc tại: http://localhost:${PORT}`);
});