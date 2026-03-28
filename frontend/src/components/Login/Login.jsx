import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; // Import bộ thông báo mới
import "react-toastify/dist/ReactToastify.css"; // Import CSS để nó đẹp sẵn
import "./Login.css";

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    taiKhoan: "",
    matKhau: "",
    hoTen: "",
    vaiTro: "Lãnh đạo",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await axios.post("http://localhost:5000/api/auth/dang-ky", formData);

        // --- THÔNG BÁO TẠO TÀI KHOẢN (Trượt góc màn hình) ---
        toast.success("Hệ thống đã ghi nhận. Vui lòng đăng nhập để tiếp tục!", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });

        setIsRegister(false);
      } else {
        const res = await axios.post("http://localhost:5000/api/auth/dang-nhap", {
          taiKhoan: formData.taiKhoan,
          matKhau: formData.matKhau,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("hoTen", res.data.user.hoTen);
        localStorage.setItem("vaiTro", res.data.user.vaiTro);

        // --- THÔNG BÁO ĐĂNG NHẬP THÀNH CÔNG ---
        toast.success(`Hệ thống xin chào ${res.data.user.vaiTro} ${res.data.user.hoTen}!`, {
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
        });

        // Đợi 2 giây cho thông báo chạy xong rồi mới chuyển trang cho mượt
        setTimeout(() => {
          onLogin();
        }, 1000);
      }
    } catch (error) {
      // --- THÔNG BÁO LỖI HIỆN MÀU ĐỎ ---
      toast.error(error.response?.data?.message || "Thông tin không chính xác, vui lòng thử lại!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <div className="login-container">
      {/* Cái này là điểm neo để hộp thông báo biết chỗ mà trượt ra */}
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
                  <option value="Lãnh đạo">Lãnh đạo (Duyệt chi)</option>
                  <option value="Thư ký">Thư ký (Nhập liệu)</option>
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
          <span onClick={() => setIsRegister(!isRegister)}>{isRegister ? "Đăng nhập ngay" : "Tạo tài khoản"}</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
