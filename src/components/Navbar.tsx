// src/components/Navbar.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, Users, ClipboardList, BookOpen, ListTree, BarChart2, FileText, Building, GitFork, School, UserCog, Briefcase } from "lucide-react";
import isikUniversityLogo from "/i.u_logo-blue-en.png";
import { useAuthStore } from "../store/AuthStore";

const BG = "#f8f9fb";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { role, clearToken } = useAuthStore();

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  // SADECE STAFF bu linki görecek. ADMIN ve RECTOR kendi dashboardlarında analizlere sahip.
  const canViewSeparateAnalysisPage = role === "STAFF"; 
  const canManageSubmissions = role && ["ADMIN", "STAFF"].includes(role);

  const getDashboardLink = () => {
    if (role === "STUDENT") return "/student-dashboard";
    if (role === "DEAN") return "/dean-dashboard";
    if (role === "RECTOR") return "/rector-dashboard";
    return "/dashboard";
  };

  const getDashboardText = () => {
    if (role === "STUDENT") return "My Dashboard";
    if (role === "DEAN") return "Dean Dashboard";
    if (role === "RECTOR") return "Rector Dashboard";
    return "Dashboard";
  };

  const getDashboardIcon = () => {
    if (role === "STUDENT") return <School size={18} />;
    if (role === "DEAN") return <UserCog size={18} />;
    if (role === "RECTOR") return <Briefcase size={18} />;
    return <LayoutDashboard size={18} />;
  };


  return (
    <nav
      className="w-full px-8 py-2 flex items-center justify-between"
      style={{
        background: BG,
        borderBottom: `1.5px solid #e5eaf8`,
        boxShadow: "0 0.5px 0 #e5eaf8",
        minHeight: 56,
      }}
    >
      <Link to="/" className="flex items-center" tabIndex={-1}>
        <img
          src={isikUniversityLogo}
          alt="Işık University Logo"
          className="h-8 w-auto select-none"
          draggable={false}
        />
      </Link>

      <div className="flex space-x-5 items-center">
         {role && (
            <Link
            to={getDashboardLink()}
            className="text-[#18316e] hover:text-[#21409a] font-medium text-sm flex items-center gap-1 hover:underline underline-offset-2 transition"
            >
            {getDashboardIcon()} {getDashboardText()}
            </Link>
        )}
        {role === "ADMIN" && (
          <>
            <Link
              to="/user-management"
              className="text-[#18316e] hover:text-[#21409a] font-medium text-sm flex items-center gap-1 hover:underline underline-offset-2 transition"
            >
              <Users size={18} /> User Management
            </Link>
            <Link
              to="/course-management"
              className="text-[#18316e] hover:text-[#21409a] font-medium text-sm flex items-center gap-1 hover:underline underline-offset-2 transition"
            >
              <BookOpen size={18} /> Course Management
            </Link>
            <Link
              to="/faculty-management"
              className="text-[#18316e] hover:text-[#21409a] font-medium text-sm flex items-center gap-1 hover:underline underline-offset-2 transition"
            >
              <Building size={18} /> Faculty Management
            </Link>
            <Link
              to="/department-management"
              className="text-[#18316e] hover:text-[#21409a] font-medium text-sm flex items-center gap-1 hover:underline underline-offset-2 transition"
            >
              <GitFork size={18} /> Department Management
            </Link>
          </>
        )}
        {role === "STAFF" && (
          <>
            <Link
              to="/survey-management"
              className="text-[#18316e] hover:text-[#21409a] font-medium text-sm flex items-center gap-1 hover:underline underline-offset-2 transition"
            >
              <ClipboardList size={18} /> Survey Management
            </Link>
            <Link
              to="/yokak-criterion-management"
              className="text-[#18316e] hover:text-[#21409a] font-medium text-sm flex items-center gap-1 hover:underline underline-offset-2 transition"
            >
              <ListTree size={18} /> YÖKAK Criteria
            </Link>
            <Link
              to="/data-upload"
              className="text-[#18316e] hover:text-[#21409a] font-medium text-sm flex items-center gap-1 hover:underline underline-offset-2 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              Data Upload
            </Link>
          </>
        )}
        {canViewSeparateAnalysisPage && ( // canViewGeneralAnalysis yerine canViewSeparateAnalysisPage kullanıldı
          <Link
            to="/analysis"
            className="text-[#18316e] hover:text-[#21409a] font-medium text-sm flex items-center gap-1 hover:underline underline-offset-2 transition"
          >
            <BarChart2 size={18} /> Analysis
          </Link>
        )}
        {canManageSubmissions && (
          <Link
            to="/survey-submissions"
            className="text-[#18316e] hover:text-[#21409a] font-medium text-sm flex items-center gap-1 hover:underline underline-offset-2 transition"
          >
            <FileText size={18} /> Submissions
          </Link>
        )}
      </div>

      <div>
        {role ? (
          <button
            onClick={handleLogout}
            className="px-4 py-1 rounded-md font-semibold text-xs bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 transition"
            style={{
              letterSpacing: ".02em",
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="px-4 py-1 rounded-md font-semibold text-xs bg-[#21409a] hover:bg-[#18316e] text-white transition"
            style={{
              letterSpacing: ".02em",
            }}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;