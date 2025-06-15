// src/pages/AnalysisPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../store/AuthStore";
import { useNavigate } from "react-router-dom";
import {
  getOverallAverage,
  getEntityAverages,
  getCriterionAverages,
} from "../api/AnalysisService";
import { getAllFaculties } from "../api/FacultyService";
import { getAllDepartments } from "../api/DepartmentService";
import { getAllCourses } from "../api/CourseService";
import { getYokakCriteriaByLevel } from "../api/YokakCriterionService";
import type { 
  OverallAverageResponse,
  EntityAverageResponse,
  CriterionAverageResponse,
} from "../types/Analysis";
import type { Faculty, Department } from "../types/University";
import type { Course } from "../types/Course";
import type { YokakCriterionResponse } from "../types/YokakCriterion";

const BG = "#f8f9fb";
const BORDER_COLOR = "#e5eaf8";

type FilterLevel = "" | "FACULTY" | "DEPARTMENT" | "COURSE";
type CriterionFilterLevel = "" | "HEADER" | "MAIN_CRITERION" | "SUB_CRITERION";

const AnalysisPage: React.FC = () => {
  const { role } = useAuthStore();
  const navigate = useNavigate();

  // Filter States
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  // Data for Dropdowns
  const [availableSemesters, setAvailableSemesters] = useState<string[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allHeaders, setAllHeaders] = useState<YokakCriterionResponse[]>([]);
  const [allMainCriteria, setAllMainCriteria] = useState<YokakCriterionResponse[]>([]);
  const [allSubCriteria, setAllSubCriteria] = useState<YokakCriterionResponse[]>([]);

  // Analysis Data States
  const [overallAverage, setOverallAverage] = useState<OverallAverageResponse | null>(null);
  const [entityAverages, setEntityAverages] = useState<EntityAverageResponse[]>([]);
  const [criterionAverages, setCriterionAverages] = useState<CriterionAverageResponse[]>([]);

  // UI State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<FilterLevel>("FACULTY");
  const [activeCriterionTab, setActiveCriterionTab] = useState<CriterionFilterLevel>("SUB_CRITERION");
  const [selectedParentCriterionId, setSelectedParentCriterionId] = useState<string>("");
  const [selectedParentCriterionHeaderId, setSelectedParentCriterionHeaderId] = useState<string>("");

  // --- Initial Data Fetch for Dropdowns ---
  useEffect(() => {
    if (!role || !["ADMIN", "RECTOR", "DEAN", "STAFF"].includes(role)) {
      setError("You are not authorized to view this page.");
      return;
    }

    const fetchDropdownData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          facultyData,
          departmentData,
          courseData,
          headerCriteria,
          mainCriteria,
          subCriteria
        ] = await Promise.all([
          getAllFaculties(),
          getAllDepartments(),
          getAllCourses(),
          getYokakCriteriaByLevel("HEADER"),
          getYokakCriteriaByLevel("MAIN_CRITERION"),
          getYokakCriteriaByLevel("SUB_CRITERION")
        ]);

        setFaculties(facultyData);
        setDepartments(departmentData);
        setCourses(courseData);
        setAllHeaders(headerCriteria);
        setAllMainCriteria(mainCriteria);
        setAllSubCriteria(subCriteria);

        // FIX: Generate semesters for a wider range (e.g., current year - 2 to current year + 2)
        const semesters: string[] = [];
        const currentYear = new Date().getFullYear();
        const startYearForGeneration = currentYear - 2; // Go back 2 years for historical data
        const endYearForGeneration = currentYear + 2;   // Go forward 2 years for future planning

        for (let year = startYearForGeneration; year <= endYearForGeneration; year++) {
            semesters.push(`FALL${String(year).substring(2)}`);
            semesters.push(`SPRING${String(year + 1).substring(2)}`); // Spring is in the *next* calendar year
            semesters.push(`SUMMER${String(year + 1).substring(2)}`); // Summer is in the *next* calendar year
        }

        // Remove duplicates and sort them chronologically
        const uniqueSemesters = Array.from(new Set(semesters));
        uniqueSemesters.sort((a, b) => {
            const getSemesterOrder = (s: string) => {
                const yearPart = parseInt(s.substring(s.length - 2));
                const typePart = s.substring(0, s.length - 2);
                let order = yearPart * 100; // Base on year, multiplied to make space for semester types

                if (typePart === "FALL") order += 1; // FALL is typically the first in an academic year
                else if (typePart === "SPRING") order += 2;
                else if (typePart === "SUMMER") order += 3;
                return order;
            };
            return getSemesterOrder(a) - getSemesterOrder(b);
        });
        setAvailableSemesters(uniqueSemesters);
        
        // Set default to the latest semester available in the list
        if (uniqueSemesters.length > 0) {
            setSelectedSemester(uniqueSemesters[uniqueSemesters.length - 1]);
        } else {
            setSelectedSemester("");
        }

        if (facultyData.length > 0) setSelectedFacultyId(facultyData[0].id);
        else setSelectedFacultyId("");
        if (departmentData.length > 0) setSelectedDepartmentId(departmentData[0].id);
        else setSelectedDepartmentId("");
        if (courseData.length > 0) setSelectedCourseId(courseData[0].id);
        else setSelectedCourseId("");
        
        if(headerCriteria.length > 0) setSelectedParentCriterionHeaderId(headerCriteria[0].id);
        else setSelectedParentCriterionHeaderId("");
        if(mainCriteria.length > 0) setSelectedParentCriterionId(mainCriteria[0].id);
        else setSelectedParentCriterionId("");

      } catch (err) {
        setError("Failed to load initial data for filters.");
      } finally {
        setLoading(false);
      }
    };
    fetchDropdownData();
  }, [role, navigate]);

  // --- Data Fetch for Analysis Results ---
  const fetchAnalysisData = useCallback(async () => {
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

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch analysis data.");
      setOverallAverage(null);
      setEntityAverages([]);
      setCriterionAverages([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSemester, selectedFacultyId, selectedDepartmentId, selectedCourseId, activeAnalysisTab, activeCriterionTab, selectedParentCriterionId, selectedParentCriterionHeaderId, role]);

  // --- Trigger Data Fetch on Filter Change ---
  useEffect(() => {
    if (role && ["ADMIN", "RECTOR", "DEAN", "STAFF"].includes(role)) {
      fetchAnalysisData();
    }
  }, [fetchAnalysisData, role]);

  // --- Filter and Tab Change Handlers ---
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
    setEntityAverages([]);
  };

  const handleCriterionTabChange = (tab: CriterionFilterLevel) => {
      setActiveCriterionTab(tab);
      setSelectedParentCriterionId("");
      setSelectedParentCriterionHeaderId("");
      setCriterionAverages([]);
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

  // --- Filtered Dropdown Options ---
  const filteredDepartments = selectedFacultyId
    ? departments.filter(d => d.facultyId === selectedFacultyId)
    : departments;

  const filteredCourses = selectedDepartmentId
    ? courses.filter(c => c.departmentId === selectedDepartmentId)
    : courses;

  // Helper to correctly get parent name based on criterionId and its level in the hierarchy
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
  
  // Helper to correctly display criterion level string
  const formatCriterionLevel = (level: string) => {
      return level.replace('_', ' ');
  };


  // --- Access Control ---
  if (!role || !["ADMIN", "RECTOR", "DEAN", "STAFF"].includes(role)) {
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
          Analysis & Reports
        </h1>

        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        {loading && <div className="text-center text-[#21409a]">Loading analysis data...</div>}

        {/* --- Global Filters Section --- */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 w-full max-w-4xl border" style={{ borderColor: BORDER_COLOR }}>
          <h2 className="text-xl font-semibold mb-4 text-[#21409a] border-b pb-2" style={{ borderColor: BORDER_COLOR }}>Global Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">Semester:</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition bg-white"
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
                disabled={!selectedFacultyId && departments.length === 0}
              >
                <option value="">All Departments</option>
                {filteredDepartments.map(dep => (
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
                disabled={!selectedDepartmentId && courses.length === 0}
              >
                <option value="">All Courses</option>
                {filteredCourses.map(course => (
                  <option key={course.id} value={course.id}>{course.courseCode} - {course.courseName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* --- Overall Average Section --- */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 w-full max-w-4xl border" style={{ borderColor: BORDER_COLOR }}>
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

        {/* --- Entity Averages Section (Tabs for Faculty, Department, Course) --- */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 w-full max-w-4xl border" style={{ borderColor: BORDER_COLOR }}>
          <h2 className="text-xl font-semibold mb-4 text-[#21409a] border-b pb-2" style={{ borderColor: BORDER_COLOR }}>Averages by Entity</h2>
          
          {/* Entity Type Tabs */}
          <div className="flex justify-center mb-4">
            <button 
              onClick={() => handleEntityTabChange("FACULTY")} 
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${activeAnalysisTab === "FACULTY" ? 'bg-[#21409a] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Faculties
            </button>
            <button 
              onClick={() => handleEntityTabChange("DEPARTMENT")} 
              className={`px-4 py-2 text-sm font-medium ${activeAnalysisTab === "DEPARTMENT" ? 'bg-[#21409a] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Departments
            </button>
            <button 
              onClick={() => handleEntityTabChange("COURSE")} 
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${activeAnalysisTab === "COURSE" ? 'bg-[#21409a] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Courses
            </button>
          </div>

          {/* Entity Averages Table */}
          {entityAverages.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: BORDER_COLOR }}>
              <table className="min-w-full bg-white text-sm">
                <thead>
                  <tr>
                    <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">{activeAnalysisTab.charAt(0).toUpperCase() + activeAnalysisTab.slice(1).toLowerCase()} Name</th>
                    <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Average Score</th>
                    <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Total Submissions</th>
                  </tr>
                </thead>
                <tbody>
                  {entityAverages.map((entity, index) => (
                    <tr key={entity.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                      <td className="py-2 px-4 border-b border-gray-100">{entity.name}</td>
                      <td className="py-2 px-4 border-b border-gray-100">{entity.averageScore ? entity.averageScore.toFixed(2) : "N/A"}</td>
                      <td className="py-2 px-4 border-b border-gray-100">{entity.totalSubmissions || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center">No data for {activeAnalysisTab.toLowerCase()} averages with current filters.</p>
          )}
        </div>

        {/* --- YÖKAK Criterion Averages Section --- */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 w-full max-w-4xl border" style={{ borderColor: BORDER_COLOR }}>
          <h2 className="text-xl font-semibold mb-4 text-[#21409a] border-b pb-2" style={{ borderColor: BORDER_COLOR }}>Averages by YÖKAK Criteria</h2>
          
          {/* Criterion Level Tabs */}
          <div className="flex justify-center mb-4">
            <button 
              onClick={() => handleCriterionTabChange("HEADER")} 
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${activeCriterionTab === "HEADER" ? 'bg-[#21409a] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Headers
            </button>
            <button 
              onClick={() => handleCriterionTabChange("MAIN_CRITERION")} 
              className={`px-4 py-2 text-sm font-medium ${activeCriterionTab === "MAIN_CRITERION" ? 'bg-[#21409a] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Main Criteria
            </button>
            <button 
              onClick={() => handleCriterionTabChange("SUB_CRITERION")} 
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${activeCriterionTab === "SUB_CRITERION" ? 'bg-[#21409a] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Sub Criteria
            </button>
          </div>

          {/* Parent Criterion Filter for Criterion Averages */}
          {(activeCriterionTab === "MAIN_CRITERION" || activeCriterionTab === "SUB_CRITERION") && (
              <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-1">Filter by Parent Header:</label>
                  <select
                      value={selectedParentCriterionHeaderId}
                      onChange={handleParentCriterionHeaderChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition bg-white"
                      disabled={allHeaders.length === 0}
                  >
                      <option value="">All Headers</option>
                      {allHeaders.map(header => (
                          <option key={header.id} value={header.id}>{header.code} - {header.name}</option>
                      ))}
                  </select>
              </div>
          )}

          {activeCriterionTab === "SUB_CRITERION" && (
              <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-1">Filter by Parent Main Criterion:</label>
                  <select
                      value={selectedParentCriterionId}
                      onChange={handleParentCriterionChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition bg-white"
                      disabled={!selectedParentCriterionHeaderId || allMainCriteria.filter(mc => mc.parentId === selectedParentCriterionHeaderId).length === 0}
                  >
                      <option value="">All Main Criteria</option>
                      {allMainCriteria.filter(mc => mc.parentId === selectedParentCriterionHeaderId).map(main => (
                          <option key={main.id} value={main.id}>{main.code} - {main.name}</option>
                      ))}
                  </select>
              </div>
          )}


          {/* Criterion Averages Table */}
          {criterionAverages.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: BORDER_COLOR }}>
              <table className="min-w-full bg-white text-sm">
                <thead>
                  <tr>
                    <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Code</th>
                    <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Name</th>
                    <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Level</th>
                    <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Average Score</th>
                    <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Total Answers</th>
                    {activeCriterionTab !== "HEADER" && (
                       <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Parent</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {criterionAverages.map((criterion, index) => (
                    <tr key={criterion.criterionId} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                      <td className="py-2 px-4 border-b border-gray-100">{criterion.criterionCode}</td>
                      <td className="py-2 px-4 border-b border-gray-100">{criterion.criterionName}</td>
                      <td className="py-2 px-4 border-b border-gray-100">{formatCriterionLevel(criterion.criterionLevel)}</td>
                      <td className="py-2 px-4 border-b border-gray-100">{criterion.averageScore ? criterion.averageScore.toFixed(2) : "N/A"}</td>
                      <td className="py-2 px-4 border-b border-gray-100">{criterion.totalAnswers || 0}</td>
                      {activeCriterionTab !== "HEADER" && (
                         <td className="py-2 px-4 border-b border-gray-100">
                           {/* FIX: Corrected parent rendering logic based on criterion.criterionLevel */}
                           {criterion.criterionLevel === "SUB_CRITERION" ? 
                               getParentCriterionName(criterion.criterionId, "MAIN_CRITERION") : // Sub-criterion'ın parent'ı Main-criterion'dır
                               criterion.criterionLevel === "MAIN_CRITERION" ?
                                   getParentCriterionName(criterion.criterionId, "HEADER") : // Main-criterion'ın parent'ı Header'dır
                                   "N/A"
                           }
                         </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center">No data for {activeCriterionTab.toLowerCase()} averages with current filters.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;