// src/App.tsx (UPDATED)
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import SurveyManagement from "./pages/SurveyManagement";
import YokakCriterionManagement from "./pages/YokakCriterionManagement"; // NEW Import
import CourseManagement from "./pages/CourseManagement"; // NEW Import
import DataUpload from "./pages/DataUpload"; // NEW Import
import Layout from "./components/Layout";

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
          <Route path="/survey-management" element={<SurveyManagement />} />
          <Route path="/yokak-criterion-management" element={<YokakCriterionManagement />} /> {/* NEW Route */}
          <Route path="/course-management" element={<CourseManagement />} /> {/* NEW Route */}
          <Route path="/data-upload" element={<DataUpload />} /> {/* NEW Route */}
          {/* Diğer yetkilendirilmiş sayfalar buraya eklenecek */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;