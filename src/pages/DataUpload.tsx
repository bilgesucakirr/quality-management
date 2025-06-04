import React, { useState, useEffect } from "react";
import { getAllSurveys } from "../api/SurveyService";
import { getAllFaculties } from "../api/FacultyService";
import { getAllDepartments } from "../api/DepartmentService";
import { getAllCourses } from "../api/CourseService";
import { uploadSurveyResults } from "../api/DataUploadService";
import type { SurveyDto } from "../types/Survey"; // SurveyDto olarak güncellendi
import type { Faculty } from "../types/Faculty";
import type { Department } from "../types/Department";
import type { Course } from "../types/Course";
import { useAuthStore } from "../store/AuthStore";

const BLUE = "#05058c";

const DataUpload: React.FC = () => {
  const [surveys, setSurveys] = useState<SurveyDto[]>([]); // SurveyDto olarak güncellendi
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

      // Set default selected IDs if data exists
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
      console.error("Failed to fetch dropdown data:", err);
      setError("Failed to load dropdown options.");
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
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

  const handleDepartmentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
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
      console.error("Upload failed:", err);
      setError(err.response?.data || "Failed to upload survey results.");
    } finally {
      setLoading(false);
    }
  };

  if (role !== "ADMIN" && role !== "STAFF") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl text-red-600">Access Denied.</p>
          <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const currentFilteredDepartments = departments.filter(d => d.facultyId === selectedFacultyId);
  const currentFilteredCourses = courses.filter(c => c.departmentId === selectedDepartmentId);

  return (
    <div className="min-h-screen flex flex-col items-center py-8">
      <div
        className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-2xl border"
        style={{ borderColor: BLUE }}
      >
        <h1
          className="text-2xl font-extrabold mb-8 text-center tracking-tight drop-shadow"
          style={{ color: BLUE }}
        >
          Survey Data Upload
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Survey Selection */}
          <div>
            <label htmlFor="survey-select" className="block text-gray-700 text-sm font-bold mb-2">
              Select Survey:
            </label>
            <select
              id="survey-select"
              value={selectedSurveyId}
              onChange={(e) => setSelectedSurveyId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
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

          {/* Faculty Selection */}
          <div>
            <label htmlFor="faculty-select" className="block text-gray-700 text-sm font-bold mb-2">
              Select Faculty:
            </label>
            <select
              id="faculty-select"
              value={selectedFacultyId}
              onChange={handleFacultyChange}
              className="w-full p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
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

          {/* Department Selection */}
          <div>
            <label htmlFor="department-select" className="block text-gray-700 text-sm font-bold mb-2">
              Select Department:
            </label>
            <select
              id="department-select"
              value={selectedDepartmentId}
              onChange={handleDepartmentChange}
              className="w-full p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
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

          {/* Course Selection */}
          <div>
            <label htmlFor="course-select" className="block text-gray-700 text-sm font-bold mb-2">
              Select Course:
            </label>
            <select
              id="course-select"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
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

          {/* File Input */}
          <div>
            <label htmlFor="file-input" className="block text-gray-700 text-sm font-bold mb-2">
              Upload Excel File:
            </label>
            <input
              type="file"
              id="file-input"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#05058c] hover:file:bg-blue-100"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-bold text-base mt-4 shadow"
            style={{ backgroundColor: BLUE, transition: "background 0.2s" }}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Survey Results"}
          </button>
        </form>

        {message && <div className="text-green-600 text-center mt-4">{message}</div>}
        {error && <div className="text-red-600 text-center mt-4">{error}</div>}
      </div>
    </div>
  );
};

export default DataUpload;