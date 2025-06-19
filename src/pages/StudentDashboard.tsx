// src/pages/StudentDashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/AuthStore';
import { useNavigate } from 'react-router-dom';
import {
  getOverallAverage,
  getEntityAverages,
} from '../api/AnalysisService';
import { getAllDepartments } from '../api/DepartmentService';
import type { Department } from '../types/Department';
import type {
  OverallAverageResponse,
  EntityAverageResponse,
} from '../types/Analysis';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getAllCourses } from '../api/CourseService'; // YENİ: Kursları çekmek için
import type { Course } from '../types/Course'; // YENİ: Course tipi

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const BG = "#f8f9fb";
const BORDER_COLOR = "#e5eaf8";
const PRIMARY_BLUE = "#21409a";

const MODERN_COLORS = [
  'rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)',
  'rgba(75, 192, 192, 0.8)', 'rgba(255, 206, 86, 0.8)',
  'rgba(153, 102, 255, 0.8)','rgba(255, 159, 64, 0.8)',
];

const generateChartColors = (count: number) => {
  const backgroundColors: string[] = [];
  const borderColors: string[] = [];
  for (let i = 0; i < count; i++) {
    const color = MODERN_COLORS[i % MODERN_COLORS.length];
    backgroundColors.push(color);
    borderColors.push(color.replace('0.8', '1'));
  }
  return { backgroundColors, borderColors };
};

const commonChartOptions = (titleText: string, xAxisLabel: string = 'Entities', yAxisLabel: string = 'Average Score (1-5)') => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: titleText, font: { size: 16, weight: 'bold' as const }, color: '#333' },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || context.label || '';
            if (label) { label += ': '; }
            const value = context.parsed?.y !== undefined ? context.parsed.y : context.parsed;
            if (value !== null && value !== undefined) {
              label += typeof value === 'number' ? value.toFixed(2) : value;
            }
            return label;
          }
        }
      },
      datalabels: {
        anchor: 'end' as const,
        align: 'end' as const,
        formatter: (value: number) => value > 0 ? value.toFixed(2) : '',
        color: '#444',
        font: { weight: 'bold' as const, size: 10 }
      }
    },
    scales: {
        y: { beginAtZero: true, suggestedMax: 5, title: { display: true, text: yAxisLabel, font: {size: 11} } },
        x: { title: { display: true, text: xAxisLabel, font: {size: 11} } }
    }
  });


