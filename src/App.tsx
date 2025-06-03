import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import SurveyManagement from "./pages/SurveyManagement"; // Yeni eklenen sayfa
import Layout from "./components/Layout"; // Layout bileşenini import ediyoruz

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Layout ile sarılı rotalar (genellikle giriş sonrası sayfalar) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/survey-management" element={<SurveyManagement />} /> {/* Yeni rota */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;