import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/AuthStore';
import { useNavigate } from 'react-router-dom';
import { getEntityAverages } from '../api/AnalysisService';
import type { EntityAverageResponse } from '../types/Analysis';
import { getAllFaculties } from "../api/FacultyService";
import { getAllDepartments } from "../api/DepartmentService";
import { getAllCourses } from "../api/CourseService";
import type { Faculty, Department } from "../types/University";
import type { Course } from "../types/Course";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  // ArcElement, // Pie chart kaldırıldığı için bu da kaldırıldı
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  // ArcElement, // Kaldırıldı
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const BG = "#f8f9fb";
const BORDER_COLOR = "#e5eaf8";

const MODERN_COLORS = [
  'rgba(54, 162, 235, 0.8)',
  'rgba(255, 99, 132, 0.8)',
  'rgba(75, 192, 192, 0.8)',
  'rgba(255, 206, 86, 0.8)',
  'rgba(153, 102, 255, 0.8)',
  'rgba(255, 159, 64, 0.8)',
  'rgba(99, 255, 132, 0.8)',
  'rgba(201, 203, 207, 0.8)'
];

const generateModernChartColors = (count: number) => {
  const backgroundColors: string[] = [];
  const borderColors: string[] = [];
  for (let i = 0; i < count; i++) {
    const color = MODERN_COLORS[i % MODERN_COLORS.length];
    backgroundColors.push(color);
    borderColors.push(color.replace('0.8', '1'));
  }
  return { backgroundColors, borderColors };
};

