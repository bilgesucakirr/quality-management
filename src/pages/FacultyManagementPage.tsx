// src/pages/FacultyManagementPage.tsx
import React, { useState, useEffect } from "react";
import { getAllFaculties, createFaculty, updateFaculty, deleteFaculty } from "../api/UniversityService";
import type { Faculty, CreateUpdateFacultyRequest } from "../types/University";
import { useAuthStore } from "../store/AuthStore"; // Yetkilendirme için eklendi
import { useNavigate } from "react-router-dom";   // Yönlendirme için eklendi

const BG = "#f8f9fb";
const PRIMARY_BLUE = "#21409a"; // Proje genelinde kullanılan ana renk
const BORDER_COLOR = "#e5eaf8"; // Proje genelinde kullanılan border rengi

const FacultyManagementPage: React.FC = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [newFacultyName, setNewFacultyName] = useState("");
  const [editingFacultyId, setEditingFacultyId] = useState<string | null>(null);
  const [editFacultyName, setEditFacultyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { role } = useAuthStore(); // Yetki kontrolü için rolü al
  const navigate = useNavigate();   // Yönlendirme için

  useEffect(() => {
    if (role === "ADMIN") {
      fetchFaculties();
    } else {
      setError("You are not authorized to view this page.");
      // İsteğe bağlı: navigate('/dashboard'); veya başka bir sayfaya yönlendirme
    }
  }, [role]); // role değiştiğinde useEffect'i tetikle

  const fetchFaculties = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllFaculties();
      setFaculties(data);
    } catch (err: any) {
      console.error("Failed to fetch faculties:", err.response?.data || err.message);
      setError("Failed to fetch faculties: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacultyName.trim()) {
        setError("Faculty name cannot be empty.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const request: CreateUpdateFacultyRequest = { name: newFacultyName };
      await createFaculty(request);
      setNewFacultyName("");
      fetchFaculties();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to create faculty.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this faculty? This may affect related departments and courses.")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteFaculty(id);
      fetchFaculties();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to delete faculty.");
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

  const handleSaveEdit = async (id:string) => {
    if (!editFacultyName.trim()) {
        setError("Faculty name cannot be empty for update.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const request: CreateUpdateFacultyRequest = { name: editFacultyName };
      await updateFaculty(id, request);
      handleCancelEdit();
      fetchFaculties();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to update faculty.");
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
      <div className="w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-[#21409a] text-center tracking-tight">Faculty Management</h1>
        
        <form
          onSubmit={handleCreateFaculty}
          className="w-full max-w-md bg-white rounded-xl shadow p-6 mb-8 border flex flex-col sm:flex-row items-center gap-3"
          style={{ borderColor: BORDER_COLOR }}
        >
          <input
            type="text"
            placeholder="New Faculty Name"
            value={newFacultyName}
            onChange={(e) => setNewFacultyName(e.target.value)}
            className="flex-grow p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
            required
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#21409a] hover:bg-[#18316e] text-white font-semibold text-sm shadow-md transition-all duration-150"
            style={{ letterSpacing: ".03em" }}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Faculty"}
          </button>
        </form>

        {error && <div className="text-red-600 text-center mb-4 p-3 bg-red-100 border border-red-300 rounded-md w-full max-w-md">{error}</div>}
        
        {loading && !faculties.length && <div className="text-center text-[#21409a] py-8">Loading faculties...</div>}
        {!loading && faculties.length === 0 && !error && (
          <div className="text-center text-gray-600 py-8">No faculties found.</div>
        )}

        {faculties.length > 0 && (
            <div className="w-full max-w-2xl overflow-x-auto rounded-lg border shadow" style={{ borderColor: BORDER_COLOR }}>
            <table className="min-w-full bg-white text-sm rounded-lg">
              <thead >
                <tr>
                  <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold text-left">Faculty Name</th>
                  <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {faculties.map((faculty) => (
                  <tr key={faculty.id} className="hover:bg-blue-50 transition">
                    <td className="py-2.5 px-4 border-b border-gray-100">
                      {editingFacultyId === faculty.id ? (
                        <input
                          type="text"
                          value={editFacultyName}
                          onChange={(e) => setEditFacultyName(e.target.value)}
                          className="p-2 border border-gray-300 rounded-md text-sm w-full focus:ring-1 focus:ring-[#21409a]"
                        />
                      ) : (
                        <span className="font-medium text-gray-800">{faculty.name}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 border-b border-gray-100 text-center">
                      {editingFacultyId === faculty.id ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleSaveEdit(faculty.id)}
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
                            onClick={() => handleStartEdit(faculty)}
                            className="px-3 py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-xs font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteFaculty(faculty.id)}
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

export default FacultyManagementPage;