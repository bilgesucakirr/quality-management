import React from "react";
import { useAuthStore } from "../store/AuthStore";
import { Link } from "react-router-dom"; // Link componenti için import

const Dashboard: React.FC = () => {
    const role = useAuthStore((state) => state.role);

    if (!role) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg text-gray-700">Loading...</div>
            </div>
        );
    }

    // Role-specific content
    if (role === "ADMIN") {
        return <AdminPanel />;
    } else if (role === "STAFF") {
        return <StaffPanel />;
    } else if (role === "STUDENT") {
        return <StudentPanel />;
    } else if (role === "DEAN") { // Assuming a DEAN role will be added for faculty-specific view
        return <DeanPanel />;
    } else {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg text-gray-700">Unauthorized role.</div>
            </div>
        );
    }
};

export default Dashboard;

// ------ ADMIN PANEL ------ //
const AdminPanel: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
                <h1 className="text-3xl font-bold text-blue-700 mb-4">
                    Admin Dashboard
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                    Welcome, Administrator. Here you can manage core system entities.
                </p>
                <div className="flex flex-col gap-4 max-w-sm mx-auto"> {/* Max width for buttons */}
                    <Link
                        to="/user-management"
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow font-semibold hover:bg-blue-800 transition"
                    >
                        User Management
                    </Link>
                    <Link
                        to="/course-management"
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow font-semibold hover:bg-indigo-800 transition"
                    >
                        Course Management
                    </Link>
                    {/* Optionally add Faculty and Department management here if admin handles them */}
                    {/* <Link
                        to="/faculty-management"
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl shadow font-semibold hover:bg-purple-800 transition"
                    >
                        Faculty Management
                    </Link>
                    <Link
                        to="/department-management"
                        className="px-6 py-3 bg-pink-600 text-white rounded-xl shadow font-semibold hover:bg-pink-800 transition"
                    >
                        Department Management
                    </Link> */}
                    {/* Removed System Settings for now, can be added when that page is built */}
                    {/* <Link
                        to="/system-settings"
                        className="px-6 py-3 bg-gray-600 text-white rounded-xl shadow font-semibold hover:bg-gray-700 transition"
                    >
                        System Settings
                    </Link> */}
                </div>
            </div>
        </div>
    );
};

// ------ STAFF PANEL ------ //
const StaffPanel: React.FC = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
            <h1 className="text-3xl font-bold text-green-700 mb-4"> {/* Changed color to distinguish */}
                Staff Dashboard
            </h1>
            <p className="text-lg text-gray-600 mb-8">
                Welcome, Staff. You can manage surveys, YÖKAK criteria, and upload data here.
            </p>
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
                <Link
                    to="/survey-management"
                    className="px-6 py-3 bg-green-600 text-white rounded-xl shadow font-semibold hover:bg-green-800 transition"
                >
                    Survey Management
                </Link>
                <Link
                    to="/yokak-criterion-management"
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl shadow font-semibold hover:bg-teal-800 transition"
                >
                    YÖKAK Criterion Management
                </Link>
                <Link
                    to="/data-upload"
                    className="px-6 py-3 bg-cyan-600 text-white rounded-xl shadow font-semibold hover:bg-cyan-800 transition"
                >
                    Upload Survey Data
                </Link>
                {/* Staff features will go here */}
            </div>
        </div>
    </div>
);

// ------ STUDENT PANEL ------ //
const StudentPanel: React.FC = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
            <h1 className="text-3xl font-bold text-orange-700 mb-4"> {/* Changed color to distinguish */}
                Student Dashboard
            </h1>
            <p className="text-lg text-gray-600 mb-8">
                Welcome, Student. You can view your survey results and performance here.
            </p>
            {/* Student features will go here */}
        </div>
    </div>
);

// ------ DEAN PANEL ------ // (Yeni rol için eklendi, henüz implementasyonu yok)
const DeanPanel: React.FC = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
            <h1 className="text-3xl font-bold text-purple-700 mb-4"> {/* Changed color to distinguish */}
                Dean Dashboard
            </h1>
            <p className="text-lg text-gray-600 mb-8">
                Welcome, Dean. You can view performance reports for your faculty.
            </p>
            {/* Dean-specific features will go here */}
        </div>
    </div>
);