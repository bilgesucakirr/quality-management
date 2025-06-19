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
import FacultyManagementPage from "./pages/FacultyManagementPage";
import DepartmentManagementPage from "./pages/DepartmentManagementPage";
import GraphicalAnalysisPage from "./pages/GraphicalAnalysisPage"; 
import Layout from "./components/Layout";
import StudentDashboard from "./pages/StudentDashboard";
import DeanDashboard from "./pages/DeanDashboard";
import RectorDashboard from "./pages/RectorDashboard"; 
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/survey-management" element={<SurveyManagement />} />
          <Route path="/yokak-criterion-management" element={<YokakCriterionManagement />} />
          <Route path="/course-management" element={<CourseManagement />} />
          <Route path="/data-upload" element={<DataUpload />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/graphical-analysis" element={<GraphicalAnalysisPage />} /> 
          <Route path="/survey-submissions" element={<SurveySubmissionManagement />} />
          <Route path="/faculty-management" element={<FacultyManagementPage />} />
          <Route path="/department-management" element={<DepartmentManagementPage />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/dean-dashboard" element={<DeanDashboard />} />
          <Route path="/rector-dashboard" element={<RectorDashboard />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;