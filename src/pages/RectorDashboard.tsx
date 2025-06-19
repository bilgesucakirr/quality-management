// src/pages/RectorDashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../store/AuthStore";
import { useNavigate, Link } from "react-router-dom"; // Link eklendi
import {
  getOverallAverage,
  getEntityAverages,
  getCriterionAverages,
  getQuestionAveragesByDepartment, 
} from "../api/AnalysisService";
import { getAllFaculties } from "../api/FacultyService";
import { getAllDepartments } from "../api/DepartmentService";
import { getAllCourses } from "../api/CourseService";
import { getYokakCriteriaByLevel } from "../api/YokakCriterionService";
import { getAllSurveys } from "../api/SurveyService"; 
import type { 
  OverallAverageResponse,
  EntityAverageResponse,
  CriterionAverageResponse,
  QuestionAverageByDepartmentResponse, 
} from "../types/Analysis";
import type { Faculty, Department } from "../types/University";
import type { Course } from "../types/Course";
import type { YokakCriterionResponse } from "../types/YokakCriterion";
import type { SurveyDto, QuestionResponse } from "../types/Survey"; 
import { BarChartBig } from 'lucide-react';

const BG = "#f8f9fb";
const BORDER_COLOR = "#e5eaf8";
const PRIMARY_BLUE = "#21409a";

type FilterLevel = "" | "FACULTY" | "DEPARTMENT" | "COURSE";
type CriterionFilterLevelUi = "" | "HEADER" | "MAIN_CRITERION" | "SUB_CRITERION";

