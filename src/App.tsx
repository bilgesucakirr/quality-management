// src/App.tsx (UPDATED)
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import SurveyManagement from "./pages/SurveyManagement";
import YokakCriterionManagement from "./pages/YokakCriterionManagement";
import CourseManagement from "./pages/CourseManagement";
import DataUpload from "./pages/DataUpload";
import AnalysisPage from "./pages/AnalysisPage";
import SurveySubmissionManagement from "./pages/SurveySubmissionManagement";
// FIX: Re-added imports for Faculty and Department Management pages
import FacultyManagementPage from "./pages/FacultyManagementPage"; 
import DepartmentManagementPage from "./pages/DepartmentManagementPage";
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
          <Route path="/yokak-criterion-management" element={<YokakCriterionManagement />} />
          <Route path="/course-management" element={<CourseManagement />} />
          <Route path="/data-upload" element={<DataUpload />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/survey-submissions" element={<SurveySubmissionManagement />} />
          {/* FIX: Re-added routes for Faculty and Department Management pages */}
          <Route path="/faculty-management" element={<FacultyManagementPage />} />
          <Route path="/department-management" element={<DepartmentManagementPage />} />
          {/* Diğer yetkilendirilmiş sayfalar buraya eklenecek */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;