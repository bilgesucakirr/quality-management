import React, { useState, useEffect } from "react";
import { getAllSurveys } from "../api/SurveyService";
import { getAllFaculties } from "../api/FacultyService";
import { getAllDepartments } from "../api/DepartmentService";
import { getAllCourses } from "../api/CourseService";
import { uploadSurveyResults } from "../api/DataUploadService";
import type { SurveyDto } from "../types/Survey";
import type { Faculty } from "../types/Faculty";
import type { Department } from "../types/Department";
import type { Course } from "../types/Course";
import { useAuthStore } from "../store/AuthStore";

const BG = "#f8f9fb";
const BLUE = "#21409a";

const DataUpload: React.FC = () => {
  const [surveys, setSurveys] = useState<SurveyDto[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState("");
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { role } = useAuthStore();

  useEffect(() => {
    if (role === "ADMIN" || role === "STAFF") {
      fetchDropdownData();
    } else {
      setError("You are not authorized to view this page.");
    }
    // eslint-disable-next-line
  }, [role]);

  const fetchDropdownData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [surveyData, facultyData, allDepartmentData, allCourseData] = await Promise.all([
        getAllSurveys(),
        getAllFaculties(),
        getAllDepartments(),
        getAllCourses(),
      ]);
      setSurveys(surveyData);
      setFaculties(facultyData);
      setDepartments(allDepartmentData);
      setCourses(allCourseData);

      if (surveyData.length > 0) setSelectedSurveyId(surveyData[0].id);
      if (facultyData.length > 0) {
        setSelectedFacultyId(facultyData[0].id);
        const initialDepartments = allDepartmentData.filter(d => d.facultyId === facultyData[0].id);
        if (initialDepartments.length > 0) {
          setSelectedDepartmentId(initialDepartments[0].id);
          const initialCourses = allCourseData.filter(c => c.departmentId === initialDepartments[0].id);
          if (initialCourses.length > 0) {
            setSelectedCourseId(initialCourses[0].id);
          } else {
            setSelectedCourseId("");
          }
        } else {
          setSelectedDepartmentId("");
          setSelectedCourseId("");
        }
      } else {
        setSelectedFacultyId("");
        setSelectedDepartmentId("");
        setSelectedCourseId("");
      }
    } catch (err) {
      setError("Failed to load dropdown options.");
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const facultyId = e.target.value;
    setSelectedFacultyId(facultyId);
    setSelectedDepartmentId("");
    setSelectedCourseId("");
    const filteredDepartments = departments.filter(d => d.facultyId === facultyId);
    if (filteredDepartments.length > 0) {
      setSelectedDepartmentId(filteredDepartments[0].id);
      const filteredCourses = courses.filter(c => c.departmentId === filteredDepartments[0].id);
      if (filteredCourses.length > 0) {
        setSelectedCourseId(filteredCourses[0].id);
      } else {
        setSelectedCourseId("");
      }
    }
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const departmentId = e.target.value;
    setSelectedDepartmentId(departmentId);
    setSelectedCourseId("");
    const filteredCourses = courses.filter(c => c.departmentId === departmentId);
    if (filteredCourses.length > 0) {
      setSelectedCourseId(filteredCourses[0].id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!selectedSurveyId || !selectedFacultyId || !selectedDepartmentId || !selectedCourseId || !selectedFile) {
      setError("Please select a survey, faculty, department, course, and a file.");
      return;
    }
    setLoading(true);
    try {
      const responseMessage = await uploadSurveyResults(
        selectedFile,
        selectedSurveyId,
        selectedFacultyId,
        selectedDepartmentId,
        selectedCourseId
      );
      setMessage(responseMessage);
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.response?.data || "Failed to upload survey results.");
    } finally {
      setLoading(false);
    }
  };

  if (role !== "ADMIN" && role !== "STAFF") {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: BG }}>
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <p className="text-xl text-red-600">Access Denied.</p>
          <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const currentFilteredDepartments = departments.filter(d => d.facultyId === selectedFacultyId);
  const currentFilteredCourses = courses.filter(c => c.departmentId === selectedDepartmentId);

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-2" style={{ background: BG }}>
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl border border-[#e5eaf8] p-6 shadow flex flex-col gap-4">
          <h1 className="text-2xl font-bold mb-4 text-[#21409a] text-center">
            Survey Data Upload
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label htmlFor="survey-select" className="block text-gray-700 text-xs font-semibold mb-1">
                Select Survey
              </label>
              <select
                id="survey-select"
                value={selectedSurveyId}
                onChange={(e) => setSelectedSurveyId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
                required
              >
                <option value="" disabled>Select a Survey</option>
                {surveys.map((survey) => (
                  <option key={survey.id} value={survey.id}>
                    {survey.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="faculty-select" className="block text-gray-700 text-xs font-semibold mb-1">
                Select Faculty
              </label>
              <select
                id="faculty-select"
                value={selectedFacultyId}
                onChange={handleFacultyChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
                required
              >
                <option value="" disabled>Select a Faculty</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="department-select" className="block text-gray-700 text-xs font-semibold mb-1">
                Select Department
              </label>
              <select
                id="department-select"
                value={selectedDepartmentId}
                onChange={handleDepartmentChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
                required
                disabled={!selectedFacultyId || currentFilteredDepartments.length === 0}
              >
                <option value="" disabled>Select a Department</option>
                {currentFilteredDepartments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="course-select" className="block text-gray-700 text-xs font-semibold mb-1">
                Select Course
              </label>
              <select
                id="course-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
                required
                disabled={!selectedDepartmentId || currentFilteredCourses.length === 0}
              >
                <option value="" disabled>Select a Course</option>
                {currentFilteredCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseCode} - {course.courseName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="file-input" className="block text-gray-700 text-xs font-semibold mb-1">
                Upload Excel File
              </label>
              <input
                type="file"
                id="file-input"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#21409a] hover:file:bg-blue-100"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2 rounded-lg bg-[#21409a] hover:bg-[#18316e] text-white font-bold text-base shadow transition-all"
              style={{ letterSpacing: ".03em" }}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Survey Results"}
            </button>
          </form>

          {message && <div className="text-green-600 text-center mt-3 text-sm">{message}</div>}
          {error && <div className="text-red-600 text-center mt-3 text-sm">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default DataUpload;
