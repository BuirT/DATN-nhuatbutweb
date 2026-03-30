import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    taiKhoan: "",
    matKhau: "",
    hoTen: "",
    vaiTro: "Thư ký", // Chỉnh mặc định là Thư ký cho an toàn
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        // --- LUỒNG ĐĂNG KÝ ---
        await axios.post("http://localhost:5000/api/users/them", {
          username: formData.taiKhoan, 
          password: formData.matKhau,
          hoTen: formData.hoTen,
          vaiTro: formData.vaiTro
        });

        toast.success("Hệ thống đã ghi nhận. Vui lòng đăng nhập để tiếp tục!", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });

        setIsRegister(false); 
      } else {
        // --- LUỒNG ĐĂNG NHẬP ---
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          username: formData.taiKhoan, 
          password: formData.matKhau   
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("hoTen", res.data.hoTen);
        localStorage.setItem("vaiTro", res.data.vaiTro);

        toast.success(`Hệ thống xin chào ${res.data.vaiTro} ${res.data.hoTen}!`, {
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
        });

        setTimeout(() => {
          onLogin();
        }, 1000);
      }
    } catch (error) {
      // Đã nâng cấp: In lỗi chi tiết ra màn hình đen (Console F12) để dễ bắt bệnh
      console.error("🚨 Báo cáo lỗi từ Backend:", error.response?.data || error.message);
      
      toast.error(error.response?.data?.message || "Lỗi Server: Không thể kết nối với dữ liệu!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <div className="login-container">
      <ToastContainer />

      <div className="login-box">
        <h2>{isRegister ? "📝 TẠO TÀI KHOẢN" : "🔐 ĐĂNG NHẬP"}</h2>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <input type="text" name="hoTen" placeholder="Nhập họ và tên đầy đủ" value={formData.hoTen} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <select name="vaiTro" value={formData.vaiTro} onChange={handleChange}>
                  <option value="Thư ký">Thư ký / Nhập liệu</option>
                  <option value="Kế Toán">Kế Toán</option>
                  <option value="Lãnh đạo">Lãnh đạo (Duyệt chi)</option>
                  <option value="Admin">Admin (Quản Trị)</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <input type="text" name="taiKhoan" placeholder="Tên đăng nhập" value={formData.taiKhoan} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <input type="password" name="matKhau" placeholder="Mật khẩu" value={formData.matKhau} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn-login">
            {isRegister ? "Đăng Ký" : "Đăng Nhập"}
          </button>
        </form>

        <p className="toggle-text">
          {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}
          <span onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? " Đăng nhập ngay" : " Tạo tài khoản"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;