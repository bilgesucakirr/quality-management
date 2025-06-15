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

const PRIMARY = "#21409a";
const BORDER = "#e3e6ea";
const BG = "#f8f9fb";

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
  const [newSemester, setNewSemester] = useState(""); // NEW: Added newSemester state
  const [newFacultyId, setNewFacultyId] = useState("");
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [newInstructorId, setNewInstructorId] = useState("");

  // Form states for editing an existing course
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editCourseCode, setEditCourseCode] = useState("");
  const [editCourseName, setEditCourseName] = useState("");
  const [editCredits, setEditCredits] = useState<string>("");
  const [editSemester, setEditSemester] = useState(""); // NEW: Added editSemester state
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

      if (facultyData.length > 0) {
        setNewFacultyId(facultyData[0].id);
        const initialDepartments = departmentData.filter(d => d.facultyId === facultyData[0].id);
        if (initialDepartments.length > 0) {
          setNewDepartmentId(initialDepartments[0].id);
        } else {
          setNewDepartmentId("");
        }
      } else {
        setNewFacultyId("");
        setNewDepartmentId("");
      }
    } catch (err) {
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
        semester: newSemester, // NEW: Pass newSemester
        departmentId: newDepartmentId,
        instructorId: newInstructorId || undefined,
      });
      setNewCourseCode("");
      setNewCourseName("");
      setNewCredits("");
      setNewSemester(""); // NEW: Clear newSemester
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
      fetchData();
    } catch (err: any) {
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
    setEditSemester(course.semester); // NEW: Set editSemester
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
    setEditSemester(""); // NEW: Clear editSemester
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
        semester: editSemester, // NEW: Pass editSemester
        departmentId: editDepartmentId,
        instructorId: editInstructorId || undefined,
      });
      handleCancelEdit();
      fetchData();
    } catch (err: any) {
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
      fetchData();
    } catch (err: any) {
      setError(err.response?.data || "Failed to delete course. It might be linked to existing survey submissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const facultyId = e.target.value;
    setNewFacultyId(facultyId);
    setNewDepartmentId("");
    const filteredDepartments = departments.filter(d => d.facultyId === facultyId);
    if (filteredDepartments.length > 0) {
      setNewDepartmentId(filteredDepartments[0].id);
    }
  };

  const handleEditFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const facultyId = e.target.value;
    setEditFacultyId(facultyId);
    setEditDepartmentId("");
    const filtered = departments.filter(d => d.facultyId === facultyId);
    if (filtered.length > 0) {
      setEditDepartmentId(filtered[0].id);
    }
  };

  const filteredDepartmentsForNewCourse = newFacultyId
    ? departments.filter(d => d.facultyId === newFacultyId)
    : [];

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
    <div className="min-h-screen w-full flex flex-col items-center py-10 px-2" style={{ background: BG }}>
      <div className="w-full max-w-6xl flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-[#21409a] text-center tracking-tight">Course Management</h1>
        {/* Add Course Form */}
        <form
          onSubmit={handleCreateCourse}
          className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 px-4"
        >
          <input
            type="text"
            placeholder="Course Code (e.g., INDE2001.1)"
            value={newCourseCode}
            onChange={(e) => setNewCourseCode(e.target.value)}
            className="p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
            required
          />
          <input
            type="text"
            placeholder="Course Name (e.g., Operations Research I)"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            className="p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
            required
          />
          <input
            type="number"
            placeholder="Credits (e.g., 4)"
            value={newCredits}
            onChange={(e) => setNewCredits(e.target.value)}
            className="p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
            required
          />
          <input
            type="text"
            placeholder="Semester (e.g., FALL23)"
            value={newSemester}
            onChange={(e) => setNewSemester(e.target.value)}
            className="p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
            required
          />
          {/* Faculty Selection for New Course */}
          <select
            value={newFacultyId}
            onChange={handleNewFacultyChange}
            className="p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
            required
          >
            <option value="" disabled>Select Faculty</option>
            {faculties.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.name}
              </option>
            ))}
          </select>
          {/* Department Selection for New Course */}
          <select
            value={newDepartmentId}
            onChange={(e) => setNewDepartmentId(e.target.value)}
            className="p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
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
            className="p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
          />
          <button
            type="submit"
            className="col-span-full w-full mt-2 py-2 rounded-md bg-[#21409a] hover:bg-[#18316e] text-white font-semibold text-sm shadow-md transition-all duration-150"
            style={{
              letterSpacing: ".03em",
              boxShadow: `0 2.5px 8px -3px #21409a25`,
            }}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Course"}
          </button>
        </form>

        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        {loading && <div className="text-center text-[#21409a]">Loading courses...</div>}
        {!loading && courses.length === 0 && (
          <div className="text-center text-gray-600">No courses found.</div>
        )}

        {/* Course List */}
        <div className="w-full mt-2 overflow-x-auto rounded-lg">
          <table className="min-w-full bg-white text-sm rounded-lg">
            <thead>
              <tr>
                <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Code</th>
                <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Name</th>
                <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Credits</th>
                <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Semester</th>
                <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Faculty</th>
                <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Department</th>
                <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Instructor</th>
                <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-blue-50 transition">
                  <td className="py-2 px-4 border-b border-gray-100">
                    {editingCourseId === course.id ? (
                      <input type="text" value={editCourseCode} onChange={(e) => setEditCourseCode(e.target.value)} className="p-1 border rounded-md text-xs w-20" />
                    ) : (
                      <span>{course.courseCode}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-100">
                    {editingCourseId === course.id ? (
                      <input type="text" value={editCourseName} onChange={(e) => setEditCourseName(e.target.value)} className="p-1 border rounded-md text-xs w-36" />
                    ) : (
                      <span>{course.courseName}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-100">
                    {editingCourseId === course.id ? (
                      <input type="number" value={editCredits} onChange={(e) => setEditCredits(e.target.value)} className="p-1 border rounded-md text-xs w-12" />
                    ) : (
                      <span>{course.credits}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-100">
                    {editingCourseId === course.id ? (
                      <input type="text" value={editSemester} onChange={(e) => setEditSemester(e.target.value)} className="p-1 border rounded-md text-xs w-16" />
                    ) : (
                      <span>{course.semester}</span>
                    )}
                  </td>
                  {/* Faculty Display and Edit */}
                  <td className="py-2 px-4 border-b border-gray-100">
                    {editingCourseId === course.id ? (
                      <select value={editFacultyId} onChange={handleEditFacultyChange} className="p-1 border rounded-md text-xs">
                        {faculties.map(fac => (
                          <option key={fac.id} value={fac.id}>{fac.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span>{departments.find(d => d.id === course.departmentId)?.facultyName || "N/A"}</span>
                    )}
                  </td>
                  {/* Department Display and Edit */}
                  <td className="py-2 px-4 border-b border-gray-100">
                    {editingCourseId === course.id ? (
                      <select value={editDepartmentId} onChange={(e) => setEditDepartmentId(e.target.value)} className="p-1 border rounded-md text-xs"
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
                  <td className="py-2 px-4 border-b border-gray-100">
                    {editingCourseId === course.id ? (
                      <input type="text" value={editInstructorId} onChange={(e) => setEditInstructorId(e.target.value)} className="p-1 border rounded-md text-xs w-20" />
                    ) : (
                      <span>{course.instructorName || "N/A"}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-100 flex gap-2">
                    {editingCourseId === course.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(course.id)}
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
                          onClick={() => handleStartEdit(course)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
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
      </div>
    </div>
  );
};

export default CourseManagement;