const RectorDashboard: React.FC = () => {
  const { role } = useAuthStore();
  const navigate = useNavigate();

  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const [availableSemesters, setAvailableSemesters] = useState<string[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allHeaders, setAllHeaders] = useState<YokakCriterionResponse[]>([]);
  const [allMainCriteria, setAllMainCriteria] = useState<YokakCriterionResponse[]>([]);
  const [allSubCriteria, setAllSubCriteria] = useState<YokakCriterionResponse[]>([]);

  const [overallAverage, setOverallAverage] = useState<OverallAverageResponse | null>(null);
  const [entityAverages, setEntityAverages] = useState<EntityAverageResponse[]>([]);
  const [criterionAverages, setCriterionAverages] = useState<CriterionAverageResponse[]>([]);
  const [questionDepartmentAverages, setQuestionDepartmentAverages] = useState<QuestionAverageByDepartmentResponse[]>([]); 

  const [surveys, setSurveys] = useState<SurveyDto[]>([]);
  const [selectedSurveyIdForQuestionAnalysis, setSelectedSurveyIdForQuestionAnalysis] = useState<string>("");
  const [questionsOfSelectedSurvey, setQuestionsOfSelectedSurvey] = useState<QuestionResponse[]>([]); 
  const [selectedQuestionIdForQuestionAnalysis, setSelectedQuestionIdForQuestionAnalysis] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<FilterLevel>("FACULTY");
  const [activeCriterionTab, setActiveCriterionTab] = useState<CriterionFilterLevelUi>("SUB_CRITERION");
  const [selectedParentCriterionId, setSelectedParentCriterionId] = useState<string>("");
  const [selectedParentCriterionHeaderId, setSelectedParentCriterionHeaderId] = useState<string>("");

  useEffect(() => {
    if (role !== "RECTOR" && role !== "ADMIN") { // ADMIN de bu sayfayı görebilir
      setError("You are not authorized to view this page.");
      navigate("/dashboard"); // veya uygun bir yönlendirme
      return;
    }

    const fetchDropdownData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          surveyData, 
          facultyData,
          departmentData,
          courseData,
          headerCriteria,
          mainCriteria,
          subCriteria
        ] = await Promise.all([
          getAllSurveys(), 
          getAllFaculties(),
          getAllDepartments(),
          getAllCourses(),
          getYokakCriteriaByLevel("HEADER"),
          getYokakCriteriaByLevel("MAIN_CRITERION"),
          getYokakCriteriaByLevel("SUB_CRITERION")
        ]);

        setSurveys(surveyData); 
        setFaculties(facultyData);
        setDepartments(departmentData);
        setCourses(courseData);
        setAllHeaders(headerCriteria);
        setAllMainCriteria(mainCriteria);
        setAllSubCriteria(subCriteria);

        const semestersSet = new Set<string>();
        courseData.forEach(course => semestersSet.add(course.semester));
        
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
        
        if (uniqueSemesters.length > 0) setSelectedSemester(uniqueSemesters[0]);
        
        if (surveyData.length > 0) { 
            setSelectedSurveyIdForQuestionAnalysis(surveyData[0].id);
            setQuestionsOfSelectedSurvey(surveyData[0].questions || []);
            if (surveyData[0].questions && surveyData[0].questions.length > 0) {
                setSelectedQuestionIdForQuestionAnalysis(surveyData[0].questions[0].id);
            }
        }
        
        if(headerCriteria.length > 0) setSelectedParentCriterionHeaderId(headerCriteria[0].id);
        if(mainCriteria.length > 0) {
            const filteredMains = mainCriteria.filter(mc => mc.parentId === (headerCriteria[0]?.id || ""));
            if (filteredMains.length > 0) setSelectedParentCriterionId(filteredMains[0].id);
        }


      } catch (err) {
        setError("Failed to load initial data for filters.");
      } finally {
        setLoading(false);
      }
    };
    fetchDropdownData();
  }, [role, navigate]);

  const fetchAnalysisData = useCallback(async () => {
    if (!selectedSemester && availableSemesters.length > 0) { // Eğer dönem seçilmemişse ve mevcut dönemler varsa, ilkini seç
        setSelectedSemester(availableSemesters[0]);
        return; // fetchAnalysisData'nın yeniden tetiklenmesini bekle
    }
    if (!selectedSemester) return; // Hala dönem yoksa bir şey yapma

    setLoading(true);
    setError(null);
    try {
      const overall = await getOverallAverage(
        selectedSemester || undefined,
        selectedFacultyId || undefined,
        selectedDepartmentId || undefined,
        selectedCourseId || undefined
      );
      setOverallAverage(overall);

      let fetchedEntityAverages: EntityAverageResponse[] = [];
      if(activeAnalysisTab === "FACULTY") {
          fetchedEntityAverages = await getEntityAverages("FACULTY", selectedSemester || undefined);
      } else if(activeAnalysisTab === "DEPARTMENT") {
          fetchedEntityAverages = await getEntityAverages("DEPARTMENT", selectedSemester || undefined, selectedFacultyId || undefined);
      } else if(activeAnalysisTab === "COURSE") {
          fetchedEntityAverages = await getEntityAverages("COURSE", selectedSemester || undefined, selectedFacultyId || undefined, selectedDepartmentId || undefined);
      }
      setEntityAverages(fetchedEntityAverages);
      
      let parentForCriterionFilter: string | undefined = undefined;
      if (activeCriterionTab === "MAIN_CRITERION" && selectedParentCriterionHeaderId) {
          parentForCriterionFilter = selectedParentCriterionHeaderId;
      } else if (activeCriterionTab === "SUB_CRITERION" && selectedParentCriterionId) {
          parentForCriterionFilter = selectedParentCriterionId;
      }

      const criterionAnalysis = await getCriterionAverages(
        activeCriterionTab || undefined,
        selectedSemester || undefined,
        selectedFacultyId || undefined,
        selectedDepartmentId || undefined,
        selectedCourseId || undefined,
        parentForCriterionFilter
      );
      setCriterionAverages(criterionAnalysis);

      if (selectedSurveyIdForQuestionAnalysis && selectedQuestionIdForQuestionAnalysis) {
        const questionDeptAvg = await getQuestionAveragesByDepartment(
            selectedSurveyIdForQuestionAnalysis,
            selectedQuestionIdForQuestionAnalysis,
            selectedSemester || undefined,
            selectedFacultyId || undefined,
            selectedDepartmentId || undefined,
            selectedCourseId || undefined
        );
        setQuestionDepartmentAverages(questionDeptAvg);
      } else {
        setQuestionDepartmentAverages([]); 
      }

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch analysis data.");
      setOverallAverage(null);
      setEntityAverages([]);
      setCriterionAverages([]);
      setQuestionDepartmentAverages([]); 
    } finally {
      setLoading(false);
    }
  }, [selectedSemester, selectedFacultyId, selectedDepartmentId, selectedCourseId, activeAnalysisTab, activeCriterionTab, selectedParentCriterionId, selectedParentCriterionHeaderId, selectedSurveyIdForQuestionAnalysis, selectedQuestionIdForQuestionAnalysis, availableSemesters]);

  useEffect(() => {
    if (role === "RECTOR" || role === "ADMIN") {
      fetchAnalysisData();
    }
  }, [fetchAnalysisData, role]);

  const handleFacultyFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const facultyId = e.target.value;
    setSelectedFacultyId(facultyId);
    setSelectedDepartmentId("");
    setSelectedCourseId("");
  };

  const handleDepartmentFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const departmentId = e.target.value;
    setSelectedDepartmentId(departmentId);
    setSelectedCourseId("");
  };

  const handleEntityTabChange = (tab: FilterLevel) => {
    setActiveAnalysisTab(tab);
  };

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

  const handleParentCriterionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedParentCriterionId(e.target.value);
  };

  const handleSurveySelectForQuestionAnalysis = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const surveyId = e.target.value;
      setSelectedSurveyIdForQuestionAnalysis(surveyId);
      const survey = surveys.find(s => s.id === surveyId);
      if (survey) {
          setQuestionsOfSelectedSurvey(survey.questions || []);
          if (survey.questions && survey.questions.length > 0) {
              setSelectedQuestionIdForQuestionAnalysis(survey.questions[0].id);
          } else {
              setSelectedQuestionIdForQuestionAnalysis("");
          }
      } else {
          setQuestionsOfSelectedSurvey([]);
          setSelectedQuestionIdForQuestionAnalysis("");
      }
  };

  const handleQuestionSelectForQuestionAnalysis = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedQuestionIdForQuestionAnalysis(e.target.value);
  };

  const filteredDepartmentsForDropdown = selectedFacultyId
    ? departments.filter(d => d.facultyId === selectedFacultyId)
    : departments;

  const filteredCoursesForDropdown = selectedDepartmentId
    ? courses.filter(c => c.departmentId === selectedDepartmentId && c.semester === selectedSemester) // Döneme göre de filtrele
    : selectedFacultyId 
        ? courses.filter(c => departments.filter(d => d.facultyId === selectedFacultyId).map(d => d.id).includes(c.departmentId) && c.semester === selectedSemester)
        : courses.filter(c => c.semester === selectedSemester);


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
  
  const formatCriterionLevelDisplay = (level: string) => {
      return level.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (role !== "RECTOR" && role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl text-red-600">Access Denied.</p>
          <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-10 px-2" style={{ background: BG }}>
      <div className="w-full max-w-6xl flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-[#21409a] text-center tracking-tight">
          Rector Dashboard - University-Wide Analysis
        </h1>

        {error && <div className="text-red-600 text-center mb-4 p-3 bg-red-100 border border-red-300 rounded-md">{error}</div>}
        
        <div className="bg-white rounded-xl shadow p-6 mb-8 w-full max-w-5xl border" style={{ borderColor: BORDER_COLOR }}>
          <h2 className="text-xl font-semibold mb-4 text-[#21409a] border-b pb-2" style={{ borderColor: BORDER_COLOR }}>Global Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">Semester:</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition bg-white"
                disabled={loading}
              >
                <option value="">All Semesters</option>
                {availableSemesters.map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">Faculty:</label>
              <select
                value={selectedFacultyId}
                onChange={handleFacultyFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition bg-white"
                disabled={loading}
              >
                <option value="">All Faculties</option>
                {faculties.map(fac => (
                  <option key={fac.id} value={fac.id}>{fac.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">Department:</label>
              <select
                value={selectedDepartmentId}
                onChange={handleDepartmentFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition bg-white"
                disabled={loading || (!selectedFacultyId && departments.length > 0)}
              >
                <option value="">All Departments</option>
                {filteredDepartmentsForDropdown.map(dep => (
                  <option key={dep.id} value={dep.id}>{dep.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">Course:</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition bg-white"
                disabled={loading || (!selectedDepartmentId && courses.length > 0)}
              >
                <option value="">All Courses</option>
                {filteredCoursesForDropdown.map((course: Course) => (
                  <option key={course.id} value={course.id}>{course.courseCode} - {course.courseName}</option>
                ))}
              </select>
            </div>
          </div>
           <div className="mt-6 flex justify-end">
            <Link
              to="/graphical-analysis"
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-md shadow-md transition-all duration-150 flex items-center gap-2"
            >
              <BarChartBig size={18} />
              View Graphical Analysis
            </Link>
          </div>
        </div>
        
        {loading && <div className="text-center text-[#21409a] py-8">Loading analysis data...</div>}

        {!loading && !error && (
          <>
            <div className="bg-white rounded-xl shadow p-6 mb-8 w-full max-w-5xl border" style={{ borderColor: BORDER_COLOR }}>
              <h2 className="text-xl font-semibold mb-4 text-[#21409a] border-b pb-2" style={{ borderColor: BORDER_COLOR }}>Overall Survey Average</h2>
              {overallAverage ? (
                <div className="text-lg text-gray-800">
                  <p>Average Score: <span className="font-bold text-2xl">{overallAverage.averageScore ? overallAverage.averageScore.toFixed(2) : "N/A"}</span></p>
                  <p>Total Submissions: <span className="font-bold text-xl">{overallAverage.totalSubmissions || 0}</span></p>
                  <p className="text-sm text-gray-500 mt-2">{overallAverage.description}</p>
                </div>
              ) : (
                <p className="text-gray-600">No overall average data available for selected filters.</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-6 mb-8 w-full max-w-5xl border" style={{ borderColor: BORDER_COLOR }}>
              <h2 className="text-xl font-semibold mb-4 text-[#21409a] border-b pb-2" style={{ borderColor: BORDER_COLOR }}>Averages by Entity</h2>
              <div className="flex justify-center mb-4">
                {(["FACULTY", "DEPARTMENT", "COURSE"] as FilterLevel[]).map(tab => (
                    <button 
                    key={tab}
                    onClick={() => handleEntityTabChange(tab)} 
                    className={`px-4 py-2 text-sm font-medium ${activeAnalysisTab === tab ? 'bg-[#21409a] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} ${tab === "FACULTY" ? 'rounded-l-md' : tab === "COURSE" ? 'rounded-r-md' : ''}`}
                    >
                    {tab.charAt(0) + tab.slice(1).toLowerCase() + 's'}
                    </button>
                ))}
              </div>
              {entityAverages.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border" style={{ borderColor: BORDER_COLOR }}>
                  <table className="min-w-full bg-white text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-2 px-3 text-left font-semibold text-gray-600">{activeAnalysisTab.charAt(0) + activeAnalysisTab.slice(1).toLowerCase()} Name</th>
                        <th className="py-2 px-3 text-left font-semibold text-gray-600">Average Score</th>
                        <th className="py-2 px-3 text-left font-semibold text-gray-600">Total Submissions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entityAverages.map((entity, index) => (
                        <tr key={entity.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                          <td className="py-1.5 px-3 border-b border-gray-100">{entity.name}</td>
                          <td className="py-1.5 px-3 border-b border-gray-100">{entity.averageScore ? entity.averageScore.toFixed(2) : "N/A"}</td>
                          <td className="py-1.5 px-3 border-b border-gray-100">{entity.totalSubmissions || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No data for {activeAnalysisTab.toLowerCase()} averages with current filters.</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-6 mb-8 w-full max-w-5xl border" style={{ borderColor: BORDER_COLOR }}>
              <h2 className="text-xl font-semibold mb-4 text-[#21409a] border-b pb-2" style={{ borderColor: BORDER_COLOR }}>Averages by YÖKAK Criteria</h2>
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
                <p className="text-gray-600 text-center py-4">No YÖKAK criteria data for current filters.</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-6 w-full max-w-5xl border" style={{ borderColor: BORDER_COLOR }}>
              <h2 className="text-xl font-semibold mb-4 text-[#21409a] border-b pb-2" style={{ borderColor: BORDER_COLOR }}>Question Averages by Department</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-1">Select Survey:</label>
                  <select
                    value={selectedSurveyIdForQuestionAnalysis}
                    onChange={handleSurveySelectForQuestionAnalysis}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition bg-white"
                    disabled={surveys.length === 0 || loading}
                  >
                    <option value="">Select a Survey</option>
                    {surveys.map(survey => (
                      <option key={survey.id} value={survey.id}>{survey.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-1">Select Question:</label>
                  <select
                    value={selectedQuestionIdForQuestionAnalysis}
                    onChange={handleQuestionSelectForQuestionAnalysis}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition bg-white"
                    disabled={!selectedSurveyIdForQuestionAnalysis || questionsOfSelectedSurvey.length === 0 || loading}
                  >
                    <option value="">Select a Question</option>
                    {questionsOfSelectedSurvey.map(question => (
                      <option key={question.id} value={question.id}>{question.questionText.substring(0,70)}...</option>
                    ))}
                  </select>
                </div>
              </div>
              {questionDepartmentAverages.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border" style={{ borderColor: BORDER_COLOR }}>
                  <table className="min-w-full bg-white text-sm">
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
                <p className="text-gray-600 text-center py-4">Please select a survey and question to see department averages, or no data available with current filters.</p>
              )}
            </div>
            {!overallAverage && !entityAverages.length && !criterionAverages.length && !questionDepartmentAverages.length && !loading && !error && selectedSemester && (
                <p className="text-center text-gray-500 mt-10">
                    No analysis data found for the current selections.
                </p>
            )}
            {!selectedSemester && !loading && !error && (
                <p className="text-center text-gray-500 mt-10">
                    Please select a semester to view data.
                </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RectorDashboard;