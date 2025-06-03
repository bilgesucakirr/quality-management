// src/components/Navbar.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/AuthStore';
// Add new icons for University Management (e.g., Building, BookOpen)
import { LogOut, LayoutDashboard, Users, ClipboardList, Upload, Building, BookOpen } from 'lucide-react'; 

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
            {/* Left section: Logo/Title */}
            <div className="flex items-center">
                <Link to="/" className="text-xl font-bold" style={{ color: BLUE }}>
                    UQMS
                </Link>
            </div>

            {/* Middle section: Navigation Links */}
            <div className="flex space-x-6">
                {/* Always visible link to Dashboard */}
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-700 font-medium flex items-center gap-1">
                    <LayoutDashboard size={18} /> Dashboard
                </Link>

                {/* Links visible only to ADMIN role */}
                {role === "ADMIN" && ( 
                    <>
                        <Link to="/user-management" className="text-gray-700 hover:text-blue-700 font-medium flex items-center gap-1">
                            <Users size={18} /> User Management
                        </Link>
                        <Link to="/survey-management" className="text-gray-700 hover:text-blue-700 font-medium flex items-center gap-1">
                            <ClipboardList size={18} /> Survey Management
                        </Link>
                        {/* New: Links for Faculty and Department Management */}
                        <Link to="/faculty-management" className="text-gray-700 hover:text-blue-700 font-medium flex items-center gap-1">
                            <Building size={18} /> Faculty Management
                        </Link>
                        <Link to="/department-management" className="text-gray-700 hover:text-blue-700 font-medium flex items-center gap-1">
                            <BookOpen size={18} /> Department Management
                        </Link>
                    </>
                )}

                {/* Links visible only to STAFF role (or ADMIN, if they also perform uploads) */}
                {(role === "STAFF" || role === "ADMIN") && ( 
                    <>
                        <Link to="/data-upload" className="text-gray-700 hover:text-blue-700 font-medium flex items-center gap-1">
                            <Upload size={18} /> Upload Survey Data
                        </Link>
                    </>
                )}
                {/* Other role-specific links will be added here later */}
            </div>

            {/* Right section: Session Management (Login/Logout) */}
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