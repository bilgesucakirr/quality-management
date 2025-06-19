// src/pages/DeanDashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/AuthStore';
import { useNavigate } from 'react-router-dom';
import {
  getOverallAverage,
  getEntityAverages,
  getCriterionAverages, // YENİ
  getQuestionAveragesByDepartment, // YENİ
} from '../api/AnalysisService';
import type {
  OverallAverageResponse,
  EntityAverageResponse,
  CriterionAverageResponse, // YENİ
  QuestionAverageByDepartmentResponse, // YENİ
} from '../types/Analysis';
import { getAllCourses } from '../api/CourseService';
import type { Course } from '../types/Course';
import { getAllDepartments } from '../api/DepartmentService';
import type { Department } from '../types/Department';
import { getAllSurveys } from "../api/SurveyService"; // YENİ
import type { SurveyDto, QuestionResponse } from "../types/Survey"; // YENİ
import { getYokakCriteriaByLevel } from "../api/YokakCriterionService"; // YENİ
import type { YokakCriterionResponse } from "../types/YokakCriterion"; // YENİ

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
  'rgba(99, 255, 132, 0.8)', 'rgba(201, 203, 207, 0.8)'
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

type CriterionFilterLevelUi = "" | "HEADER" | "MAIN_CRITERION" | "SUB_CRITERION";

const DeanDashboard: React.FC = () => {
  const { role, facultyId, currentUser } = useAuthStore();
  const navigate = useNavigate();

  const [overallAverage, setOverallAverage] = useState<OverallAverageResponse | null>(null);
  const [departmentAverages, setDepartmentAverages] = useState<EntityAverageResponse[]>([]);
  const [courseAverages, setCourseAverages] = useState<EntityAverageResponse[]>([]);
  const [criterionAverages, setCriterionAverages] = useState<CriterionAverageResponse[]>([]);
  const [questionDepartmentAverages, setQuestionDepartmentAverages] = useState<QuestionAverageByDepartmentResponse[]>([]);
  
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [selectedDepartmentIdForCourses, setSelectedDepartmentIdForCourses] = useState<string>("");
  const [selectedDepartmentIdForQuestionAnalysis, setSelectedDepartmentIdForQuestionAnalysis] = useState<string>("");
  const [facultyName, setFacultyName] = useState<string>('');
  
  const [availableSemesters, setAvailableSemesters] = useState<string[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  const [surveys, setSurveys] = useState<SurveyDto[]>([]);
  const [selectedSurveyIdForQuestion, setSelectedSurveyIdForQuestion] = useState<string>("");
  const [questionsOfSelectedSurvey, setQuestionsOfSelectedSurvey] = useState<QuestionResponse[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");

  const [allHeaders, setAllHeaders] = useState<YokakCriterionResponse[]>([]);
  const [allMainCriteria, setAllMainCriteria] = useState<YokakCriterionResponse[]>([]);
  const [allSubCriteria, setAllSubCriteria] = useState<YokakCriterionResponse[]>([]);
  const [activeCriterionTab, setActiveCriterionTab] = useState<CriterionFilterLevelUi>("SUB_CRITERION");
  const [selectedParentCriterionHeaderId, setSelectedParentCriterionHeaderId] = useState<string>("");
  const [selectedParentCriterionId, setSelectedParentCriterionId] = useState<string>("");


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== 'DEAN') {
        setError("Access Denied. This dashboard is for Deans only.");
        setLoading(false);
        return;
    }
    if (!facultyId && role === 'DEAN') {
        setError("Faculty information is not available for your account. Please contact support.");
        setLoading(false);
        return;
    }

    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [allCoursesData, deptsData, surveyData, headerCrits, mainCrits, subCrits] = await Promise.all([
            getAllCourses(),
            getAllDepartments(),
            getAllSurveys(),
            getYokakCriteriaByLevel("HEADER"),
            getYokakCriteriaByLevel("MAIN_CRITERION"),
            getYokakCriteriaByLevel("SUB_CRITERION"),
        ]);
        
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
            return getSemesterOrder(b) - getSemesterOrder(a);
        });
        setAvailableSemesters(uniqueSemesters);
        
        if (uniqueSemesters.length > 0) {
            setSelectedSemester(uniqueSemesters[0]);
        }

        const facultyDepartments = deptsData.filter(dept => dept.facultyId === facultyId);
        setAllDepartments(facultyDepartments);
        if (facultyDepartments.length > 0) {
            setSelectedDepartmentIdForCourses(facultyDepartments[0].id);
            setSelectedDepartmentIdForQuestionAnalysis(facultyDepartments[0].id);
        }


        if(currentUser?.faculty?.name){
            setFacultyName(currentUser.faculty.name);
        }

        setSurveys(surveyData);
        if (surveyData.length > 0) {
            setSelectedSurveyIdForQuestion(surveyData[0].id);
            setQuestionsOfSelectedSurvey(surveyData[0].questions || []);
            if (surveyData[0].questions && surveyData[0].questions.length > 0) {
                setSelectedQuestionId(surveyData[0].questions[0].id);
            }
        }

        setAllHeaders(headerCrits);
        setAllMainCriteria(mainCrits);
        setAllSubCriteria(subCrits);
        if(headerCrits.length > 0) setSelectedParentCriterionHeaderId(headerCrits[0].id);
        if(mainCrits.length > 0) {
            const filteredMains = mainCrits.filter(mc => mc.parentId === (headerCrits[0]?.id || ""));
            if (filteredMains.length > 0) setSelectedParentCriterionId(filteredMains[0].id);
        }


      } catch (err) {
        setError("Failed to load initial filter data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [role, facultyId, currentUser]);

  const fetchDeanData = useCallback(async () => {
    if (role !== 'DEAN' || !facultyId || !selectedSemester) {
        setLoading(false);
        if(role === 'DEAN' && !facultyId) setError("Faculty information missing.");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const overallAvgData = await getOverallAverage(selectedSemester, facultyId, undefined, undefined);
      setOverallAverage(overallAvgData);

      const deptAvgData = await getEntityAverages("DEPARTMENT", selectedSemester, facultyId, undefined);
      setDepartmentAverages(deptAvgData);

      // Kurs Ortalamaları
      if (selectedDepartmentIdForCourses) {
          const courseAvgData = await getEntityAverages("COURSE", selectedSemester, facultyId, selectedDepartmentIdForCourses);
          setCourseAverages(courseAvgData);
      } else { // Eğer belirli bir bölüm seçilmemişse, fakültedeki tüm derslerin ortalamalarını göster
          const allFacultyCoursesAvgData = await getEntityAverages("COURSE", selectedSemester, facultyId, undefined);
          setCourseAverages(allFacultyCoursesAvgData);
      }

      // YÖKAK Kriter Ortalamaları
      let parentForCriterionFilter: string | undefined = undefined;
      if (activeCriterionTab === "MAIN_CRITERION" && selectedParentCriterionHeaderId) {
          parentForCriterionFilter = selectedParentCriterionHeaderId;
      } else if (activeCriterionTab === "SUB_CRITERION" && selectedParentCriterionId) {
          parentForCriterionFilter = selectedParentCriterionId;
      }
      const critAvgData = await getCriterionAverages(activeCriterionTab || undefined, selectedSemester, facultyId, selectedDepartmentIdForCourses || undefined, undefined, parentForCriterionFilter);
      setCriterionAverages(critAvgData);
      
      // Soru Bazlı Bölüm Ortalamaları
      if (selectedSurveyIdForQuestion && selectedQuestionId) {
        const questionDeptAvgData = await getQuestionAveragesByDepartment(selectedSurveyIdForQuestion, selectedQuestionId, selectedSemester, facultyId, selectedDepartmentIdForQuestionAnalysis || undefined, undefined);
        setQuestionDepartmentAverages(questionDeptAvgData);
      } else {
        setQuestionDepartmentAverages([]);
      }


    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load dean dashboard data.');
      setOverallAverage(null);
      setDepartmentAverages([]);
      setCourseAverages([]);
      setCriterionAverages([]);
      setQuestionDepartmentAverages([]);
    } finally {
      setLoading(false);
    }
  }, [role, facultyId, selectedSemester, selectedDepartmentIdForCourses, activeCriterionTab, selectedParentCriterionHeaderId, selectedParentCriterionId, selectedSurveyIdForQuestion, selectedQuestionId, selectedDepartmentIdForQuestionAnalysis]);

  useEffect(() => {
    if (role === 'DEAN' && facultyId && selectedSemester) {
      fetchDeanData();
    }
  }, [fetchDeanData, role, facultyId, selectedSemester]);


  const handleCriterionTabChange = (tab: CriterionFilterLevelUi) => {
      setActiveCriterionTab(tab);
      setSelectedParentCriterionId("");
      setSelectedParentCriterionHeaderId("");
      if (tab === "MAIN_CRITERION" && allHeaders.length > 0) setSelectedParentCriterionHeaderId(allHeaders[0].id);
      if (tab === "SUB_CRITERION" && allHeaders.length > 0) {
        setSelectedParentCriterionHeaderId(allHeaders[0].id);
        const filteredMains = allMainCriteria.filter(mc => mc.parentId === allHeaders[0].id);
        if (filteredMains.length > 0) setSelectedParentCriterionId(filteredMains[0].id);
      }
  };
  
  const handleParentCriterionHeaderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const headerId = e.target.value;
      setSelectedParentCriterionHeaderId(headerId);
      setSelectedParentCriterionId("");
      const defaultMain = allMainCriteria.find(mc => mc.parentId === headerId);
      if (defaultMain) {
          setSelectedParentCriterionId(defaultMain.id);
      }
  };

  const handleSurveySelectForQuestion = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const surveyId = e.target.value;
      setSelectedSurveyIdForQuestion(surveyId);
      const survey = surveys.find(s => s.id === surveyId);
      if (survey) {
          setQuestionsOfSelectedSurvey(survey.questions || []);
          if (survey.questions && survey.questions.length > 0) {
              setSelectedQuestionId(survey.questions[0].id);
          } else {
              setSelectedQuestionId("");
          }
      } else {
          setQuestionsOfSelectedSurvey([]);
          setSelectedQuestionId("");
      }
  };

  const formatCriterionLevelDisplay = (level: string) => {
      return level.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getParentCriterionName = (criterionId: string, criterionLevel: "HEADER" | "MAIN_CRITERION" | "SUB_CRITERION") => {
    if (criterionLevel === "SUB_CRITERION") {
        const subCriterion = allSubCriteria.find(sc => sc.id === criterionId);
        if (subCriterion && subCriterion.parentId) {
            const mainCriterion = allMainCriteria.find(mc => mc.id === subCriterion.parentId);
            return mainCriterion ? `${mainCriterion.code} - ${mainCriterion.name}` : "N/A";
        }
    } 
    else if (criterionLevel === "MAIN_CRITERION") {
        const mainCriterion = allMainCriteria.find(mc => mc.id === criterionId);
        if (mainCriterion && mainCriterion.parentId) {
            const headerCriterion = allHeaders.find(h => h.id === mainCriterion.parentId);
            return headerCriterion ? `${headerCriterion.code} - ${headerCriterion.name}` : "N/A";
        }
    }
    return "N/A";
  };


  if (loading && (!overallAverage && departmentAverages.length === 0 && courseAverages.length === 0 && criterionAverages.length === 0 && questionDepartmentAverages.length === 0)) {
    return <div className="flex justify-center items-center h-screen text-lg" style={{ background: BG, color: PRIMARY_BLUE }}>Loading dean data...</div>;
  }

  if (error && !loading) {
    return <div className="flex justify-center items-center h-screen bg-red-100 text-red-700 p-6 rounded-md shadow-md">{error}</div>;
  }

  if (role !== 'DEAN') {
    return <div className="flex justify-center items-center h-screen text-xl font-semibold" style={{ background: BG, color: PRIMARY_BLUE }}>Unauthorized Access</div>;
  }
  
  const departmentChartData = departmentAverages.length > 0 ? {
    labels: departmentAverages.map(d => d.name),
    datasets: [{
      label: `Department Averages`,
      data: departmentAverages.map(d => d.averageScore),
      backgroundColor: generateChartColors(departmentAverages.length).backgroundColors,
      borderColor: generateChartColors(departmentAverages.length).borderColors,
      borderWidth: 1,
      borderRadius: 5,
    }]
  } : null;

  const courseChartData = courseAverages.length > 0 ? {
    labels: courseAverages.map(c => c.name),
    datasets: [{
      label: `Course Averages`,
      data: courseAverages.map(c => c.averageScore),
      backgroundColor: generateChartColors(courseAverages.length).backgroundColors,
      borderColor: generateChartColors(courseAverages.length).borderColors,
      borderWidth: 1,
      borderRadius: 5,
    }]
  } : null;

  const displayedFacultyName = facultyName || (currentUser?.faculty?.name || "Your Faculty");

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-10 px-4" style={{ background: BG }}>
      <div className="w-full max-w-7xl">
        <h1 className="text-3xl font-bold mb-2 text-center" style={{ color: PRIMARY_BLUE }}>
          Dean Dashboard
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Welcome, {currentUser?.name || 'Dean'}! ({displayedFacultyName})
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow p-4 border" style={{ borderColor: BORDER_COLOR }}>
                <label htmlFor="semester-select-dean" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Semester:
                </label>
                <select
                    id="semester-select-dean"
                    value={selectedSemester}
                    onChange={(e) => {
                        setSelectedSemester(e.target.value);
                        setSelectedDepartmentIdForCourses("");
                        setSelectedDepartmentIdForQuestionAnalysis("");
                        setCourseAverages([]);
                        setCriterionAverages([]);
                        setQuestionDepartmentAverages([]);
                    }}
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
            <div className="bg-white rounded-xl shadow p-4 border" style={{ borderColor: BORDER_COLOR }}>
                <label htmlFor="department-select-courses-dean" className="block text-sm font-medium text-gray-700 mb-1">
                    Filter Course/Criterion Analysis by Department (Optional):
                </label>
                <select
                    id="department-select-courses-dean"
                    value={selectedDepartmentIdForCourses}
                    onChange={(e) => setSelectedDepartmentIdForCourses(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#21409a] outline-none bg-white"
                    disabled={allDepartments.length === 0 || loading || !selectedSemester}
                >
                    <option value="">All Departments in Faculty</option>
                    {allDepartments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                        {dept.name}
                    </option>
                    ))}
                </select>
            </div>
        </div>

        {loading && (overallAverage || departmentAverages.length > 0 || courseAverages.length > 0) && 
            <p className="text-center text-gray-500 my-4">Updating data for {selectedSemester}...
        </p>}

        {overallAverage ? (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border text-center" style={{ borderColor: BORDER_COLOR }}>
            <h2 className="text-xl font-semibold mb-2" style={{ color: PRIMARY_BLUE }}>
              {displayedFacultyName} - Overall Survey Average ({selectedSemester})
            </h2>
            <p className="text-4xl font-bold text-gray-800">
              {overallAverage.averageScore ? overallAverage.averageScore.toFixed(2) : 'N/A'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Based on {overallAverage.totalSubmissions} submissions.
            </p>
          </div>
        ) : (
            !loading && <p className="text-center text-gray-500 my-8">No overall average data available for {displayedFacultyName} in {selectedSemester}.</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {departmentChartData ? (
            <div className="bg-white rounded-xl shadow-lg p-6 border" style={{ borderColor: BORDER_COLOR }}>
                <h2 className="text-xl font-semibold mb-4 text-center" style={{ color: PRIMARY_BLUE }}>
                Department Averages in {displayedFacultyName} ({selectedSemester})
                </h2>
                <div style={{ height: '350px' }} className="relative">
                <Bar options={commonChartOptions(`Department Averages`, 'Departments')} data={departmentChartData} />
                </div>
            </div>
            ) : (
                !loading && <div className="bg-white rounded-xl shadow-lg p-6 border text-center text-gray-500 flex items-center justify-center" style={{ borderColor: BORDER_COLOR, height: '398px' }}><p>No department average data for {displayedFacultyName} in {selectedSemester}.</p></div>
            )}

            {courseChartData && (selectedDepartmentIdForCourses || courseAverages.length > 0) ? (
                <div className="bg-white rounded-xl shadow-lg p-6 border" style={{ borderColor: BORDER_COLOR }}>
                    <h2 className="text-xl font-semibold mb-4 text-center" style={{ color: PRIMARY_BLUE }}>
                    Course Averages in {selectedDepartmentIdForCourses ? (allDepartments.find(d => d.id === selectedDepartmentIdForCourses)?.name || '') : displayedFacultyName} ({selectedSemester})
                    </h2>
                    <div style={{ height: '350px' }} className="relative">
                    <Bar options={commonChartOptions(`Course Averages`, 'Courses')} data={courseChartData} />
                    </div>
                </div>
            ) : !loading ? (
                 <div className="bg-white rounded-xl shadow-lg p-6 border text-center text-gray-500 flex items-center justify-center" style={{ borderColor: BORDER_COLOR, height: '398px' }}>
                    <p>
                        {selectedDepartmentIdForCourses 
                            ? `No course average data for the selected department in ${selectedSemester}.`
                            : `No course average data available for ${displayedFacultyName} in ${selectedSemester}. Select a department to see specific course averages.`
                        }
                    </p>
                </div>
            ) : null}
        </div>
        
        {/* YÖKAK Kriter Ortalamaları */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 w-full border" style={{ borderColor: BORDER_COLOR }}>
          <h2 className="text-xl font-semibold mb-4 text-[#21409a] border-b pb-2" style={{ borderColor: BORDER_COLOR }}>
            YÖKAK Criteria Averages for {selectedDepartmentIdForCourses ? (allDepartments.find(d => d.id === selectedDepartmentIdForCourses)?.name || '') : displayedFacultyName} ({selectedSemester})
            </h2>
          <div className="flex justify-center mb-4">
            {(["HEADER", "MAIN_CRITERION", "SUB_CRITERION"] as CriterionFilterLevelUi[]).map(level => (
                <button 
                key={level}
                onClick={() => handleCriterionTabChange(level)} 
                className={`px-3 py-1.5 text-xs font-medium ${activeCriterionTab === level ? 'bg-[#21409a] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} ${level === "HEADER" ? 'rounded-l-md' : level === "SUB_CRITERION" ? 'rounded-r-md' : ''}`}
                >
                {formatCriterionLevelDisplay(level)}
                </button>
            ))}
          </div>
          {(activeCriterionTab === "MAIN_CRITERION" || activeCriterionTab === "SUB_CRITERION") && (
              <div className="mb-3">
                  <label className="block text-gray-700 text-xs font-semibold mb-1">Filter by Parent Header:</label>
                  <select
                      value={selectedParentCriterionHeaderId}
                      onChange={handleParentCriterionHeaderChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-[#21409a] outline-none bg-white"
                      disabled={allHeaders.length === 0}
                  >
                      <option value="">All Headers</option>
                      {allHeaders.map(header => ( <option key={header.id} value={header.id}>{header.code} - {header.name}</option> ))}
                  </select>
              </div>
          )}
          {activeCriterionTab === "SUB_CRITERION" && (
              <div className="mb-3">
                  <label className="block text-gray-700 text-xs font-semibold mb-1">Filter by Parent Main Criterion:</label>
                  <select
                      value={selectedParentCriterionId}
                      onChange={(e) => setSelectedParentCriterionId(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-[#21409a] outline-none bg-white"
                      disabled={!selectedParentCriterionHeaderId || allMainCriteria.filter(mc => mc.parentId === selectedParentCriterionHeaderId).length === 0}
                  >
                      <option value="">All Main Criteria</option>
                      {allMainCriteria.filter(mc => mc.parentId === selectedParentCriterionHeaderId).map(main => ( <option key={main.id} value={main.id}>{main.code} - {main.name}</option> ))}
                  </select>
              </div>
          )}
          {criterionAverages.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: BORDER_COLOR }}>
              <table className="min-w-full bg-white text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Code</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Name</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Level</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Avg. Score</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Answers</th>
                    {activeCriterionTab !== "HEADER" && ( <th className="py-2 px-3 text-left font-semibold text-gray-600">Parent</th> )}
                  </tr>
                </thead>
                <tbody>
                  {criterionAverages.map((criterion, index) => (
                    <tr key={criterion.criterionId} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                      <td className="py-1.5 px-3 border-b border-gray-100">{criterion.criterionCode}</td>
                      <td className="py-1.5 px-3 border-b border-gray-100">{criterion.criterionName}</td>
                      <td className="py-1.5 px-3 border-b border-gray-100">{formatCriterionLevelDisplay(criterion.criterionLevel)}</td>
                      <td className="py-1.5 px-3 border-b border-gray-100">{criterion.averageScore ? criterion.averageScore.toFixed(2) : "N/A"}</td>
                      <td className="py-1.5 px-3 border-b border-gray-100">{criterion.totalAnswers || 0}</td>
                      {activeCriterionTab !== "HEADER" && (
                         <td className="py-1.5 px-3 border-b border-gray-100">
                           {criterion.criterionLevel === "SUB_CRITERION" ? getParentCriterionName(criterion.criterionId, "SUB_CRITERION") : 
                            criterion.criterionLevel === "MAIN_CRITERION" ? getParentCriterionName(criterion.criterionId, "MAIN_CRITERION") : "N/A"}
                         </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !loading && <p className="text-gray-600 text-center py-4">No YÖKAK criteria data for current filters.</p>
          )}
        </div>

        {/* Soru Bazlı Bölüm Ortalamaları */}
        <div className="bg-white rounded-xl shadow-lg p-6 w-full border" style={{ borderColor: BORDER_COLOR }}>
          <h2 className="text-xl font-semibold mb-4 text-[#21409a] border-b pb-2" style={{ borderColor: BORDER_COLOR }}>
            Question Averages by Department within {displayedFacultyName} ({selectedSemester})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-gray-700 text-xs font-semibold mb-1">Select Survey:</label>
              <select value={selectedSurveyIdForQuestion} onChange={handleSurveySelectForQuestion} className="w-full p-2 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-[#21409a]" disabled={surveys.length === 0}>
                {surveys.map(survey => ( <option key={survey.id} value={survey.id}>{survey.title}</option> ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-xs font-semibold mb-1">Select Question:</label>
              <select value={selectedQuestionId} onChange={(e) => setSelectedQuestionId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-[#21409a]" disabled={!selectedSurveyIdForQuestion || questionsOfSelectedSurvey.length === 0}>
                {questionsOfSelectedSurvey.map(q => ( <option key={q.id} value={q.id}>{q.questionText.substring(0,50)}...</option> ))}
              </select>
            </div>
             <div>
                <label className="block text-gray-700 text-xs font-semibold mb-1">Filter by Department (Optional):</label>
                <select
                    value={selectedDepartmentIdForQuestionAnalysis}
                    onChange={(e) => setSelectedDepartmentIdForQuestionAnalysis(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#21409a] outline-none bg-white"
                    disabled={allDepartments.length === 0 || loading || !selectedSemester}
                >
                    <option value="">All Departments in Faculty</option>
                    {allDepartments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                        {dept.name}
                    </option>
                    ))}
                </select>
            </div>
          </div>
          {questionDepartmentAverages.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: BORDER_COLOR }}>
              <table className="min-w-full bg-white text-xs">
                 <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Department</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Avg. Score</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Total Answers</th>
                  </tr>
                </thead>
                <tbody>
                  {questionDepartmentAverages.map((avg, index) => (
                    <tr key={avg.departmentId} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                      <td className="py-1.5 px-3 border-b border-gray-100">{avg.departmentName}</td>
                      <td className="py-1.5 px-3 border-b border-gray-100">{avg.averageScore ? avg.averageScore.toFixed(2) : "N/A"}</td>
                      <td className="py-1.5 px-3 border-b border-gray-100">{avg.totalAnswers || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !loading && <p className="text-gray-600 text-center py-4">Select a survey and question to see department averages, or no data for current filters.</p>
          )}
        </div>
        
        {!overallAverage && !departmentAverages.length && !courseAverages.length && !criterionAverages.length && !questionDepartmentAverages.length && !loading && !error && selectedSemester && (
            <p className="text-center text-gray-500 mt-10">
                No analysis data found for {displayedFacultyName} in {selectedSemester}.
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

export default DeanDashboard;