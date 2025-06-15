import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, Users, ClipboardList, BookOpen, ListTree, BarChart2, FileText, Building, GitFork } from "lucide-react";
import isikUniversityLogo from "/i.u_logo-blue-en.png";
import { useAuthStore } from "../store/AuthStore"; // FIX: Added useAuthStore import

const BG = "#f8f9fb";
// const PRIMARY = "#21409a"; // REMOVED: No longer used, removed to clear 'never read' warning

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { role, clearToken } = useAuthStore();

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  const canViewAnalysis = role && ["ADMIN", "RECTOR", "DEAN", "STAFF"].includes(role);
  const canManageSubmissions = role && ["ADMIN", "STAFF"].includes(role);

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
      {/* Logo */}
      <Link to="/" className="flex items-center" tabIndex={-1}>
        <img
          src={isikUniversityLogo}
          alt="Işık University Logo"
          className="h-8 w-auto select-none"
          draggable={false}
        />
      </Link>

      {/* Nav Links */}
      <div className="flex space-x-5 items-center">
        <Link
          to="/dashboard"
          className="text-[#18316e] hover:text-[#21409a] font-medium text-sm flex items-center gap-1 hover:underline underline-offset-2 transition"
        >
          <LayoutDashboard size={18} /> Dashboard
        </Link>
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
        {canViewAnalysis && (
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

      {/* Session Management */}
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