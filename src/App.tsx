// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import SurveyManagement from "./pages/SurveyManagement";
import DataUploadPage from "./pages/DataUploadPage";
// New: Import the new management pages
import FacultyManagementPage from "./pages/FacultyManagementPage";
import DepartmentManagementPage from "./pages/DepartmentManagementPage";
import Layout from "./components/Layout"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes without a shared layout */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Routes wrapped with Layout (typically for authenticated users) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/survey-management" element={<SurveyManagement />} />
          <Route path="/data-upload" element={<DataUploadPage />} />
          {/* New: Routes for Faculty and Department Management */}
          <Route path="/faculty-management" element={<FacultyManagementPage />} />
          <Route path="/department-management" element={<DepartmentManagementPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;