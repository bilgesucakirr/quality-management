// src/pages/CourseManagement.tsx
import React, { useState, useEffect } from "react";
import {
  createCourse,
  getAllCourses,
  updateCourse,
  deleteCourse,
} from "../api/CourseService";
import { getAllFaculties } from "../api/FacultyService";
import { getAllDepartments } from "../api/DepartmentService";
import type { Course } from "../types/Course";
import type { Faculty } from "../types/Faculty";
import type { Department } from "../types/Department";
import { useAuthStore } from "../store/AuthStore";

const BLUE = "#05058c";

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for adding new course
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [newCredits, setNewCredits] = useState<string>("");
  const [newSemester, setNewSemester] = useState("");
  const [newFacultyId, setNewFacultyId] = useState(""); // Correct state for new course's faculty
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [newInstructorId, setNewInstructorId] = useState("");

  // Form states for editing an existing course
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editCourseCode, setEditCourseCode] = useState("");
  const [editCourseName, setEditCourseName] = useState("");
  const [editCredits, setEditCredits] = useState<string>("");
  const [editSemester, setEditSemester] = useState("");
  const [editFacultyId, setEditFacultyId] = useState("");
  const [editDepartmentId, setEditDepartmentId] = useState("");
  const [editInstructorId, setEditInstructorId] = useState("");

  const { role } = useAuthStore();

  useEffect(() => {
    if (role === "ADMIN") {
      fetchData();
    } else {
      setError("You are not authorized to view this page.");
    }
  }, [role]);

  const fetchData = async () => {
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

      // Set default selected values for new course form if data exists
      if (facultyData.length > 0) {
        setNewFacultyId(facultyData[0].id);
        const initialDepartments = departmentData.filter(d => d.facultyId === facultyData[0].id);
        if (initialDepartments.length > 0) {
          setNewDepartmentId(initialDepartments[0].id);
        } else {
          setNewDepartmentId(""); // No departments for the first faculty
        }
      } else {
        setNewFacultyId(""); // No faculties available
        setNewDepartmentId("");
      }
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      setError("Failed to fetch data (faculties, departments, courses). Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!newDepartmentId) {
        setError("Please select a department.");
        setLoading(false);
        return;
      }

      await createCourse({
        courseCode: newCourseCode,
        courseName: newCourseName,
        credits: parseInt(newCredits),
        semester: newSemester,
        departmentId: newDepartmentId,
        instructorId: newInstructorId || undefined,
      });
      alert("Course created successfully!");
      // Reset form fields
      setNewCourseCode("");
      setNewCourseName("");
      setNewCredits("");
      setNewSemester("");
      // Reset faculty/department to defaults
      if (faculties.length > 0) {
        setNewFacultyId(faculties[0].id);
        const initialDepartments = departments.filter(d => d.facultyId === faculties[0].id);
        if (initialDepartments.length > 0) {
          setNewDepartmentId(initialDepartments[0].id);
        } else {
          setNewDepartmentId("");
        }
      } else {
        setNewFacultyId("");
        setNewDepartmentId("");
      }
      setNewInstructorId("");
      fetchData(); // Re-fetch all data to update lists
    } catch (err: any) {
      console.error("Failed to create course:", err);
      setError(err.response?.data || "Failed to create course. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (course: Course) => {
    setEditingCourseId(course.id);
    setEditCourseCode(course.courseCode);
    setEditCourseName(course.courseName);
    setEditCredits(course.credits.toString());
    setEditSemester(course.semester);
    // Find the faculty of the course's department to set the editFacultyId dropdown
    const departmentOfCourse = departments.find(d => d.id === course.departmentId);
    setEditFacultyId(departmentOfCourse?.facultyId || "");
    setEditDepartmentId(course.departmentId);
    setEditInstructorId(course.instructorId || "");
  };

  const handleCancelEdit = () => {
    setEditingCourseId(null);
    setEditCourseCode("");
    setEditCourseName("");
    setEditCredits("");
    setEditSemester("");
    setEditFacultyId("");
    setEditDepartmentId("");
    setEditInstructorId("");
  };

  const handleSaveEdit = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!editDepartmentId) {
        setError("Please select a department.");
        setLoading(false);
        return;
      }

      await updateCourse(id, {
        courseCode: editCourseCode,
        courseName: editCourseName,
        credits: parseInt(editCredits),
        semester: editSemester,
        departmentId: editDepartmentId,
        instructorId: editInstructorId || undefined,
      });
      alert("Course updated successfully!");
      handleCancelEdit();
      fetchData(); // Re-fetch all data to update lists
    } catch (err: any) {
      console.error("Failed to update course:", err);
      setError(err.response?.data || "Failed to update course. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteCourse(id);
      alert("Course deleted successfully!");
      fetchData(); // Re-fetch all data
    } catch (err: any) {
      console.error("Failed to delete course:", err);
      setError(err.response?.data || "Failed to delete course. It might be linked to existing survey submissions.");
    } finally {
      setLoading(false);
    }
  };

  // Handler for new course form: when faculty selection changes
  const handleNewFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const facultyId = e.target.value;
    setNewFacultyId(facultyId); // Corrected usage: using setNewFacultyId
    setNewDepartmentId(""); // Reset department when faculty changes
    // Automatically set the first department of the new faculty if available
    const filteredDepartments = departments.filter(d => d.facultyId === facultyId);
    if (filteredDepartments.length > 0) {
      setNewDepartmentId(filteredDepartments[0].id);
    }
  };

  // Handler for edit course form: when faculty selection changes
  const handleEditFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const facultyId = e.target.value;
    setEditFacultyId(facultyId);
    setEditDepartmentId("");
    const filtered = departments.filter(d => d.facultyId === facultyId);
    if (filtered.length > 0) {
      setEditDepartmentId(filtered[0].id);
    }
  };

  // Filter departments based on selected faculty for the NEW course form
  const filteredDepartmentsForNewCourse = newFacultyId
    ? departments.filter(d => d.facultyId === newFacultyId)
    : [];

  // Filter departments based on selected faculty for the EDIT course form
  const filteredDepartmentsForEditCourse = editFacultyId
    ? departments.filter(d => d.facultyId === editFacultyId)
    : [];

  if (role !== "ADMIN") {
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
    <div className="min-h-screen flex flex-col items-center py-8">
      <div
        className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-6xl border"
        style={{ borderColor: BLUE }}
      >
        <h1
          className="text-2xl font-extrabold mb-8 text-center tracking-tight drop-shadow"
          style={{ color: BLUE }}
        >
          Course Management
        </h1>

        {/* Add Course Form */}
        <form
          onSubmit={handleCreateCourse}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 p-6 border rounded-2xl"
          style={{ borderColor: BLUE }}
        >
          <h2 className="col-span-full text-xl font-bold mb-3" style={{ color: BLUE }}>
            Create New Course
          </h2>
          <input
            type="text"
            placeholder="Course Code (e.g., INDE2001.1)"
            value={newCourseCode}
            onChange={(e) => setNewCourseCode(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
            required
          />
          <input
            type="text"
            placeholder="Course Name (e.g., Operations Research I)"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
            required
          />
          <input
            type="number"
            placeholder="Credits (e.g., 4)"
            value={newCredits}
            onChange={(e) => setNewCredits(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
            required
          />
          <input
            type="text"
            placeholder="Semester (e.g., FALL23)"
            value={newSemester}
            onChange={(e) => setNewSemester(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
            required
          />
          {/* Faculty Selection for New Course */}
          <select
            value={newFacultyId}
            onChange={handleNewFacultyChange}
            className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#05058c] outline-none transition"
            required
          >
            <option value="" disabled>Select Faculty</option>
            {faculties.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.name}
              </option>
            ))}
          </select>
          {/* Department Selection for New Course (filtered by selected faculty) */}
          <select
            value={newDepartmentId}
            onChange={(e) => setNewDepartmentId(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#05058c] outline-none transition"
            required
            disabled={!newFacultyId || filteredDepartmentsForNewCourse.length === 0}
          >
            <option value="" disabled>Select Department</option>
            {filteredDepartmentsForNewCourse.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Instructor ID (Optional)"
            value={newInstructorId}
            onChange={(e) => setNewInstructorId(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
          />
          <button
            type="submit"
            className="col-span-full w-full py-3 rounded-xl text-white font-bold text-base mt-4 shadow"
            style={{ backgroundColor: BLUE, transition: "background 0.2s" }}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Course"}
          </button>
        </form>

        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        {loading && <div className="text-center" style={{ color: BLUE }}>Loading courses...</div>}
        {!loading && courses.length === 0 && (
          <div className="text-center text-gray-600">No courses found.</div>
        )}

        {/* Course List */}
        <div className="overflow-x-auto rounded-2xl shadow">
          <table className="min-w-full bg-white rounded-2xl overflow-hidden text-base">
            <thead>
              <tr>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Code</th>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Name</th>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Credits</th>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Semester</th>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Faculty</th>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Department</th>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Instructor</th>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-blue-50 transition group">
                  <td className="py-3 px-6 border-b border-gray-100">
                    {editingCourseId === course.id ? (
                      <input type="text" value={editCourseCode} onChange={(e) => setEditCourseCode(e.target.value)} className="p-2 border rounded-lg text-sm w-24" />
                    ) : (
                      <span>{course.courseCode}</span>
                    )}
                  </td>
                  <td className="py-3 px-6 border-b border-gray-100">
                    {editingCourseId === course.id ? (
                      <input type="text" value={editCourseName} onChange={(e) => setEditCourseName(e.target.value)} className="p-2 border rounded-lg text-sm w-36" />
                    ) : (
                      <span>{course.courseName}</span>
                    )}
                  </td>
                  <td className="py-3 px-6 border-b border-gray-100">
                    {editingCourseId === course.id ? (
                      <input type="number" value={editCredits} onChange={(e) => setEditCredits(e.target.value)} className="p-2 border rounded-lg text-sm w-16" />
                    ) : (
                      <span>{course.credits}</span>
                    )}
                  </td>
                  <td className="py-3 px-6 border-b border-gray-100">
                    {editingCourseId === course.id ? (
                      <input type="text" value={editSemester} onChange={(e) => setEditSemester(e.target.value)} className="p-2 border rounded-lg text-sm w-20" />
                    ) : (
                      <span>{course.semester}</span>
                    )}
                  </td>
                  {/* Faculty Display and Edit */}
                  <td className="py-3 px-6 border-b border-gray-100">
                    {editingCourseId === course.id ? (
                      <select value={editFacultyId} onChange={handleEditFacultyChange} className="p-2 border rounded-lg text-sm">
                        {faculties.map(fac => (
                          <option key={fac.id} value={fac.id}>{fac.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span>{departments.find(d => d.id === course.departmentId)?.facultyName || "N/A"}</span>
                    )}
                  </td>
                  {/* Department Display and Edit (filtered by selected faculty) */}
                  <td className="py-3 px-6 border-b border-gray-100">
                    {editingCourseId === course.id ? (
                      <select value={editDepartmentId} onChange={(e) => setEditDepartmentId(e.target.value)} className="p-2 border rounded-lg text-sm"
                        disabled={!editFacultyId || filteredDepartmentsForEditCourse.length === 0}>
                        <option value="" disabled>Select Department</option>
                        {filteredDepartmentsForEditCourse.map(dep => (
                          <option key={dep.id} value={dep.id}>
                            {dep.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{course.departmentName}</span>
                    )}
                  </td>
                  <td className="py-3 px-6 border-b border-gray-100">
                    {editingCourseId === course.id ? (
                      <input type="text" value={editInstructorId} onChange={(e) => setEditInstructorId(e.target.value)} className="p-2 border rounded-lg text-sm w-24" />
                    ) : (
                      <span>{course.instructorName || "N/A"}</span>
                    )}
                  </td>
                  <td className="py-3 px-6 border-b border-gray-100 flex gap-2">
                    {editingCourseId === course.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(course.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(course)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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
      </div>
    </div>
  );
};

export default CourseManagement;