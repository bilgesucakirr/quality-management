// src/pages/DepartmentManagementPage.tsx
import React, { useState, useEffect } from "react";
import { getAllFaculties, getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from "../api/UniversityService";
import type { Faculty, Department, CreateUpdateDepartmentRequest } from "../types/University";

const BLUE = "#05058c";

const DepartmentManagementPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]); // To populate the dropdown for faculty selection
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentFacultyId, setNewDepartmentFacultyId] = useState(""); // Selected faculty for new department
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [editDepartmentName, setEditDepartmentName] = useState("");
  const [editDepartmentFacultyId, setEditDepartmentFacultyId] = useState(""); // Selected faculty for editing
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedFaculties = await getAllFaculties();
      setFaculties(fetchedFaculties);
      if (fetchedFaculties.length > 0) {
        setNewDepartmentFacultyId(fetchedFaculties[0].id); // Set default for new department
      }

      const fetchedDepartments = await getAllDepartments();
      setDepartments(fetchedDepartments);
    } catch (err: any) {
      console.error("Failed to fetch data:", err.response?.data || err.message);
      setError("Failed to fetch data: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!newDepartmentFacultyId) {
        setError("Please select a faculty for the new department.");
        return;
      }
      const request: CreateUpdateDepartmentRequest = { name: newDepartmentName, facultyId: newDepartmentFacultyId };
      await createDepartment(request);
      alert("Department created successfully!");
      setNewDepartmentName("");
      // Keep selected faculty for convenience: setNewDepartmentFacultyId(faculties[0]?.id || "");
      fetchInitialData(); // Re-fetch all data
    } catch (err: any) {
      console.error("Failed to create department:", err.response?.data || err.message);
      setError("Failed to create department: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteDepartment(id);
      alert("Department deleted successfully!");
      fetchInitialData(); // Re-fetch all data
    } catch (err: any) {
      console.error("Failed to delete department:", err.response?.data || err.message);
      setError("Failed to delete department: " + (err.response?.data || err.message) + ". (Check if courses/users are linked to this department)");
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
    setLoading(true);
    setError(null);
    try {
      if (!editDepartmentFacultyId) {
        setError("Please select a faculty for the department.");
        return;
      }
      const request: CreateUpdateDepartmentRequest = { name: editDepartmentName, facultyId: editDepartmentFacultyId };
      await updateDepartment(id, request);
      alert("Department updated successfully!");
      handleCancelEdit();
      fetchInitialData(); // Re-fetch all data
    } catch (err: any) {
      console.error("Failed to update department:", err.response?.data || err.message);
      setError("Failed to update department: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

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
          Department Management
        </h1>
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}

        {/* Add Department Form */}
        <form onSubmit={handleCreateDepartment} className="flex flex-col md:flex-row gap-3 items-center mb-10">
          <input
            type="text"
            placeholder="New Department Name"
            value={newDepartmentName}
            onChange={(e) => setNewDepartmentName(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
            required
          />
          <select
            value={newDepartmentFacultyId}
            onChange={(e) => setNewDepartmentFacultyId(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 text-base transition min-w-[200px]"
            required
            style={{ color: BLUE }}
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
          <button
            type="submit"
            className="px-8 py-3 rounded-xl shadow font-bold text-base hover:opacity-90 active:scale-95 transition min-w-[120px]"
            style={{ backgroundColor: BLUE, color: "#fff" }}
            disabled={loading || faculties.length === 0}
          >
            {loading ? "Adding..." : "Add Department"}
          </button>
        </form>

        {/* Department List */}
        <div className="overflow-x-auto rounded-2xl shadow">
          <table className="min-w-full bg-white rounded-2xl overflow-hidden text-base">
            <thead>
              <tr>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Department Name</th>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Faculty</th>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && departments.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-500">
                    No departments found.
                  </td>
                </tr>
              ) : (
                departments.map((department) => (
                  <tr key={department.id} className="hover:bg-blue-50 transition group">
                    <td className="py-3 px-6 border-b border-gray-100">
                      {editingDepartmentId === department.id ? (
                        <input
                          type="text"
                          value={editDepartmentName}
                          onChange={(e) => setEditDepartmentName(e.target.value)}
                          className="p-2 border rounded-lg text-base"
                        />
                      ) : (
                        <span className="font-semibold">{department.name}</span>
                      )}
                    </td>
                    <td className="py-3 px-6 border-b border-gray-100">
                      {editingDepartmentId === department.id ? (
                        <select
                          value={editDepartmentFacultyId}
                          onChange={(e) => setEditDepartmentFacultyId(e.target.value)}
                          className="p-2 border rounded-lg text-base"
                          style={{ color: BLUE }}
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
                    <td className="py-3 px-6 border-b border-gray-100 flex gap-2 justify-center">
                      {editingDepartmentId === department.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(department.id)}
                            className="px-4 py-2 rounded-lg font-bold text-base bg-green-600 text-white hover:bg-green-700"
                            disabled={loading}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-2 rounded-lg font-bold text-base bg-gray-500 text-white hover:bg-gray-600"
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(department)}
                            className="px-4 py-2 rounded-lg font-bold text-base bg-yellow-500 text-white hover:bg-yellow-600"
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDepartment(department.id)}
                            className="px-4 py-2 rounded-lg font-bold text-base bg-red-600 text-white hover:bg-red-700"
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {loading && <div className="mt-6" style={{ color: BLUE, textAlign: "center" }}>Loading...</div>}
      </div>
    </div>
  );
};

export default DepartmentManagementPage;