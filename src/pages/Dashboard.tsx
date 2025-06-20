// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react"; // useEffect ve useState eklendi
import { useAuthStore } from "../store/AuthStore";
import { Link, useNavigate } from "react-router-dom"; // useNavigate eklendi
import {
  Users,
  BookOpen,
  Building,
  GitFork,
  ClipboardList,
  FileText,
  ListTree,
  UploadCloud,
  BarChart3, // Yeni ikon
  ShieldCheck, // Yeni ikon
  Settings2, // Yeni ikon
} from "lucide-react"; // İkonlar eklendi

// API Servisleri (İstatistikler için)
import { getAllUsers } from "../api/UserService";
import { getAllFaculties } from "../api/FacultyService";
import { getAllDepartments } from "../api/DepartmentService";
import { getAllCourses } from "../api/CourseService";
import { getAllSurveys } from "../api/SurveyService";
import { getAllSubmissions } from "../api/SurveySubmissionService";

const BG = "#f8f9fb";
const PRIMARY_BLUE = "#21409a";
const BORDER_COLOR = "#e5eaf8";


const StatCard: React.FC<{ title: string; value: number | string; icon: React.ElementType, linkTo?: string }> = ({ title, value, icon: Icon, linkTo }) => {
  const content = (
    <div className="bg-white p-6 rounded-xl shadow-lg border hover:shadow-xl transition-shadow duration-300 ease-in-out flex items-center space-x-4" style={{ borderColor: BORDER_COLOR }}>
      <div className="p-3 rounded-full bg-indigo-100 text-[#21409a]">
        <Icon size={28} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-[#1e3a8a]">{value}</p>
      </div>
    </div>
  );

  return linkTo ? <Link to={linkTo} className="block">{content}</Link> : content;
};


const Dashboard: React.FC = () => {
  const role = useAuthStore((state) => state.role);
  const navigate = useNavigate(); // useNavigate hook'u eklendi

  useEffect(() => { // Kullanıcı giriş yapmamışsa veya rolü yoksa login sayfasına yönlendir
    const token = useAuthStore.getState().accessToken;
    if (!token || !role) {
      navigate("/login");
    }
  }, [role, navigate]);


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
  if (role === "RECTOR") return <RectorPanel />; // RECTOR için bir panel ekleyebiliriz
  
  return (
    <div className="flex items-center justify-center h-screen" style={{ background: BG }}>
      <div className="text-lg text-gray-700">Unauthorized role or page not found for this role.</div>
    </div>
  );
};

export default Dashboard;

const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState({
    users: 0,
    faculties: 0,
    departments: 0,
    courses: 0,
    surveys: 0,
    submissions: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const {currentUser} = useAuthStore();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          usersData,
          facultiesData,
          departmentsData,
          coursesData,
          surveysData,
          submissionsData,
        ] = await Promise.all([
          getAllUsers(),
          getAllFaculties(),
          getAllDepartments(),
          getAllCourses(),
          getAllSurveys(),
          getAllSubmissions(),
        ]);
        setStats({
          users: usersData.length,
          faculties: facultiesData.length,
          departments: departmentsData.length,
          courses: coursesData.length,
          surveys: surveysData.length,
          submissions: submissionsData.length,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard statistics:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const managementLinks = [
    { to: "/user-management", label: "User Management", icon: Users, color: "bg-blue-500 hover:bg-blue-600" },
    { to: "/course-management", label: "Course Management", icon: BookOpen, color: "bg-green-500 hover:bg-green-600" },
    { to: "/faculty-management", label: "Faculty Management", icon: Building, color: "bg-indigo-500 hover:bg-indigo-600" },
    { to: "/department-management", label: "Department Management", icon: GitFork, color: "bg-purple-500 hover:bg-purple-600" },
    { to: "/survey-submissions", label: "Submissions Overview", icon: FileText, color: "bg-teal-500 hover:bg-teal-600" },
    { to: "/rector-dashboard", label: "University Analytics", icon: BarChart3, color: "bg-pink-500 hover:bg-pink-600" },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-10 px-4" style={{ background: BG }}>
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3" style={{ color: PRIMARY_BLUE }}>Admin Dashboard</h1>
          <p className="text-lg text-gray-600">
            Welcome, {currentUser?.name || 'Administrator'}! System overview and management tools.
          </p>
        </div>

        {loadingStats ? (
          <p className="text-center text-gray-500">Loading system statistics...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <StatCard title="Total Users" value={stats.users} icon={Users} linkTo="/user-management"/>
            <StatCard title="Total Faculties" value={stats.faculties} icon={Building} linkTo="/faculty-management"/>
            <StatCard title="Total Departments" value={stats.departments} icon={GitFork} linkTo="/department-management"/>
            <StatCard title="Total Courses" value={stats.courses} icon={BookOpen} linkTo="/course-management"/>
            <StatCard title="Total Surveys" value={stats.surveys} icon={ClipboardList} /> 
            <StatCard title="Total Submissions" value={stats.submissions} icon={FileText} linkTo="/survey-submissions"/>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold mb-6 text-center" style={{color: PRIMARY_BLUE}}>Quick Management Areas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {managementLinks.map(link => (
              <Link 
                key={link.to} 
                to={link.to} 
                className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center text-white text-center ${link.color}`}
              >
                <link.icon size={36} className="mb-3"/>
                <span className="font-semibold text-md">{link.label}</span>
              </Link>
            ))}
             {/* Staff-specific tools that Admin might also use */}
            <Link to="/survey-management" className="p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center text-white text-center bg-cyan-500 hover:bg-cyan-600">
                <ClipboardList size={36} className="mb-3"/>
                <span className="font-semibold text-md">Survey Definition</span>
            </Link>
            <Link to="/yokak-criterion-management" className="p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center text-white text-center bg-lime-500 hover:bg-lime-600">
                <ListTree size={36} className="mb-3"/>
                <span className="font-semibold text-md">YOKAK Criteria</span>
            </Link>
             <Link to="/data-upload" className="p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center text-white text-center bg-orange-500 hover:bg-orange-600">
                <UploadCloud size={36} className="mb-3"/>
                <span className="font-semibold text-md">Data Upload</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const StaffPanel: React.FC = () => {
  const {currentUser} = useAuthStore();
  return (
  <div className="min-h-screen flex flex-col items-center justify-center py-10 px-4" style={{ background: BG }}>
     <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl font-bold mb-3" style={{ color: PRIMARY_BLUE }}>Staff Dashboard</h1>
        <p className="text-lg text-gray-600 mb-10">
            Welcome, {currentUser?.name || 'Staff Member'}! Access your tools and manage survey-related tasks.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/survey-management" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col items-center justify-center border border-blue-200">
                <ClipboardList size={48} className="text-blue-600 mb-3" />
                <span className="text-xl font-semibold text-blue-700">Survey Management</span>
                <p className="text-sm text-gray-500 mt-1">Create and manage surveys.</p>
            </Link>
            <Link to="/yokak-criterion-management" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col items-center justify-center border border-green-200">
                <ListTree size={48} className="text-green-600 mb-3" />
                <span className="text-xl font-semibold text-green-700">YÖKAK Criteria</span>
                <p className="text-sm text-gray-500 mt-1">Manage YÖKAK criteria.</p>
            </Link>
            <Link to="/data-upload" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col items-center justify-center border border-purple-200">
                <UploadCloud size={48} className="text-purple-600 mb-3" />
                <span className="text-xl font-semibold text-purple-700">Upload Survey Data</span>
                <p className="text-sm text-gray-500 mt-1">Upload completed survey results.</p>
            </Link>
            <Link to="/survey-submissions" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col items-center justify-center border border-teal-200">
                <FileText size={48} className="text-teal-600 mb-3" />
                <span className="text-xl font-semibold text-teal-700">View Submissions</span>
                <p className="text-sm text-gray-500 mt-1">Review and manage submissions.</p>
            </Link>
            <Link to="/analysis" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col items-center justify-center border border-indigo-200">
                <BarChart3 size={48} className="text-indigo-600 mb-3" />
                <span className="text-xl font-semibold text-indigo-700">Data Analysis</span>
                <p className="text-sm text-gray-500 mt-1">Analyze survey data.</p>
            </Link>
             <Link to="/graphical-analysis" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col items-center justify-center border border-pink-200">
                <ShieldCheck size={48} className="text-pink-600 mb-3" /> {/* İkonu değiştirebilirsiniz */}
                <span className="text-xl font-semibold text-pink-700">Graphical Analysis</span>
                <p className="text-sm text-gray-500 mt-1">View data in charts.</p>
            </Link>
        </div>
    </div>
  </div>
  )
};

const StudentPanel: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: BG }}>
    <h1 className="text-4xl font-bold mb-3 text-[#f59532] tracking-tight">Student Dashboard</h1>
    <p className="text-lg text-gray-600 mb-8">
      Welcome, Student. View your survey results and performance here.
    </p>
    <Link
        to="/student-dashboard"
        className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg font-semibold text-lg transition-transform transform hover:scale-105"
    >
        Go to My Dashboard
    </Link>
  </div>
);

const DeanPanel: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: BG }}>
    <h1 className="text-4xl font-bold mb-3 text-[#8d49ba] tracking-tight">Dean Dashboard</h1>
    <p className="text-lg text-gray-600 mb-8">
      Welcome, Dean. View performance reports for your faculty.
    </p>
     <Link
        to="/dean-dashboard"
        className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg font-semibold text-lg transition-transform transform hover:scale-105"
    >
        Go to Dean Dashboard
    </Link>
  </div>
);

const RectorPanel: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: BG }}>
    <h1 className="text-4xl font-bold mb-3 text-gray-700 tracking-tight">Rector Dashboard</h1>
    <p className="text-lg text-gray-600 mb-8">
      Welcome, Rector. Access university-wide analytics and reports.
    </p>
     <Link
        to="/rector-dashboard"
        className="px-8 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-xl shadow-lg font-semibold text-lg transition-transform transform hover:scale-105"
    >
        Go to Rector Dashboard
    </Link>
  </div>
);