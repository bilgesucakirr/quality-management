import React from "react";
import { useAuthStore } from "../store/AuthStore";
import { Link } from "react-router-dom";
import isikUniversityLogo from "/i.u_logo-blue-en.png"; // (Varsa)

const BG = "#f8f9fb";
const PRIMARY = "#21409a";

const Dashboard: React.FC = () => {
  const role = useAuthStore((state) => state.role);

  if (!role) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: BG }}>
        <div className="text-lg text-gray-700">Loading...</div>
      </div>
    );
  }

  if (role === "ADMIN") return <AdminPanel />;
  if (role === "STAFF") return <StaffPanel />;
  if (role === "STUDENT") return <StudentPanel />;
  if (role === "DEAN") return <DeanPanel />;
  return (
    <div className="flex items-center justify-center h-screen" style={{ background: BG }}>
      <div className="text-lg text-gray-700">Unauthorized role.</div>
    </div>
  );
};

export default Dashboard;

// ------ ADMIN PANEL ------ //
const AdminPanel: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: BG }}>
    {/* Logo yukarıya eklemek için */}
    <h1 className="text-3xl font-bold mb-3 text-[#21409a] tracking-tight">Admin Dashboard</h1>
    <p className="text-base text-gray-600 mb-8">
      Welcome, Administrator. Here you can manage core system entities.
    </p>
    <div className="flex flex-col gap-3 w-full max-w-xs">
      <Link
        to="/user-management"
        className="w-full py-2 rounded-md bg-[#21409a] hover:bg-[#18316e] text-white font-semibold text-sm transition-all text-center"
      >
        User Management
      </Link>
      <Link
        to="/course-management"
        className="w-full py-2 rounded-md bg-[#2949bb] hover:bg-[#203978] text-white font-semibold text-sm transition-all text-center"
      >
        Course Management
      </Link>
      {/* Diğer linkler isteğe bağlı */}
    </div>
  </div>
);

// ------ STAFF PANEL ------ //
const StaffPanel: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: BG }}>
    <h1 className="text-3xl font-bold mb-3 text-[#187945] tracking-tight">Staff Dashboard</h1>
    <p className="text-base text-gray-600 mb-8">
      Welcome, Staff. You can manage surveys, YÖKAK criteria, and upload data here.
    </p>
    <div className="flex flex-col gap-3 w-full max-w-xs">
      <Link
        to="/survey-management"
        className="w-full py-2 rounded-md bg-[#187945] hover:bg-[#15603a] text-white font-semibold text-sm transition-all text-center"
      >
        Survey Management
      </Link>
      <Link
        to="/yokak-criterion-management"
        className="w-full py-2 rounded-md bg-[#15a48a] hover:bg-[#15806a] text-white font-semibold text-sm transition-all text-center"
      >
        YÖKAK Criterion Management
      </Link>
      <Link
        to="/data-upload"
        className="w-full py-2 rounded-md bg-[#1e8797] hover:bg-[#176d7b] text-white font-semibold text-sm transition-all text-center"
      >
        Upload Survey Data
      </Link>
    </div>
  </div>
);

// ------ STUDENT PANEL ------ //
const StudentPanel: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: BG }}>
    <h1 className="text-3xl font-bold mb-3 text-[#f59532] tracking-tight">Student Dashboard</h1>
    <p className="text-base text-gray-600 mb-8">
      Welcome, Student. You can view your survey results and performance here.
    </p>
    {/* Ekstra link veya özelliği buraya ekle */}
  </div>
);

// ------ DEAN PANEL ------ //
const DeanPanel: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: BG }}>
    <h1 className="text-3xl font-bold mb-3 text-[#8d49ba] tracking-tight">Dean Dashboard</h1>
    <p className="text-base text-gray-600 mb-8">
      Welcome, Dean. You can view performance reports for your faculty.
    </p>
    {/* Dean-specific features */}
  </div>
);
