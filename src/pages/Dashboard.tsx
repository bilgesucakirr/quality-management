import React from "react";
import { useAuthStore } from "../store/AuthStore";

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
                    Technical Admin Panel
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                    As a technical admin, you can manage users and access system settings.
                </p>
                <div className="flex flex-col gap-4">
                    <a
                        href="/user-management"
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow font-semibold hover:bg-blue-800 transition"
                    >
                        User Management
                    </a>
                    <a
                        href="/system-settings"
                        className="px-6 py-3 bg-gray-600 text-white rounded-xl shadow font-semibold hover:bg-gray-700 transition"
                    >
                        System Settings
                    </a>
                </div>
            </div>
        </div>
    );
};

// ------ STAFF PANEL ------ //
const StaffPanel: React.FC = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
            <h1 className="text-3xl font-bold text-blue-700 mb-4">
                Staff Dashboard
            </h1>
            <p className="text-lg text-gray-600 mb-8">
                You can manage and analyze surveys here.
            </p>
            {/* Staff features will go here */}
        </div>
    </div>
);

// ------ STUDENT PANEL ------ //
const StudentPanel: React.FC = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
            <h1 className="text-3xl font-bold text-blue-700 mb-4">
                Student Dashboard
            </h1>
            <p className="text-lg text-gray-600 mb-8">
                You can view your survey results and performance here.
            </p>
            {/* Student features will go here */}
        </div>
    </div>
);
