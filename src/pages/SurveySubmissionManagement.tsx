// src/pages/SurveySubmissionManagement.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../store/AuthStore";
import { useNavigate } from "react-router-dom";
import {
  getAllSubmissions,
  deleteSubmission,
  updateSubmission,
  bulkUpdateSubmissions, // NEW: Import bulkUpdateSubmissions
} from "../api/SurveySubmissionService";
import { getAllSurveys } from "../api/SurveyService";
import { getAllFaculties } from "../api/FacultyService";
import { getAllDepartments } from "../api/DepartmentService";
import { getAllCourses } from "../api/CourseService";

import type { SurveySubmissionResponse, UpdateSubmissionRequest, BulkSubmissionUpdateRequest } from "../types/Submission"; // NEW: BulkSubmissionUpdateRequest import
import type { SurveyDto } from "../types/Survey";
import type { Faculty } from "../types/University";
import type { Department } from "../types/Department";
import type { Course } from "../types/Course";

const BG = "#f8f9fb";
const PRIMARY_BLUE = "#21409a";
const BORDER_COLOR = "#e5eaf8";

const SurveySubmissionManagement: React.FC = () => {
  const { role } = useAuthStore();
  const navigate = useNavigate();

  // Filter States
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  // Dropdown Data
  const [surveys, setSurveys] = useState<SurveyDto[]>([]);
  const [availableSemesters, setAvailableSemesters] = useState<string[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Submissions Data
  const [submissions, setSubmissions] = useState<SurveySubmissionResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Edit States for single submission
  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(null);
  const [editSemester, setEditSemester] = useState<string>("");
  const [editFacultyId, setEditFacultyId] = useState<string>("");
  const [editDepartmentId, setEditDepartmentId] = useState<string>("");
  const [editCourseId, setEditCourseId] = useState<string>("");

  // NEW: Bulk Update States
  const [bulkUpdateCourseId, setBulkUpdateCourseId] = useState<string>("");
  const [bulkUpdateOldSemester, setBulkUpdateOldSemester] = useState<string>("");
  const [bulkUpdateNewSemester, setBulkUpdateNewSemester] = useState<string>("");
  const [bulkUpdateMessage, setBulkUpdateMessage] = useState<string | null>(null);
  const [bulkUpdateError, setBulkUpdateError] = useState<string | null>(null);


  // --- Initial Data Fetch for Dropdowns ---
  useEffect(() => {
    if (!role || !["ADMIN", "STAFF"].includes(role)) {
      setError("You are not authorized to view this page.");
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
        ] = await Promise.all([
          getAllSurveys(),
          getAllFaculties(),
          getAllDepartments(),
          getAllCourses(),
        ]);

        setSurveys(surveyData);
        setFaculties(facultyData);
        setDepartments(departmentData);
        setCourses(courseData);

        const semesters: string[] = [];
        const currentYear = new Date().getFullYear();
        const startYearForGeneration = currentYear - 2;
        const endYearForGeneration = currentYear + 2;

        for (let year = startYearForGeneration; year <= endYearForGeneration; year++) {
            semesters.push(`FALL${String(year).substring(2)}`);
            semesters.push(`SPRING${String(year + 1).substring(2)}`);
            semesters.push(`SUMMER${String(year + 1).substring(2)}`);
        }
        const uniqueSemesters = Array.from(new Set(semesters));
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
            return getSemesterOrder(a) - getSemesterOrder(b);
        });
        setAvailableSemesters(uniqueSemesters);
        
        if (surveyData.length > 0) setSelectedSurveyId(surveyData[0].id);
        else setSelectedSurveyId("");
        if (uniqueSemesters.length > 0) {
            setSelectedSemester(uniqueSemesters[uniqueSemesters.length - 1]);
            setBulkUpdateOldSemester(uniqueSemesters[uniqueSemesters.length - 1]); // Default for bulk old semester
            setBulkUpdateNewSemester(uniqueSemesters[uniqueSemesters.length - 1]); // Default for bulk new semester
        } else {
            setSelectedSemester("");
            setBulkUpdateOldSemester("");
            setBulkUpdateNewSemester("");
        }

        if (facultyData.length > 0) setSelectedFacultyId(facultyData[0].id);
        else setSelectedFacultyId("");
        if (departmentData.length > 0) setSelectedDepartmentId(departmentData[0].id);
        else setSelectedDepartmentId("");
        if (courseData.length > 0) {
            setSelectedCourseId(courseData[0].id);
            setBulkUpdateCourseId(courseData[0].id); // Default for bulk course ID
        }
        else {
            setSelectedCourseId("");
            setBulkUpdateCourseId("");
        }

      } catch (err) {
        setError("Failed to load initial data for filters.");
      } finally {
        setLoading(false);
      }
    };
    fetchDropdownData();
  }, [role, navigate]);

  // --- Data Fetch for Submissions ---
  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedSubmissions = await getAllSubmissions(
        selectedSurveyId || undefined,
        selectedSemester || undefined,
        selectedFacultyId || undefined,
        selectedDepartmentId || undefined,
        selectedCourseId || undefined
      );
      setSubmissions(fetchedSubmissions);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch submissions.");
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSurveyId, selectedSemester, selectedFacultyId, selectedDepartmentId, selectedCourseId, role]);

  // --- Trigger Data Fetch on Filter Change ---
  useEffect(() => {
    if (role && ["ADMIN", "STAFF"].includes(role)) {
      fetchSubmissions();
    }
  }, [fetchSubmissions, role]);

  // --- Filter Handlers ---
  const handleFacultyFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFacultyId(e.target.value);
    setSelectedDepartmentId("");
    setSelectedCourseId("");
  };

  const handleDepartmentFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartmentId(e.target.value);
    setSelectedCourseId("");
  };

  // --- Delete Submission ---
  const handleDeleteSubmission = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this submission? This action cannot be undone.")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteSubmission(id);
      alert("Submission deleted successfully!");
      fetchSubmissions();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to delete submission.");
    } finally {
      setLoading(false);
    }
  };

  // --- Edit Submission Handlers ---
  const handleStartEdit = (submission: SurveySubmissionResponse) => {
    setEditingSubmissionId(submission.id);
    setEditSemester(submission.semester);
    setEditFacultyId(submission.facultyId);
    setEditDepartmentId(submission.departmentId);
    setEditCourseId(submission.courseId);
  };

  const handleCancelEdit = () => {
    setEditingSubmissionId(null);
    setEditSemester("");
    setEditFacultyId("");
    setEditDepartmentId("");
    setEditCourseId("");
  };

  const handleSaveEdit = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const request: UpdateSubmissionRequest = {
        semester: editSemester,
        courseId: editCourseId,
        facultyId: editFacultyId, // Although not directly used by backend logic, it's good to send for consistency if available
        departmentId: editDepartmentId, // Same here
      };
      await updateSubmission(id, request);
      alert("Submission updated successfully!");
      handleCancelEdit();
      fetchSubmissions();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to update submission.");
    } finally {
      setLoading(false);
    }
  };

  // NEW: Bulk Update Handler
  const handleBulkUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBulkUpdateMessage(null);
    setBulkUpdateError(null);

    if (!bulkUpdateCourseId || !bulkUpdateOldSemester || !bulkUpdateNewSemester) {
      setBulkUpdateError("Please select Course, Old Semester, and New Semester for bulk update.");
      setLoading(false);
      return;
    }

    try {
      const request: BulkSubmissionUpdateRequest = {
        courseId: bulkUpdateCourseId,
        oldSemester: bulkUpdateOldSemester,
        newSemester: bulkUpdateNewSemester,
      };
      const responseMessage = await bulkUpdateSubmissions(request);
      setBulkUpdateMessage(responseMessage);
      setBulkUpdateError(null);
      fetchSubmissions(); // Re-fetch submissions to see changes
    } catch (err: any) {
      setBulkUpdateError(err.response?.data || err.message || "Failed to perform bulk update.");
      setBulkUpdateMessage(null);
    } finally {
      setLoading(false);
    }
  };

  // --- Filtered Dropdown Options for Edit Form (or view filters) ---
  const departmentsForSelect = selectedFacultyId
    ? departments.filter(d => d.facultyId === selectedFacultyId)
    : departments;

  const coursesForSelect = selectedDepartmentId
    ? courses.filter(c => c.departmentId === selectedDepartmentId)
    : courses;

  const getDepartmentsForEdit = (facultyId: string) => {
    return departments.filter(d => d.facultyId === facultyId);
  };

  const getCoursesForEdit = (departmentId: string) => {
    return courses.filter(c => c.departmentId === departmentId);
  };

  // --- Access Control ---
  if (!role || !["ADMIN", "STAFF"].includes(role)) {
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
          Survey Submissions
        </h1>

        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        {loading && <div className="text-center text-[#21409a]">Loading submissions...</div>}

        {/* --- Filters Section --- */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 w-full max-w-4xl border" style={{ borderColor: BORDER_COLOR }}>
          <h2 className="text-xl font-semibold mb-4 text-[#21409a] border-b pb-2" style={{ borderColor: BORDER_COLOR }}>Filter Submissions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">Survey:</label>
              <select
                value={selectedSurveyId}
                onChange={(e) => setSelectedSurveyId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition bg-white"
              >
                <option value="">All Surveys</option>
                {surveys.map(survey => (
                  <option key={survey.id} value={survey.id}>{survey.title}</option>
                ))}
              </select>
            </div>
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
                {departmentsForSelect.map(dep => (
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
                {coursesForSelect.map((course: Course) => (
                  <option key={course.id} value={course.id}>{course.courseCode} - {course.courseName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* NEW: Bulk Update Section */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 w-full max-w-4xl border" style={{ borderColor: BORDER_COLOR }}>
          <h2 className="text-xl font-semibold mb-4 text-[#21409a] border-b pb-2" style={{ borderColor: BORDER_COLOR }}>Bulk Update Submissions</h2>
          <form onSubmit={handleBulkUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">Course:</label>
              <select
                value={bulkUpdateCourseId}
                onChange={(e) => setBulkUpdateCourseId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition bg-white"
                required
              >
                <option value="" disabled>Select Course for Bulk Update</option>
                {courses.map((course: Course) => (
                  <option key={course.id} value={course.id}>{course.courseCode} - {course.courseName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">Old Semester:</label>
              <select
                value={bulkUpdateOldSemester}
                onChange={(e) => setBulkUpdateOldSemester(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition bg-white"
                required
              >
                <option value="" disabled>Select Old Semester</option>
                {availableSemesters.map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">New Semester:</label>
              <select
                value={bulkUpdateNewSemester}
                onChange={(e) => setBulkUpdateNewSemester(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition bg-white"
                required
              >
                <option value="" disabled>Select New Semester</option>
                {availableSemesters.map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="col-span-full w-full mt-2 py-2 rounded-lg bg-[#21409a] hover:bg-[#18316e] text-white font-bold text-base shadow transition-all"
              style={{ letterSpacing: ".03em" }}
              disabled={loading}
            >
              {loading ? "Updating..." : "Perform Bulk Update"}
            </button>
            {bulkUpdateMessage && <div className="text-green-600 text-center col-span-full mt-2 text-sm">{bulkUpdateMessage}</div>}
            {bulkUpdateError && <div className="text-red-600 text-center col-span-full mt-2 text-sm">{bulkUpdateError}</div>}
          </form>
        </div>


        {/* --- Submissions Table --- */}
        {submissions.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: BORDER_COLOR }}>
            <table className="min-w-full bg-white text-sm">
              <thead>
                <tr>
                  <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Submission Code</th>
                  <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Student Number</th>
                  <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Submission Date</th>
                  <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Survey</th>
                  <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Semester</th>
                  <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Faculty</th>
                  <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Department</th>
                  <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Course</th>
                  <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission, index) => (
                  <tr key={submission.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                    <td className="py-2 px-4 border-b border-gray-100">
                      {submission.submissionCode}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-100">
                      {submission.studentNumber}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-100">
                      {submission.submissionDate}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-100">
                      {submission.surveyTitle}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-100">
                      {editingSubmissionId === submission.id ? (
                        <select
                          value={editSemester}
                          onChange={(e) => setEditSemester(e.target.value)}
                          className="p-1 border rounded-md text-xs"
                          disabled={availableSemesters.length === 0}
                        >
                          {availableSemesters.map(sem => (
                            <option key={sem} value={sem}>{sem}</option>
                          ))}
                        </select>
                      ) : (
                        <span>{submission.semester}</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-100">
                      {editingSubmissionId === submission.id ? (
                        <select
                          value={editFacultyId}
                          onChange={(e) => {
                            setEditFacultyId(e.target.value);
                            setEditDepartmentId("");
                            setEditCourseId("");
                          }}
                          className="p-1 border rounded-md text-xs"
                          disabled={faculties.length === 0}
                        >
                          {faculties.map(fac => (
                            <option key={fac.id} value={fac.id}>{fac.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span>{submission.facultyName}</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-100">
                      {editingSubmissionId === submission.id ? (
                        <select
                          value={editDepartmentId}
                          onChange={(e) => {
                            setEditDepartmentId(e.target.value);
                            setEditCourseId("");
                          }}
                          className="p-1 border rounded-md text-xs"
                          disabled={!editFacultyId || getDepartmentsForEdit(editFacultyId).length === 0}
                        >
                          {getDepartmentsForEdit(editFacultyId).map(dep => (
                            <option key={dep.id} value={dep.id}>{dep.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span>{submission.departmentName}</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-100">
                      {editingSubmissionId === submission.id ? (
                        <select
                          value={editCourseId}
                          onChange={(e) => setEditCourseId(e.target.value)}
                          className="p-1 border rounded-md text-xs"
                          disabled={!editDepartmentId || getCoursesForEdit(editDepartmentId).length === 0}
                        >
                          {getCoursesForEdit(editDepartmentId).map(course => (
                            <option key={course.id} value={course.id}>{course.courseCode} - {course.courseName}</option>
                          ))}
                        </select>
                      ) : (
                        <span>{submission.courseName}</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-100 flex gap-2">
                      {editingSubmissionId === submission.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(submission.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-xs"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(submission)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSubmission(submission.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-center">No submissions found with current filters.</p>
        )}
      </div>
    </div>
  );
};

export default SurveySubmissionManagement;