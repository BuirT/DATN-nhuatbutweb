import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TacGia from "./components/TacGia/TacGia";
import NhuanBut from "./components/NhuanBut/NhuanBut";
import "./App.css"; // Gọi file CSS trang trí Menu

function App() {
  return (
    <Router>
      <div>
        {/* --- THANH MENU ĐIỀU HƯỚNG --- */}
        <nav className="navbar">
          <h1 className="logo">TÒA SOẠN BÁO</h1>
          <ul className="nav-links">
            {/* Thẻ Link này giống thẻ <a> trong HTML nhưng xịn hơn, nó không làm tải lại trang */}
            <li>
              <Link to="/">Quản lý Tác Giả</Link>
            </li>
            <li>
              <Link to="/nhuan-but">Quản lý Nhuận Bút</Link>
            </li>
          </ul>
        </nav>

        {/* --- KHU VỰC HIỂN THỊ NỘI DUNG TƯƠNG ỨNG VỚI MENU --- */}
        <div className="main-content">
          <Routes>
            {/* Khi đường dẫn là "/" thì hiện trang Tác Giả */}
            <Route path="/" element={<TacGia />} />

            {/* Khi đường dẫn là "/nhuan-but" thì hiện trang Nhuận Bút */}
            <Route path="/nhuan-but" element={<NhuanBut />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
