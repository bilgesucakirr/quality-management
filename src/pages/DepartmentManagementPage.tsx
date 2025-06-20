// src/pages/DepartmentManagementPage.tsx
import React, { useState, useEffect } from "react";
import { getAllFaculties, getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from "../api/UniversityService";
import type { Faculty, Department, CreateUpdateDepartmentRequest } from "../types/University";
import { useAuthStore } from "../store/AuthStore";
import { useNavigate } from "react-router-dom";

const BG = "#f8f9fb";
const PRIMARY_BLUE = "#21409a";
const BORDER_COLOR = "#e5eaf8";

const DepartmentManagementPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentFacultyId, setNewDepartmentFacultyId] = useState("");
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [editDepartmentName, setEditDepartmentName] = useState("");
  const [editDepartmentFacultyId, setEditDepartmentFacultyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { role } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
     if (role === "ADMIN") {
        fetchInitialData();
    } else {
      setError("You are not authorized to view this page.");
    }
  }, [role]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedFaculties = await getAllFaculties();
      setFaculties(fetchedFaculties);
      if (fetchedFaculties.length > 0) {
        setNewDepartmentFacultyId(fetchedFaculties[0].id);
      }

      const fetchedDepartments = await getAllDepartments();
      setDepartments(fetchedDepartments);
    } catch (err: any) {
      setError("Failed to fetch data: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName.trim() || !newDepartmentFacultyId) {
        setError("Department name and faculty are required.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const request: CreateUpdateDepartmentRequest = { name: newDepartmentName, facultyId: newDepartmentFacultyId };
      await createDepartment(request);
      setNewDepartmentName("");
      if (faculties.length > 0) setNewDepartmentFacultyId(faculties[0].id); // Reset to first faculty
      fetchInitialData();
    } catch (err: any) {
      setError("Failed to create department: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this department? This may affect related courses.")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteDepartment(id);
      fetchInitialData();
    } catch (err: any) {
      setError("Failed to delete department: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (department: Department) => {
    setEditingDepartmentId(department.id);
    setEditDepartmentName(department.name);
    setEditDepartmentFacultyId(department.facultyId);
  };

  const handleCancelEdit = () => {
    setEditingDepartmentId(null);
    setEditDepartmentName("");
    setEditDepartmentFacultyId("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editDepartmentName.trim() || !editDepartmentFacultyId) {
        setError("Department name and faculty are required for update.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const request: CreateUpdateDepartmentRequest = { name: editDepartmentName, facultyId: editDepartmentFacultyId };
      await updateDepartment(id, request);
      handleCancelEdit();
      fetchInitialData();
    } catch (err: any) {
      setError("Failed to update department: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  if (role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: BG }}>
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <p className="text-xl text-red-600">Access Denied.</p>
          <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-10 px-2" style={{ background: BG }}>
      <div className="w-full max-w-5xl flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-[#21409a] text-center tracking-tight">Department Management</h1>
        
        <form
          onSubmit={handleCreateDepartment}
          className="w-full max-w-xl bg-white rounded-xl shadow p-6 mb-8 border grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
          style={{ borderColor: BORDER_COLOR }}
        >
          <div className="md:col-span-1">
            <label htmlFor="newDeptName" className="block text-xs font-medium text-gray-700 mb-1">Department Name</label>
            <input
              id="newDeptName"
              type="text"
              placeholder="New Department Name"
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
              required
            />
          </div>
          <div className="md:col-span-1">
             <label htmlFor="newDeptFaculty" className="block text-xs font-medium text-gray-700 mb-1">Faculty</label>
            <select
              id="newDeptFaculty"
              value={newDepartmentFacultyId}
              onChange={(e) => setNewDepartmentFacultyId(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
              required
              disabled={faculties.length === 0 || loading}
            >
              {faculties.length === 0 ? (
                  <option value="">No faculties available</option>
              ) : (
                  faculties.map((faculty) => (
                      <option value={faculty.id} key={faculty.id}>
                          {faculty.name}
                      </option>
                  ))
              )}
            </select>
          </div>
          <button
            type="submit"
            className="md:col-span-1 w-full py-2.5 rounded-lg bg-[#21409a] hover:bg-[#18316e] text-white font-semibold text-sm shadow-md transition-all duration-150"
            style={{ letterSpacing: ".03em" }}
            disabled={loading || faculties.length === 0}
          >
            {loading ? "Adding..." : "Add Department"}
          </button>
        </form>

        {error && <div className="text-red-600 text-center mb-4 p-3 bg-red-100 border border-red-300 rounded-md w-full max-w-xl">{error}</div>}
        
        {loading && !departments.length && <div className="text-center text-[#21409a] py-8">Loading departments...</div>}
        {!loading && departments.length === 0 && !error && (
          <div className="text-center text-gray-600 py-8">No departments found.</div>
        )}

        {departments.length > 0 && (
            <div className="w-full max-w-3xl overflow-x-auto rounded-lg border shadow" style={{ borderColor: BORDER_COLOR }}>
            <table className="min-w-full bg-white text-sm rounded-lg">
              <thead>
                <tr>
                  <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold text-left">Department Name</th>
                  <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold text-left">Faculty</th>
                  <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr key={department.id} className="hover:bg-blue-50 transition">
                    <td className="py-2.5 px-4 border-b border-gray-100">
                      {editingDepartmentId === department.id ? (
                        <input
                          type="text"
                          value={editDepartmentName}
                          onChange={(e) => setEditDepartmentName(e.target.value)}
                          className="p-2 border border-gray-300 rounded-md text-sm w-full focus:ring-1 focus:ring-[#21409a]"
                        />
                      ) : (
                        <span className="font-medium text-gray-800">{department.name}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 border-b border-gray-100">
                      {editingDepartmentId === department.id ? (
                        <select
                          value={editDepartmentFacultyId}
                          onChange={(e) => setEditDepartmentFacultyId(e.target.value)}
                          className="p-2 border border-gray-300 rounded-md bg-white text-sm w-full focus:ring-1 focus:ring-[#21409a]"
                          required
                        >
                          {faculties.map((faculty) => (
                            <option value={faculty.id} key={faculty.id}>
                              {faculty.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span>{department.facultyName}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 border-b border-gray-100 text-center">
                      {editingDepartmentId === department.id ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleSaveEdit(department.id)}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs font-semibold"
                            disabled={loading}
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 bg-gray-400 text-white rounded-md hover:bg-gray-500 text-xs font-semibold"
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleStartEdit(department)}
                            className="px-3 py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-xs font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(department.id)}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs font-semibold"
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentManagementPage;