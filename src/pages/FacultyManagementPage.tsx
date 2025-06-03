// src/pages/FacultyManagementPage.tsx
import React, { useState, useEffect } from "react";
import { getAllFaculties, createFaculty, updateFaculty, deleteFaculty } from "../api/UniversityService";
import type { Faculty, CreateUpdateFacultyRequest } from "../types/University";

const BLUE = "#05058c";

const FacultyManagementPage: React.FC = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [newFacultyName, setNewFacultyName] = useState("");
  const [editingFacultyId, setEditingFacultyId] = useState<string | null>(null);
  const [editFacultyName, setEditFacultyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllFaculties();
      setFaculties(data);
    } catch (err: any) {
      console.error("Failed to fetch faculties:", err.response?.data || err.message);
      setError("Failed to fetch faculties: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const request: CreateUpdateFacultyRequest = { name: newFacultyName };
      await createFaculty(request);
      alert("Faculty created successfully!");
      setNewFacultyName("");
      fetchFaculties();
    } catch (err: any) {
      console.error("Failed to create faculty:", err.response?.data || err.message);
      setError("Failed to create faculty: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this faculty?")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteFaculty(id);
      alert("Faculty deleted successfully!");
      fetchFaculties();
    } catch (err: any) {
      console.error("Failed to delete faculty:", err.response?.data || err.message);
      setError("Failed to delete faculty: " + (err.response?.data || err.message) + ". (Check if departments/users are linked to this faculty)");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (faculty: Faculty) => {
    setEditingFacultyId(faculty.id);
    setEditFacultyName(faculty.name);
  };

  const handleCancelEdit = () => {
    setEditingFacultyId(null);
    setEditFacultyName("");
  };

  const handleSaveEdit = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const request: CreateUpdateFacultyRequest = { name: editFacultyName };
      await updateFaculty(id, request);
      alert("Faculty updated successfully!");
      handleCancelEdit();
      fetchFaculties();
    } catch (err: any) {
      console.error("Failed to update faculty:", err.response?.data || err.message);
      setError("Failed to update faculty: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8">
      <div
        className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-4xl border"
        style={{ borderColor: BLUE }}
      >
        <h1
          className="text-2xl font-extrabold mb-8 text-center tracking-tight drop-shadow"
          style={{ color: BLUE }}
        >
          Faculty Management
        </h1>
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}

        {/* Add Faculty Form */}
        <form onSubmit={handleCreateFaculty} className="flex gap-3 items-center mb-10">
          <input
            type="text"
            placeholder="New Faculty Name"
            value={newFacultyName}
            onChange={(e) => setNewFacultyName(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
            required
          />
          <button
            type="submit"
            className="px-8 py-3 rounded-xl shadow font-bold text-base hover:opacity-90 active:scale-95 transition min-w-[90px]"
            style={{ backgroundColor: BLUE, color: "#fff" }}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Faculty"}
          </button>
        </form>

        {/* Faculty List */}
        <div className="overflow-x-auto rounded-2xl shadow">
          <table className="min-w-full bg-white rounded-2xl overflow-hidden text-base">
            <thead>
              <tr>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Faculty Name</th>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && faculties.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-6 text-center text-gray-500">
                    No faculties found.
                  </td>
                </tr>
              ) : (
                faculties.map((faculty) => (
                  <tr key={faculty.id} className="hover:bg-blue-50 transition group">
                    <td className="py-3 px-6 border-b border-gray-100">
                      {editingFacultyId === faculty.id ? (
                        <input
                          type="text"
                          value={editFacultyName}
                          onChange={(e) => setEditFacultyName(e.target.value)}
                          className="p-2 border rounded-lg text-base"
                        />
                      ) : (
                        <span className="font-semibold">{faculty.name}</span>
                      )}
                    </td>
                    <td className="py-3 px-6 border-b border-gray-100 flex gap-2 justify-center">
                      {editingFacultyId === faculty.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(faculty.id)}
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
                            onClick={() => handleStartEdit(faculty)}
                            className="px-4 py-2 rounded-lg font-bold text-base bg-yellow-500 text-white hover:bg-yellow-600"
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFaculty(faculty.id)}
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

export default FacultyManagementPage;