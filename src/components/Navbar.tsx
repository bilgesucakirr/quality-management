// src/components/Navbar.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/AuthStore';
import { LogOut, LayoutDashboard, Users, ClipboardList, BookOpen, ListTree } from 'lucide-react';

const BLUE = "#05058c";

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const { role, clearToken } = useAuthStore();

    const handleLogout = () => {
        clearToken();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md p-4 flex justify-between items-center" style={{ borderBottom: `2px solid ${BLUE}` }}>
            {/* Left: Logo/Title */}
            <div className="flex items-center">
                <Link to="/" className="text-xl font-bold" style={{ color: BLUE }}>
                    UQMS
                </Link>
            </div>

            {/* Middle: Navigation Links */}
            <div className="flex space-x-6">
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-700 font-medium flex items-center gap-1">
                    <LayoutDashboard size={18} /> Dashboard
                </Link>

                {/* ADMIN specific links */}
                {role === "ADMIN" && (
                    <>
                        <Link to="/user-management" className="text-gray-700 hover:text-blue-700 font-medium flex items-center gap-1">
                            <Users size={18} /> User Management
                        </Link>
                        <Link to="/course-management" className="text-gray-700 hover:text-blue-700 font-medium flex items-center gap-1">
                            <BookOpen size={18} /> Course Management
                        </Link>
                        {/* Add Faculty/Department Management links here if needed for Admin */}
                    </>
                )}

                {/* STAFF specific links (and Data Upload which might be shared) */}
                {role === "STAFF" && ( // Changed from (role === "ADMIN" || role === "STAFF")
                    <>
                        <Link to="/survey-management" className="text-gray-700 hover:text-blue-700 font-medium flex items-center gap-1">
                            <ClipboardList size={18} /> Survey Management
                        </Link>
                        <Link to="/yokak-criterion-management" className="text-gray-700 hover:text-blue-700 font-medium flex items-center gap-1">
                            <ListTree size={18} /> YÖKAK Criteria
                        </Link>
                        <Link to="/data-upload" className="text-gray-700 hover:text-blue-700 font-medium flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                            Data Upload
                        </Link>
                    </>
                )}
                {/* Other role-specific links (e.g., student results, dean reports) will go here */}
            </div>

            {/* Right: Session Management */}
            <div>
                {role ? (
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-1"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                ) : (
                    <Link
                        to="/login"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;