const commonChartOptions = (titleText: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            font: {
                size: 10
            },
            boxWidth: 20,
            padding: 10
        }
      },
      title: { display: true, text: titleText, font: { size: 16, weight: 'bold' as const, family: 'Arial, sans-serif' }, color: '#333' },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 11 },
        callbacks: {
          label: function(context: any) {
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
        anchor: 'end' as 'end' | 'start' | 'center', // DÜZELTME: Daha spesifik string literalleri
        align: 'end' as 'end' | 'start' | 'center' | 'top' | 'bottom' | 'left' | 'right', // DÜZELTME
        formatter: (value: number) => value > 0 ? value.toFixed(2) : '',
        color: '#444',
        font: {
          weight: 'bold' as const,
          size: 9,
        }
      }
    },
  });

  const barChartScales = (xAxisLabel: string, yAxisLabel: string = 'Average Score (1-5)') => ({
      y: {
        beginAtZero: true,
        suggestedMax: 5,
        title: { display: true, text: yAxisLabel, font: {size: 11} },
        grid: {
            drawOnChartArea: true,
            color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: { font: {size: 10} }
      },
      x: {
        title: { display: true, text: xAxisLabel, font: {size: 11} },
        grid: {
            drawOnChartArea: false,
        },
        ticks: { font: {size: 10} }
      }
  });

const GraphicalAnalysisPage: React.FC = () => {
  const { role } = useAuthStore();
  const navigate = useNavigate();

  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(""); // Bu state'i kullanacağız

  const [availableSemesters, setAvailableSemesters] = useState<string[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [facultyAverages, setFacultyAverages] = useState<EntityAverageResponse[]>([]);
  const [departmentAverages, setDepartmentAverages] = useState<EntityAverageResponse[]>([]);
  const [courseAverages, setCourseAverages] = useState<EntityAverageResponse[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDropdownData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [facultyData, departmentData, courseData] = await Promise.all([
        getAllFaculties(),
        getAllDepartments(),
        getAllCourses(),
      ]);

      setFaculties(facultyData);
      setDepartments(departmentData);
      setCourses(courseData);

      const semestersSet = new Set<string>();
      courseData.forEach(course => semestersSet.add(course.semester));
      const dynamicSemesters: string[] = [];
      const currentYear = new Date().getFullYear();
      const startYearForGeneration = currentYear - 2;
      const endYearForGeneration = currentYear + 2;

      for (let year = startYearForGeneration; year <= endYearForGeneration; year++) {
          dynamicSemesters.push(`FALL${String(year).substring(2)}`);
          dynamicSemesters.push(`SPRING${String(year + 1).substring(2)}`);
          dynamicSemesters.push(`SUMMER${String(year + 1).substring(2)}`);
      }
      const uniqueSemesters = Array.from(new Set([...Array.from(semestersSet).sort().reverse(), ...dynamicSemesters]));
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
            return getSemesterOrder(b) - getSemesterOrder(a);
        });
      setAvailableSemesters(uniqueSemesters);

      if (uniqueSemesters.length > 0) setSelectedSemester(uniqueSemesters[0]);

    } catch (err) {
      setError("Failed to load filter options.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role && ["ADMIN", "RECTOR", "DEAN", "STAFF"].includes(role)) {
      fetchDropdownData();
    } else {
      setError("Unauthorized");
      navigate("/dashboard");
    }
  }, [role, navigate, fetchDropdownData]);

  const fetchChartData = useCallback(async () => {
    if (!selectedSemester || !role || !["ADMIN", "RECTOR", "DEAN", "STAFF"].includes(role)) {
      setFacultyAverages([]);
      setDepartmentAverages([]);
      setCourseAverages([]);
      return;
    }
    setLoading(true);
    setError(null);
    const semester = selectedSemester || undefined;
    const faculty = selectedFacultyId || undefined;
    const department = selectedDepartmentId || undefined;
    // const course = selectedCourseId || undefined; // Course API'ye parametre olarak gönderilmiyor şimdilik

    try {
      const [facultyD, departmentD, courseD] = await Promise.all([
          getEntityAverages("FACULTY", semester),
          getEntityAverages("DEPARTMENT", semester, faculty),
          getEntityAverages("COURSE", semester, faculty, department), // Course ID ile filtreleme backend'de yoksa, frontend'de yapılabilir
      ]);
      setFacultyAverages(facultyD);
      setDepartmentAverages(departmentD);

      // Kurs grafiği için selectedCourseId'ye göre frontend'de filtreleme
      if (selectedCourseId) {
        setCourseAverages(courseD.filter(c => c.id === selectedCourseId));
      } else {
        setCourseAverages(courseD);
      }

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch chart data.");
      setFacultyAverages([]);
      setDepartmentAverages([]);
      setCourseAverages([]);
    } finally {
      setLoading(false);
    }
  }, [role, selectedSemester, selectedFacultyId, selectedDepartmentId, selectedCourseId]); // selectedCourseId eklendi

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);


  const handleFacultyFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFacultyId(e.target.value);
    setSelectedDepartmentId("");
    setSelectedCourseId("");
  };

  const handleDepartmentFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartmentId(e.target.value);
    setSelectedCourseId("");
  };

  const filteredDepartments = selectedFacultyId
    ? departments.filter(d => d.facultyId === selectedFacultyId)
    : departments;

  const filteredCoursesForDropdown = selectedDepartmentId
    ? courses.filter(c => c.departmentId === selectedDepartmentId && c.semester === selectedSemester)
    : courses.filter(c => c.semester === selectedSemester);


  const createBarChartData = (data: EntityAverageResponse[], labelPrefix: string) => {
    const { backgroundColors, borderColors } = generateModernChartColors(data.length);
    return {
        labels: data.map(item => item.name || 'Unknown'),
        datasets: [
        {
            label: `${labelPrefix} (${selectedSemester || 'All Sem.'})`,
            data: data.map(item => item.averageScore),
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
            borderRadius: 5,
        },
        ],
    };
  };

  if (!role || !["ADMIN", "RECTOR", "DEAN", "STAFF"].includes(role)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl text-red-600">Access Denied.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-10 px-4" style={{ background: BG }}>
      <div className="w-full max-w-7xl flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-[#21409a] text-center tracking-tight">
          Graphical Analysis Dashboard
        </h1>

        <div className="bg-white rounded-xl shadow p-5 mb-6 w-full border" style={{ borderColor: BORDER_COLOR }}>
          <h2 className="text-lg font-semibold mb-3 text-[#21409a] border-b pb-2" style={{ borderColor: BORDER_COLOR }}>Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3">
            <div>
              <label className="block text-gray-700 text-xs font-semibold mb-1">Semester:</label>
              <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#21409a] outline-none bg-white">
                <option value="">All Semesters</option>
                {availableSemesters.map(sem => (<option key={sem} value={sem}>{sem}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-xs font-semibold mb-1">Faculty:</label>
              <select value={selectedFacultyId} onChange={handleFacultyFilterChange} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#21409a] outline-none bg-white">
                <option value="">All Faculties</option>
                {faculties.map(fac => (<option key={fac.id} value={fac.id}>{fac.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-xs font-semibold mb-1">Department:</label>
              <select value={selectedDepartmentId} onChange={handleDepartmentFilterChange} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#21409a] outline-none bg-white" disabled={!selectedFacultyId && faculties.length > 0}>
                <option value="">All Departments</option>
                {filteredDepartments.map(dep => (<option key={dep.id} value={dep.id}>{dep.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-xs font-semibold mb-1">Course:</label>
              <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#21409a] outline-none bg-white" disabled={!selectedDepartmentId && departments.length > 0}>
                <option value="">All Courses (in selected Dept/Semester)</option>
                {filteredCoursesForDropdown.map((course: Course) => (<option key={course.id} value={course.id}>{course.courseCode} - {course.courseName}</option>))}
              </select>
            </div>
          </div>
        </div>

        {error && <div className="text-red-600 text-center mb-4 p-4 bg-red-100 border border-red-400 rounded">{error}</div>}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <div className="bg-white rounded-xl shadow p-5 border" style={{ borderColor: BORDER_COLOR }}>
            <h2 className="text-lg font-semibold mb-3 text-[#21409a] border-b pb-1" style={{ borderColor: BORDER_COLOR }}>
              Faculty Average Scores
            </h2>
            {loading ? (<p className="text-gray-600 text-center py-10">Loading...</p>) : facultyAverages.length > 0 ? (
              <div style={{ height: '350px' }}><Bar options={{...commonChartOptions(`Faculty Averages - ${selectedSemester || 'All'}`), scales: barChartScales('Faculties')}} data={createBarChartData(facultyAverages, 'Faculty Avg.')} /></div>
            ) : (<p className="text-gray-600 text-center py-10">No data for faculty averages.</p>)}
          </div>

          <div className="bg-white rounded-xl shadow p-5 border" style={{ borderColor: BORDER_COLOR }}>
            <h2 className="text-lg font-semibold mb-3 text-[#21409a] border-b pb-1" style={{ borderColor: BORDER_COLOR }}>
              Department Average Scores {selectedFacultyId && faculties.find(f=>f.id === selectedFacultyId) ? `(${faculties.find(f=>f.id === selectedFacultyId)?.name})` : ''}
            </h2>
            {loading ? (<p className="text-gray-600 text-center py-10">Loading...</p>) : departmentAverages.length > 0 ? (
              <div style={{ height: '350px' }}><Bar options={{...commonChartOptions(`Department Averages - ${selectedSemester || 'All'}`), scales: barChartScales('Departments')}} data={createBarChartData(departmentAverages, 'Dept. Avg.')} /></div>
            ) : (<p className="text-gray-600 text-center py-10">No data for department averages.</p>)}
          </div>

          <div className="bg-white rounded-xl shadow p-5 border lg:col-span-2" style={{ borderColor: BORDER_COLOR }}>
            <h2 className="text-lg font-semibold mb-3 text-[#21409a] border-b pb-1" style={{ borderColor: BORDER_COLOR }}>
              Course Average Scores {selectedDepartmentId && departments.find(d=>d.id === selectedDepartmentId) ? `(${departments.find(d=>d.id === selectedDepartmentId)?.name})` : ''}
            </h2>
            {loading ? (<p className="text-gray-600 text-center py-10">Loading...</p>) : courseAverages.length > 0 ? (
              <div style={{ height: '350px' }}><Bar options={{...commonChartOptions(`Course Averages - ${selectedSemester || 'All'}`), scales: barChartScales('Courses')}} data={createBarChartData(courseAverages, 'Course Avg.')} /></div>
            ) : (<p className="text-gray-600 text-center py-10">No data for course averages.</p>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphicalAnalysisPage;