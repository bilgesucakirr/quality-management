import React, { useState, useEffect, useCallback } from "react";
import {
  createYokakCriterion,
  getAllYokakCriteria,
  updateYokakCriterion,
  deleteYokakCriterion,
  getYokakCriteriaByLevel,
} from "../api/YokakCriterionService";
import type { YokakCriterionResponse } from "../types/YokakCriterion";
import { useAuthStore } from "../store/AuthStore";

const PRIMARY = "#21409a";
const BORDER = "#e3e6ea";
const BG_GRAY = "#f7f7f9";

type CriterionLevel = "HEADER" | "MAIN_CRITERION" | "SUB_CRITERION";

const YokakCriterionManagement: React.FC = () => {
  const [criteria, setCriteria] = useState<YokakCriterionResponse[]>([]);
  const [allHeaders, setAllHeaders] = useState<YokakCriterionResponse[]>([]);
  const [allMainCriteria, setAllMainCriteria] = useState<YokakCriterionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterLevel, setFilterLevel] = useState<"" | CriterionLevel>("");
  const [filterParentId, setFilterParentId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState<CriterionLevel>("HEADER");
  const [newSelectedParentOfMainId, setNewSelectedParentOfMainId] = useState("");
  const [newParentId, setNewParentId] = useState("");

  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editLevel, setEditLevel] = useState<CriterionLevel>("HEADER");
  const [editSelectedParentOfMainId, setEditSelectedParentOfMainId] = useState("");
  const [editParentId, setEditParentId] = useState("");

  const { role } = useAuthStore();

  const fetchDataWithFilters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllYokakCriteria(filterLevel, filterParentId, searchTerm);
      setCriteria(data);
    } catch (err) {
      setError("Failed to fetch criteria. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filterLevel, filterParentId, searchTerm]);

  const fetchParentOptionsForDropdowns = useCallback(async () => {
    try {
      const headerData = await getYokakCriteriaByLevel("HEADER");
      setAllHeaders(headerData);
      const mainCriteriaData = await getYokakCriteriaByLevel("MAIN_CRITERION");
      setAllMainCriteria(mainCriteriaData);
    } catch (err) {}
  }, []);

  useEffect(() => {
    if (role === "ADMIN" || role === "STAFF") {
      fetchParentOptionsForDropdowns();
    } else {
      setError("You are not authorized to view this page.");
    }
  }, [role, fetchParentOptionsForDropdowns]);

  useEffect(() => {
    if (role === "ADMIN" || role === "STAFF") {
      fetchDataWithFilters();
    }
  }, [filterLevel, filterParentId, searchTerm, fetchDataWithFilters, role]);

  const handleCreateCriterion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalParentId = newLevel === "MAIN_CRITERION" ? newParentId : newParentId;

    if (newLevel !== "HEADER" && !finalParentId) {
      setError("Main and Sub criteria must have a parent selected.");
      setLoading(false);
      return;
    }
    if (newLevel === "HEADER" && finalParentId) {
      setError("Header criterion cannot have a parent.");
      setLoading(false);
      return;
    }
    try {
      await createYokakCriterion({
        code: newCode,
        name: newName,
        level: newLevel,
        parentId: finalParentId || null,
      });
      setNewCode("");
      setNewName("");
      setNewLevel("HEADER");
      setNewSelectedParentOfMainId("");
      setNewParentId("");
      setSearchTerm("");
      setFilterLevel("");
      setFilterParentId("");
      fetchDataWithFilters();
      fetchParentOptionsForDropdowns();
    } catch {
      setError("Failed to create criterion.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (criterion: YokakCriterionResponse) => {
    setEditingCriterionId(criterion.id);
    setEditCode(criterion.code);
    setEditName(criterion.name);
    setEditLevel(criterion.level);

    if (criterion.level === "MAIN_CRITERION") {
      setEditSelectedParentOfMainId(criterion.parentId || "");
      setEditParentId(criterion.parentId || "");
    } else if (criterion.level === "SUB_CRITERION") {
      const mainCriterionParent = allMainCriteria.find(mc => mc.id === criterion.parentId)?.parentId;
      setEditSelectedParentOfMainId(mainCriterionParent || "");
      setEditParentId(criterion.parentId || "");
    } else {
      setEditSelectedParentOfMainId("");
      setEditParentId("");
    }
  };

  const handleCancelEdit = () => {
    setEditingCriterionId(null);
    setEditCode("");
    setEditName("");
    setEditLevel("HEADER");
    setEditSelectedParentOfMainId("");
    setEditParentId("");
  };

  const handleSaveEdit = async (id: string) => {
    setLoading(true);
    setError(null);

    const finalParentId = editLevel === "MAIN_CRITERION" ? editParentId : editParentId;

    if (editLevel !== "HEADER" && !finalParentId) {
      setError("Main and Sub criteria must have a parent selected.");
      setLoading(false);
      return;
    }
    if (editLevel === "HEADER" && finalParentId) {
      setError("Header criterion cannot have a parent.");
      setLoading(false);
      return;
    }
    try {
      await updateYokakCriterion(id, {
        code: editCode,
        name: editName,
        level: editLevel,
        parentId: finalParentId || null,
      });
      handleCancelEdit();
      fetchDataWithFilters();
      fetchParentOptionsForDropdowns();
    } catch {
      setError("Failed to update criterion.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCriterion = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this criterion?")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteYokakCriterion(id);
      fetchDataWithFilters();
      fetchParentOptionsForDropdowns();
    } catch {
      setError("Failed to delete criterion. It may be linked to questions or have sub-criteria.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLevel = e.target.value as CriterionLevel;
    setNewLevel(selectedLevel);
    setNewParentId("");
    setNewSelectedParentOfMainId("");

    if (selectedLevel === "MAIN_CRITERION") {
      if (allHeaders.length > 0) setNewParentId(allHeaders[0].id);
    } else if (selectedLevel === "SUB_CRITERION") {
      if (allHeaders.length > 0) {
        setNewSelectedParentOfMainId(allHeaders[0].id);
        const filteredMainCriteria = allMainCriteria.filter(mc => mc.parentId === allHeaders[0].id);
        if (filteredMainCriteria.length > 0) {
          setNewParentId(filteredMainCriteria[0].id);
        }
      }
    }
  };

  const handleEditLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLevel = e.target.value as CriterionLevel;
    setEditLevel(selectedLevel);
    setEditParentId("");
    setEditSelectedParentOfMainId("");
    if (selectedLevel === "MAIN_CRITERION") {
      if (allHeaders.length > 0) setEditParentId(allHeaders[0].id);
    } else if (selectedLevel === "SUB_CRITERION") {
      if (allHeaders.length > 0) {
        setEditSelectedParentOfMainId(allHeaders[0].id);
        const filteredMainCriteria = allMainCriteria.filter(mc => mc.parentId === allHeaders[0].id);
        if (filteredMainCriteria.length > 0) setEditParentId(filteredMainCriteria[0].id);
      }
    }
  };

  const handleResetFilters = () => {
    setFilterLevel("");
    setFilterParentId("");
    setSearchTerm("");
  };

  if (role !== "ADMIN" && role !== "STAFF") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-lg text-red-600">Access Denied.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-6" style={{ background: BG_GRAY }}>
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-3xl border" style={{ borderColor: BORDER }}>
        <h1 className="text-xl font-bold mb-5 text-left border-b pb-2" style={{ color: PRIMARY, borderBottom: `2px solid ${PRIMARY}` }}>
          YOKAK Criteria Management
        </h1>

        <form
          onSubmit={handleCreateCriterion}
          className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 p-4 border rounded-lg bg-[#f7f7f9]"
          style={{ borderColor: BORDER }}
        >
          <input
            type="text"
            placeholder="Criterion Code (e.g., A.1.1)"
            value={newCode}
            onChange={e => setNewCode(e.target.value)}
            className="p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#21409a]"
            required
          />
          <input
            type="text"
            placeholder="Criterion Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#21409a]"
            required
          />
          <select
            value={newLevel}
            onChange={handleNewLevelChange}
            className="p-2 border border-gray-300 rounded-md text-sm bg-white"
            required
          >
            <option value="HEADER">Header</option>
            <option value="MAIN_CRITERION">Main</option>
            <option value="SUB_CRITERION">Sub</option>
          </select>
          {newLevel === "HEADER" ? (
            <input className="p-2 border border-gray-100 rounded-md text-sm bg-gray-100" value="No Parent" disabled />
          ) : newLevel === "MAIN_CRITERION" ? (
            <select
              value={newParentId}
              onChange={e => setNewParentId(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-sm bg-white"
              required
              disabled={allHeaders.length === 0}
            >
              <option value="" disabled>Select Header Parent</option>
              {allHeaders.map(parent => (
                <option key={parent.id} value={parent.id}>{parent.code} - {parent.name}</option>
              ))}
            </select>
          ) : (
            <div className="flex flex-col gap-1">
              <select
                value={newSelectedParentOfMainId}
                onChange={e => {
                  setNewSelectedParentOfMainId(e.target.value);
                  setNewParentId("");
                  const filteredMainCriteria = allMainCriteria.filter(mc => mc.parentId === e.target.value);
                  if (filteredMainCriteria.length > 0) setNewParentId(filteredMainCriteria[0].id);
                }}
                className="p-2 border border-gray-300 rounded-md text-sm bg-white"
                required
                disabled={allHeaders.length === 0}
              >
                <option value="" disabled>Select Header</option>
                {allHeaders.map(parent => (
                  <option key={parent.id} value={parent.id}>{parent.code} - {parent.name}</option>
                ))}
              </select>
              <select
                value={newParentId}
                onChange={e => setNewParentId(e.target.value)}
                className="p-2 border border-gray-300 rounded-md text-sm bg-white"
                required
                disabled={!newSelectedParentOfMainId || allMainCriteria.filter(mc => mc.parentId === newSelectedParentOfMainId).length === 0}
              >
                <option value="" disabled>Select Main Criterion Parent</option>
                {allMainCriteria.filter(mc => mc.parentId === newSelectedParentOfMainId).map(parent => (
                  <option key={parent.id} value={parent.id}>{parent.code} - {parent.name}</option>
                ))}
              </select>
            </div>
          )}
          <button
            type="submit"
            className="col-span-full bg-[#21409a] hover:bg-[#17306d] text-white font-semibold text-sm rounded-md h-8 min-w-[96px] transition-all duration-200 shadow-sm focus:ring-2 focus:ring-[#21409a] focus:outline-none flex items-center justify-center"
            disabled={loading}
            style={{ letterSpacing: "0.02em" }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 mr-1 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" /></svg>
                Adding...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add
              </span>
            )}
          </button>
        </form>

        <div className="flex flex-col gap-2 mb-4 p-4 border rounded-lg bg-[#f7f7f9]" style={{ borderColor: BORDER }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Search by code or name"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-sm"
            />
            <select
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value as "" | CriterionLevel)}
              className="p-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option value="">All Levels</option>
              <option value="HEADER">Header</option>
              <option value="MAIN_CRITERION">Main</option>
              <option value="SUB_CRITERION">Sub</option>
            </select>
            <select
              value={filterParentId}
              onChange={e => setFilterParentId(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-sm bg-white"
              disabled={
                !!searchTerm ||
                filterLevel === "HEADER" ||
                (filterLevel === "MAIN_CRITERION" && allHeaders.length === 0) ||
                (filterLevel === "SUB_CRITERION" && allMainCriteria.length === 0)
              }
            >
              <option value="">All Parents</option>
              {filterLevel === "MAIN_CRITERION" && allHeaders.map(parent => (
                <option key={parent.id} value={parent.id}>{parent.code} - {parent.name}</option>
              ))}
              {filterLevel === "SUB_CRITERION" && allMainCriteria.map(parent => (
                <option key={parent.id} value={parent.id}>{parent.code} - {parent.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleResetFilters}
            type="button"
            className="w-max px-4 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
          >
            Reset
          </button>
        </div>

        {error && <div className="text-red-600 text-center mb-3">{error}</div>}
        {loading && <div className="text-center text-[#21409a]">Loading...</div>}
        {!loading && criteria.length === 0 && (
          <div className="text-center text-gray-600 text-sm">No criteria found.</div>
        )}

        <div className="grid grid-cols-1 gap-2">
          {criteria.map((criterion) => (
            <div
              key={criterion.id}
              className="bg-white rounded-lg shadow p-3 border flex flex-col md:flex-row justify-between items-center hover:scale-[1.01] transition"
              style={{ borderColor: BORDER }}
            >
              {editingCriterionId === criterion.id ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-1 w-full">
                  <input
                    type="text"
                    value={editCode}
                    onChange={e => setEditCode(e.target.value)}
                    className="p-2 border rounded-md text-sm"
                  />
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="p-2 border rounded-md text-sm"
                  />
                  <select
                    value={editLevel}
                    onChange={handleEditLevelChange}
                    className="p-2 border rounded-md bg-white text-sm"
                  >
                    <option value="HEADER">Header</option>
                    <option value="MAIN_CRITERION">Main</option>
                    <option value="SUB_CRITERION">Sub</option>
                  </select>
                  {editLevel === "HEADER" ? (
                    <input className="p-2 border border-gray-100 rounded-md text-sm bg-gray-100" value="No Parent" disabled />
                  ) : editLevel === "MAIN_CRITERION" ? (
                    <select
                      value={editParentId}
                      onChange={e => setEditParentId(e.target.value)}
                      className="p-2 border rounded-md text-sm bg-white"
                      required
                      disabled={allHeaders.filter(h => h.id !== criterion.id).length === 0}
                    >
                      <option value="" disabled>Select Header Parent</option>
                      {allHeaders.filter(h => h.id !== criterion.id).map(parent => (
                        <option key={parent.id} value={parent.id}>{parent.code} - {parent.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <select
                        value={editSelectedParentOfMainId}
                        onChange={e => {
                          setEditSelectedParentOfMainId(e.target.value);
                          setEditParentId("");
                          const filteredMainCriteria = allMainCriteria.filter(mc => mc.parentId === e.target.value && mc.id !== criterion.id);
                          if (filteredMainCriteria.length > 0) setEditParentId(filteredMainCriteria[0].id);
                        }}
                        className="p-2 border rounded-md text-sm bg-white"
                        required
                        disabled={allHeaders.filter(h => h.id !== criterion.id).length === 0}
                      >
                        <option value="" disabled>Select Header</option>
                        {allHeaders.filter(h => h.id !== criterion.id).map(parent => (
                          <option key={parent.id} value={parent.id}>{parent.code} - {parent.name}</option>
                        ))}
                      </select>
                      <select
                        value={editParentId}
                        onChange={e => setEditParentId(e.target.value)}
                        className="p-2 border rounded-md text-sm bg-white"
                        required
                        disabled={!editSelectedParentOfMainId || allMainCriteria.filter(mc => mc.parentId === editSelectedParentOfMainId && mc.id !== criterion.id).length === 0}
                      >
                        <option value="" disabled>Select Main Criterion Parent</option>
                        {allMainCriteria.filter(mc => mc.parentId === editSelectedParentOfMainId && mc.id !== criterion.id).map(parent => (
                          <option key={parent.id} value={parent.id}>{parent.code} - {parent.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="md:col-span-2 flex gap-2 justify-end mt-1">
                    <button
                      onClick={() => handleSaveEdit(criterion.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                      disabled={loading}
                    >Save</button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                      disabled={loading}
                    >Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-between">
                  <div>
                    <span className="font-semibold text-base" style={{ color: PRIMARY }}>{criterion.code}</span>
                    <span className="text-gray-700 ml-2">- {criterion.name}</span>
                    <span className="text-gray-500 ml-2 text-xs">({criterion.level})</span>
                    {criterion.parentCode && (
                      <span className="text-gray-400 ml-2 text-xs">Parent: {criterion.parentCode}</span>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2 md:mt-0">
                    <button
                      onClick={() => handleStartEdit(criterion)}
                      className="px-3 py-1 rounded-md bg-[#d8e6fa] text-[#21409a] font-medium text-xs hover:bg-[#21409a] hover:text-white transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCriterion(criterion.id)}
                      className="px-3 py-1 rounded-md bg-[#fdecea] text-[#d93b32] font-medium text-xs hover:bg-[#d93b32] hover:text-white transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YokakCriterionManagement;
