import React, { useState, useEffect, useCallback } from "react";
import {
  createYokakCriterion,
  getAllYokakCriteria,
  updateYokakCriterion,
  deleteYokakCriterion,
  getYokakCriteriaByLevel, // Headers ve Main Criteria'yı ayrı ayrı çekmek için
} from "../api/YokakCriterionService";
import type { YokakCriterionResponse } from "../types/YokakCriterion";
import { useAuthStore } from "../store/AuthStore";

const BLUE = "#05058c";

type CriterionLevel = "HEADER" | "MAIN_CRITERION" | "SUB_CRITERION";

const YokakCriterionManagement: React.FC = () => {
  const [criteria, setCriteria] = useState<YokakCriterionResponse[]>([]); // Görüntülenen kriterler listesi
  const [allHeaders, setAllHeaders] = useState<YokakCriterionResponse[]>([]); // Tüm HEADER seviyesi kriterler (parent dropdown'ları için)
  const [allMainCriteria, setAllMainCriteria] = useState<YokakCriterionResponse[]>([]); // Tüm MAIN_CRITERION seviyesi kriterler (parent dropdown'ları için)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [filterLevel, setFilterLevel] = useState<"" | CriterionLevel>("");
  const [filterParentId, setFilterParentId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Form states for new criterion
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState<CriterionLevel>("HEADER");
  const [newSelectedParentOfMainId, setNewSelectedParentOfMainId] = useState(""); // Yeni: Sadece Main Criterion için parent (Header) seçimi
  const [newParentId, setNewParentId] = useState(""); // Nihai parent'ın ID'si (Main veya Sub Criterion için)

  // Form states for editing criterion
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editLevel, setEditLevel] = useState<CriterionLevel>("HEADER");
  const [editSelectedParentOfMainId, setEditSelectedParentOfMainId] = useState(""); // Yeni: Sadece Main Criterion için parent (Header) seçimi
  const [editParentId, setEditParentId] = useState(""); // Nihai parent'ın ID'si

  const { role } = useAuthStore();

  const fetchDataWithFilters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllYokakCriteria(filterLevel, filterParentId, searchTerm);
      setCriteria(data);
    } catch (err) {
      console.error("Failed to fetch YÖKAK criteria:", err);
      setError("Failed to fetch YÖKAK criteria. Please try again.");
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
    } catch (err) {
        console.error("Failed to fetch parent options for dropdowns:", err);
    }
  }, []);

  useEffect(() => {
    if (role === "ADMIN" || role === "STAFF") {
      fetchDataWithFilters();
      fetchParentOptionsForDropdowns();
    } else {
      setError("You are not authorized to view this page.");
    }
  }, [role, fetchDataWithFilters, fetchParentOptionsForDropdowns]);

  const handleCreateCriterion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Dynamic parentId validation
    const finalParentId = newLevel === "MAIN_CRITERION" ? newSelectedParentOfMainId : newParentId;

    if (newLevel !== "HEADER" && !finalParentId) {
      setError("Main and Sub criteria must have a parent selected.");
      setLoading(false);
      return;
    }
    if (newLevel === "HEADER" && finalParentId) { // Headers should not have parent
      setError("Header criteria cannot have a parent.");
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
      alert("YÖKAK Criterion created successfully!");
      setNewCode("");
      setNewName("");
      setNewLevel("HEADER");
      setNewSelectedParentOfMainId("");
      setNewParentId("");
      setSearchTerm("");
      setFilterLevel("");
      setFilterParentId("");
    } catch (err: any) {
      console.error("Failed to create YÖKAK criterion:", err);
      setError(err.response?.data || "Failed to create YÖKAK criterion.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (criterion: YokakCriterionResponse) => {
    setEditingCriterionId(criterion.id);
    setEditCode(criterion.code);
    setEditName(criterion.name);
    setEditLevel(criterion.level);

    // Set parent selection for edit form based on its level
    if (criterion.level === "MAIN_CRITERION") {
        setEditSelectedParentOfMainId(criterion.parentId || "");
        setEditParentId(""); // Make sure main parent is not set
    } else if (criterion.level === "SUB_CRITERION") {
        // Find the Main Criterion's parent (Header) for the Sub Criterion
        const mainCriterionParent = allMainCriteria.find(mc => mc.id === criterion.parentId)?.parentId;
        setEditSelectedParentOfMainId(mainCriterionParent || "");
        setEditParentId(criterion.parentId || ""); // Set Sub Criterion's actual parent (Main Criterion)
    } else { // HEADER level
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

    const finalParentId = editLevel === "MAIN_CRITERION" ? editSelectedParentOfMainId : editParentId;

    if (editLevel !== "HEADER" && !finalParentId) {
      setError("Main and Sub criteria must have a parent selected for update.");
      setLoading(false);
      return;
    }
    if (editLevel === "HEADER" && finalParentId) {
      setError("Header criteria cannot have a parent for update.");
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
      alert("YÖKAK Criterion updated successfully!");
      handleCancelEdit();
      fetchDataWithFilters();
      fetchParentOptionsForDropdowns();
    } catch (err: any) {
      console.error("Failed to update YÖKAK criterion:", err);
      setError(err.response?.data || "Failed to update YÖKAK criterion.");
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
      alert("YÖKAK Criterion deleted successfully!");
      fetchDataWithFilters();
      fetchParentOptionsForDropdowns();
    } catch (err: any) {
      console.error("Failed to delete YÖKAK criterion:", err);
      setError(err.response?.data || "Failed to delete YÖKAK criterion. It might be linked to questions or have children.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredParentsForNewCriterion = (selectedParentOfMainId: string) => {
    if (newLevel === "MAIN_CRITERION") {
        return allHeaders;
    } else if (newLevel === "SUB_CRITERION") {
        // Filter Main Criteria based on selected Header
        return allMainCriteria.filter(mc => mc.parentId === selectedParentOfMainId);
    }
    return [];
  };

  const getFilteredParentsForEditCriterion = (selectedParentOfMainId: string, currentCriterionId?: string) => {
    let options: YokakCriterionResponse[] = [];
    if (editLevel === "MAIN_CRITERION") {
        options = allHeaders;
    } else if (editLevel === "SUB_CRITERION") {
        options = allMainCriteria.filter(mc => mc.parentId === selectedParentOfMainId);
    }
    // Exclude the criterion itself from its parent options in edit mode (prevents self-parenting)
    if (currentCriterionId) {
        options = options.filter(option => option.id !== currentCriterionId);
    }
    return options;
  };

  const handleFilterLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterLevel(e.target.value as "" | CriterionLevel);
    setFilterParentId(""); // Reset parent filter when level filter changes
    setSearchTerm(""); // Reset search term when level filter changes
  };

  const handleFilterParentIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterParentId(e.target.value);
    setFilterLevel(""); // Reset level filter when parent filter changes
    setSearchTerm(""); // Reset search term when parent filter changes
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setFilterLevel(""); // Reset level filter when search term changes
    setFilterParentId(""); // Reset parent filter when search term changes
  };

  // Handle Level change for NEW criterion form:
  const handleNewLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLevel = e.target.value as CriterionLevel;
    setNewLevel(selectedLevel);
    setNewParentId(""); // Her level değiştiğinde nihai parent'ı sıfırla
    setNewSelectedParentOfMainId(""); // Parent of Main/Sub criterion'ı sıfırla

    if (selectedLevel === "MAIN_CRITERION") {
      // Eğer Main Criterion seçilirse, Parent olarak ilk Header'ı otomatik seç
      if (allHeaders.length > 0) {
        setNewParentId(allHeaders[0].id); // Main Criterion'ın direkt parent'ı Header'dır
      }
    } else if (selectedLevel === "SUB_CRITERION") {
      // Eğer Sub Criterion seçilirse, önce bir Header seçilmeli (parentOfMainId), sonra o Header'ın altındaki Main Criterion'lar listelenmeli.
      // Burada ilk Header'ı parentOfMainId olarak seçelim ve onun altındaki ilk Main Criterion'ı nihai parent olarak atayalım.
      if (allHeaders.length > 0) {
        setNewSelectedParentOfMainId(allHeaders[0].id);
        const filteredMainCriteria = allMainCriteria.filter(mc => mc.parentId === allHeaders[0].id);
        if (filteredMainCriteria.length > 0) {
          setNewParentId(filteredMainCriteria[0].id); // Sub Criterion'ın direkt parent'ı Main Criterion'dır
        }
      }
    }
  };

  // Handle Level change for EDIT criterion form:
  const handleEditLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLevel = e.target.value as CriterionLevel;
    setEditLevel(selectedLevel);
    setEditParentId(""); // Her level değiştiğinde nihai parent'ı sıfırla
    setEditSelectedParentOfMainId(""); // Parent of Main/Sub criterion'ı sıfırla

    if (selectedLevel === "MAIN_CRITERION") {
      const availableParents = allHeaders.filter(h => h.id !== editingCriterionId); // Kendisi hariç
      if (availableParents.length > 0) {
        setEditParentId(availableParents[0].id);
      }
    } else if (selectedLevel === "SUB_CRITERION") {
      if (allHeaders.length > 0) {
        setEditSelectedParentOfMainId(allHeaders[0].id); // İlk Header'ı parentOfMainId olarak seç
        const filteredMainCriteria = allMainCriteria.filter(mc => mc.parentId === allHeaders[0].id && mc.id !== editingCriterionId); // Kendisi hariç
        if (filteredMainCriteria.length > 0) {
          setEditParentId(filteredMainCriteria[0].id);
        }
      }
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
          YÖKAK Criterion Management
        </h1>

        {/* Add Criterion Form */}
        <form
          onSubmit={handleCreateCriterion}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center mb-10 p-6 border rounded-2xl"
          style={{ borderColor: BLUE }}
        >
          <h2 className="col-span-full text-xl font-bold mb-3" style={{ color: BLUE }}>
            Create New Criterion
          </h2>
          <input
            type="text"
            placeholder="Criterion Code (e.g., A.1.1)"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
            required
          />
          <input
            type="text"
            placeholder="Criterion Name (e.g., Yönetişim modeli)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
            required
          />
          <select
            value={newLevel}
            onChange={handleNewLevelChange}
            className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#05058c] outline-none transition"
            required
          >
            <option value="HEADER">Header</option>
            <option value="MAIN_CRITERION">Main Criterion</option>
            <option value="SUB_CRITERION">Sub Criterion</option>
          </select>

          {/* Parent selection for MAIN_CRITERION and SUB_CRITERION */}
          {newLevel === "HEADER" ? (
            <select
              value=""
              onChange={() => {}}
              className="p-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-500 outline-none transition cursor-not-allowed"
              disabled
            >
              <option value="">No Parent</option>
            </select>
          ) : newLevel === "MAIN_CRITERION" ? (
            <select
              value={newParentId}
              onChange={(e) => setNewParentId(e.target.value)}
              className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#05058c] outline-none transition"
              required
              disabled={allHeaders.length === 0}
            >
              <option value="" disabled>Select Header Parent</option>
              {allHeaders.map(parent => (
                <option key={parent.id} value={parent.id}>
                  {parent.code} - {parent.name}
                </option>
              ))}
            </select>
          ) : ( // newLevel === "SUB_CRITERION"
            <div className="flex flex-col gap-2">
                <select
                    value={newSelectedParentOfMainId}
                    onChange={(e) => {
                        setNewSelectedParentOfMainId(e.target.value);
                        // Header değişince Main Criterion'ı sıfırla ve filtrele
                        setNewParentId("");
                        const filteredMainCriteria = allMainCriteria.filter(mc => mc.parentId === e.target.value);
                        if (filteredMainCriteria.length > 0) {
                            setNewParentId(filteredMainCriteria[0].id); // İlk Main Criterion'ı otomatik seç
                        }
                    }}
                    className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#05058c] outline-none transition"
                    required
                    disabled={allHeaders.length === 0}
                >
                    <option value="" disabled>Select Header</option>
                    {allHeaders.map(parent => (
                        <option key={parent.id} value={parent.id}>
                            {parent.code} - {parent.name}
                        </option>
                    ))}
                </select>
                <select
                    value={newParentId}
                    onChange={(e) => setNewParentId(e.target.value)}
                    className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#05058c] outline-none transition"
                    required
                    disabled={!newSelectedParentOfMainId || allMainCriteria.filter(mc => mc.parentId === newSelectedParentOfMainId).length === 0}
                >
                    <option value="" disabled>Select Main Criterion Parent</option>
                    {allMainCriteria.filter(mc => mc.parentId === newSelectedParentOfMainId).map(parent => (
                        <option key={parent.id} value={parent.id}>
                            {parent.code} - {parent.name}
                        </option>
                    ))}
                </select>
            </div>
          )}

          <button
            type="submit"
            className="col-span-full px-8 py-3 rounded-xl text-white font-bold text-base shadow"
            style={{ backgroundColor: BLUE, transition: "background 0.2s" }}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Criterion"}
          </button>
        </form>

        {/* Filter and Search Section */}
        <div className="flex flex-col gap-4 mb-8 p-6 border rounded-2xl" style={{ borderColor: BLUE }}>
            <h2 className="text-xl font-bold" style={{ color: BLUE }}>
                Filter & Search Criteria
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                    type="text"
                    placeholder="Search by Code or Name..."
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                    className="p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition md:col-span-1"
                />
                <select
                    value={filterLevel}
                    onChange={handleFilterLevelChange}
                    className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#05058c] outline-none transition"
                >
                    <option value="">All Levels</option>
                    <option value="HEADER">Header</option>
                    <option value="MAIN_CRITERION">Main Criterion</option>
                    <option value="SUB_CRITERION">Sub Criterion</option>
                </select>
                <select
                    value={filterParentId}
                    onChange={handleFilterParentIdChange}
                    className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#05058c] outline-none transition"
                    // Disabled if searching, or filtering by headers, or no parent options for the selected filter level
                    disabled={
                        !!searchTerm ||
                        filterLevel === "HEADER" ||
                        (filterLevel === "MAIN_CRITERION" && allHeaders.length === 0) ||
                        (filterLevel === "SUB_CRITERION" && allMainCriteria.length === 0)
                    }
                >
                    <option value="">All Parents</option>
                    {/* Parent options for filter dropdown based on the selected filterLevel */}
                    {filterLevel === "MAIN_CRITERION" && allHeaders.map(parent => (
                        <option key={parent.id} value={parent.id}>
                            {parent.code} - {parent.name}
                        </option>
                    ))}
                    {filterLevel === "SUB_CRITERION" && allMainCriteria.map(parent => (
                        <option key={parent.id} value={parent.id}>
                            {parent.code} - {parent.name}
                        </option>
                    ))}
                </select>
            </div>
            <button
                onClick={() => { setFilterLevel(""); setFilterParentId(""); setSearchTerm(""); }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
                Reset Filters
            </button>
        </div>


        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        {loading && <div className="text-center" style={{ color: BLUE }}>Loading criteria...</div>}
        {!loading && criteria.length === 0 && (
          <div className="text-center text-gray-600">No YÖKAK criteria found.</div>
        )}

        {/* Criterion List */}
        <div className="grid grid-cols-1 gap-4">
          {criteria.map((criterion) => (
            <div
              key={criterion.id}
              className="bg-white rounded-xl shadow-md p-4 border flex flex-col md:flex-row justify-between items-center"
              style={{ borderColor: BLUE }}
            >
              {editingCriterionId === criterion.id ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="p-2 border rounded-lg text-base"
                  />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="p-2 border rounded-lg text-base"
                  />
                  <select
                    value={editLevel}
                    onChange={handleEditLevelChange} // Düzeltme: handleEditLevelChange kullanıldı
                    className="p-2 border rounded-lg bg-white text-base"
                  >
                    <option value="HEADER">Header</option>
                    <option value="MAIN_CRITERION">Main Criterion</option>
                    <option value="SUB_CRITERION">Sub Criterion</option>
                  </select>
                  
                  {/* Parent selection for editing form */}
                  {editLevel === "HEADER" ? (
                    <select
                      value=""
                      onChange={() => {}}
                      className="p-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-500 outline-none transition cursor-not-allowed"
                      disabled
                    >
                      <option value="">No Parent</option>
                    </select>
                  ) : editLevel === "MAIN_CRITERION" ? (
                    <select
                      value={editParentId}
                      onChange={(e) => setEditParentId(e.target.value)}
                      className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#05058c] outline-none transition"
                      required
                      disabled={allHeaders.filter(h => h.id !== criterion.id).length === 0} // Kendisi hariç
                    >
                      <option value="" disabled>Select Header Parent</option>
                      {allHeaders.filter(h => h.id !== criterion.id).map(parent => (
                        <option key={parent.id} value={parent.id}>
                          {parent.code} - {parent.name}
                        </option>
                      ))}
                    </select>
                  ) : ( // editLevel === "SUB_CRITERION"
                    <div className="flex flex-col gap-2">
                        <select
                            value={editSelectedParentOfMainId}
                            onChange={(e) => {
                                setEditSelectedParentOfMainId(e.target.value);
                                setEditParentId(""); // Header değişince Main Criterion'ı sıfırla
                                const filteredMainCriteria = allMainCriteria.filter(mc => mc.parentId === e.target.value && mc.id !== criterion.id); // Kendisi hariç
                                if (filteredMainCriteria.length > 0) {
                                    setEditParentId(filteredMainCriteria[0].id); // İlk Main Criterion'ı otomatik seç
                                }
                            }}
                            className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#05058c] outline-none transition"
                            required
                            disabled={allHeaders.filter(h => h.id !== criterion.id).length === 0}
                        >
                            <option value="" disabled>Select Header</option>
                            {allHeaders.filter(h => h.id !== criterion.id).map(parent => (
                                <option key={parent.id} value={parent.id}>
                                    {parent.code} - {parent.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={editParentId}
                            onChange={(e) => setEditParentId(e.target.value)}
                            className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#05058c] outline-none transition"
                            required
                            disabled={!editSelectedParentOfMainId || allMainCriteria.filter(mc => mc.parentId === editSelectedParentOfMainId && mc.id !== criterion.id).length === 0}
                        >
                            <option value="" disabled>Select Main Criterion Parent</option>
                            {allMainCriteria.filter(mc => mc.parentId === editSelectedParentOfMainId && mc.id !== criterion.id).map(parent => (
                                <option key={parent.id} value={parent.id}>
                                    {parent.code} - {parent.name}
                                </option>
                            ))}
                        </select>
                    </div>
                  )}

                  <div className="md:col-span-2 flex gap-2 justify-end mt-2">
                    <button
                      onClick={() => handleSaveEdit(criterion.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      disabled={loading}
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-between">
                  <div>
                    <span className="font-semibold text-lg" style={{ color: BLUE }}>{criterion.code}</span>
                    <span className="text-gray-700 ml-3">- {criterion.name}</span>
                    <span className="text-gray-500 ml-3 text-sm">({criterion.level})</span>
                    {criterion.parentCode && (
                      <span className="text-gray-500 ml-3 text-sm">Parent: {criterion.parentCode}</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button
                      onClick={() => handleStartEdit(criterion)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCriterion(criterion.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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