const StudentDashboard: React.FC = () => {
  const { role, departmentId, email, currentUser } = useAuthStore();
  const navigate = useNavigate();

  const [overallAverage, setOverallAverage] = useState<OverallAverageResponse | null>(null);
  const [courseAverages, setCourseAverages] = useState<EntityAverageResponse[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [departmentName, setDepartmentName] = useState<string>('');
  
  const [availableSemesters, setAvailableSemesters] = useState<string[]>([]); // Dinamik dönemler için
  const [selectedSemester, setSelectedSemester] = useState<string>(""); // Kullanıcının seçtiği dönem

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const extractUnitCodeFromEmail = (userEmail: string | null): string | null => {
    if (!userEmail) return null;
    const match = userEmail.match(/^\d+([A-Z]+)\d+@/i);
    return match && match[1] ? match[1].toUpperCase() : null;
  };

  const unitCode = extractUnitCodeFromEmail(email);

  // Dönemleri ve departmanları çekmek için useEffect
  useEffect(() => {
    if (role !== 'STUDENT') {
        setError("Access Denied. This dashboard is for students only.");
        setLoading(false);
        return;
    }

    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [depts, allCoursesData] = await Promise.all([
          getAllDepartments(),
          getAllCourses() // Tüm dersleri çekerek dönemleri alacağız
        ]);
        setAllDepartments(depts);

        // Dinamik olarak dönemleri oluştur
        const semestersSet = new Set<string>();
        allCoursesData.forEach(course => semestersSet.add(course.semester));
        
        const generatedSemesters: string[] = [];
        const currentYear = new Date().getFullYear();
        const startYearForGeneration = currentYear - 2; 
        const endYearForGeneration = currentYear + 2; 

        for (let year = startYearForGeneration; year <= endYearForGeneration; year++) {
            generatedSemesters.push(`FALL${String(year).substring(2)}`);
            generatedSemesters.push(`SPRING${String(year + 1).substring(2)}`);
            generatedSemesters.push(`SUMMER${String(year + 1).substring(2)}`);
        }
        // Hem veritabanındaki hem de oluşturulan dönemleri birleştir ve sırala
        const uniqueSemesters = Array.from(new Set([...Array.from(semestersSet), ...generatedSemesters]));
        uniqueSemesters.sort((a, b) => {
            const getSemesterOrder = (s: string) => {
                const yearPart = parseInt(s.substring(s.length - 2));
                const typePart = s.substring(0, s.length - 2);
                let order = yearPart * 100;
                if (typePart === "FALL") order += 1;
                else if (typePart === "SPRING") order += 2;
                else if (typePart === "SUMMER") order += 3;
                return order;
            };
            return getSemesterOrder(b) - getSemesterOrder(a); // En yeni dönem en üste
        });
        setAvailableSemesters(uniqueSemesters);
        
        // En yeni dönemi varsayılan olarak seç
        if (uniqueSemesters.length > 0) {
            setSelectedSemester(uniqueSemesters[0]);
        }

      } catch (err) {
        setError("Failed to load initial filter data.");
        console.error("Failed to fetch initial data for student dashboard:", err);
      } finally {
        setLoading(false); // Yükleme bittiğinde loading'i false yap
      }
    };

    fetchInitialData();
  }, [role]); // role değiştiğinde çalışır

  const fetchStudentData = useCallback(async () => {
    if (role !== 'STUDENT' || !departmentId || !selectedSemester) { // selectedSemester kontrolü eklendi
        setLoading(false);
        if(role === 'STUDENT' && !departmentId) setError("Department information is not available.");
        // selectedSemester boşsa hata verme, kullanıcı seçene kadar bekleyebilir.
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const overallAvgData = await getOverallAverage(selectedSemester, undefined, departmentId, undefined);
      setOverallAverage(overallAvgData);

      const courseAvgData = await getEntityAverages("COURSE", selectedSemester, undefined, departmentId);
      setCourseAverages(courseAvgData);

      if (currentUser?.department?.name) {
        setDepartmentName(currentUser.department.name);
      } else if (departmentId && allDepartments.length > 0) {
        const dep = allDepartments.find(d => d.id === departmentId);
        setDepartmentName(dep?.name || `Department (ID: ${departmentId.substring(0,6)}...)`);
      } else if (unitCode) {
        setDepartmentName(`${unitCode} Department (Estimated from email)`);
      }

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load student dashboard data.');
      setOverallAverage(null);
      setCourseAverages([]);
    } finally {
      setLoading(false);
    }
  }, [role, departmentId, selectedSemester, currentUser, unitCode, allDepartments]); // selectedSemester bağımlılıklara eklendi

  useEffect(() => {
    if (role === 'STUDENT' && departmentId && selectedSemester && allDepartments.length > 0) {
      fetchStudentData();
    }
  }, [fetchStudentData, role, departmentId, selectedSemester, allDepartments]); // selectedSemester bağımlılıklara eklendi


  if (loading && (!overallAverage && courseAverages.length === 0)) { // Sadece ilk yüklemede veya filtre değiştiğinde tam ekran yükleme
    return <div className="flex justify-center items-center h-screen text-lg" style={{ background: BG, color: PRIMARY_BLUE }}>Loading student data...</div>;
  }

  if (error && !loading) { // Hata varsa ve yükleme bitmişse göster
    return <div className="flex justify-center items-center h-screen bg-red-100 text-red-700 p-6 rounded-md shadow-md">{error}</div>;
  }

  if (role !== 'STUDENT') {
    return <div className="flex justify-center items-center h-screen text-xl font-semibold" style={{ background: BG, color: PRIMARY_BLUE }}>Unauthorized Access</div>;
  }
  
  const courseChartData = courseAverages.length > 0 ? {
    labels: courseAverages.map(c => `${c.name}`),
    datasets: [{
      label: `Course Averages`,
      data: courseAverages.map(c => c.averageScore),
      backgroundColor: generateChartColors(courseAverages.length).backgroundColors,
      borderColor: generateChartColors(courseAverages.length).borderColors,
      borderWidth: 1,
      borderRadius: 5,
    }]
  } : null;

  const displayedDepartmentName = departmentName || (unitCode ? `${unitCode} Department (Estimated)` : 'Your Department');

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-10 px-4" style={{ background: BG }}>
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-2 text-center" style={{ color: PRIMARY_BLUE }}>
          Student Dashboard
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Welcome, {currentUser?.name || 'Student'}! ({displayedDepartmentName})
        </p>

        {/* Dönem Filtresi */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 w-full max-w-xs mx-auto border" style={{ borderColor: BORDER_COLOR }}>
            <label htmlFor="semester-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select Semester:
            </label>
            <select
                id="semester-select"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#21409a] outline-none bg-white"
                disabled={availableSemesters.length === 0 || loading}
            >
                {availableSemesters.length === 0 && <option value="">Loading semesters...</option>}
                {availableSemesters.map((sem) => (
                <option key={sem} value={sem}>
                    {sem}
                </option>
                ))}
            </select>
        </div>
        
        {loading && (overallAverage || courseAverages.length > 0) && <p className="text-center text-gray-500 my-4">Updating data for {selectedSemester}...
        </p>}


        {overallAverage ? (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border text-center" style={{ borderColor: BORDER_COLOR }}>
            <h2 className="text-xl font-semibold mb-2" style={{ color: PRIMARY_BLUE }}>
              {displayedDepartmentName} - Overall Survey Average ({selectedSemester})
            </h2>
            <p className="text-4xl font-bold text-gray-800">
              {overallAverage.averageScore ? overallAverage.averageScore.toFixed(2) : 'N/A'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Based on {overallAverage.totalSubmissions} submissions.
            </p>
          </div>
        ) : (
            !loading && <p className="text-center text-gray-500 my-8">No overall average data available for {displayedDepartmentName} in {selectedSemester}.</p>
        )}

        {courseChartData ? (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border" style={{ borderColor: BORDER_COLOR }}>
            <h2 className="text-xl font-semibold mb-4 text-center" style={{ color: PRIMARY_BLUE }}>
              Course Averages in {displayedDepartmentName} ({selectedSemester})
            </h2>
            <div style={{ height: '400px' }} className="relative">
              <Bar options={commonChartOptions(`Course Averages`, 'Courses')} data={courseChartData} />
            </div>
          </div>
        ) : (
            !loading && <p className="text-center text-gray-500 mt-8">No course average data available for {displayedDepartmentName} in {selectedSemester}.</p>
        )}
        
        {!overallAverage && !courseAverages.length && !loading && !error && selectedSemester && (
            <p className="text-center text-gray-500 mt-10">
                No analysis data found for {displayedDepartmentName} in {selectedSemester}.
            </p>
        )}
        {!selectedSemester && !loading && !error && (
            <p className="text-center text-gray-500 mt-10">
                Please select a semester to view data.
            </p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;