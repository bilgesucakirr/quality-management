import React, { useEffect, useState, useCallback } from "react";
import {
  createSurvey,
  getAllSurveys,
  updateSurvey,
  deleteSurvey,
} from "../api/SurveyService";
import {
  getYokakCriteriaByLevel,
} from "../api/YokakCriterionService";
import type {
  CreateSurveyFormRequest,
  SurveyDto,
  UpdateSurveyFormRequest,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  QuestionResponse,
} from "../types/Survey";
import type { YokakCriterionResponse } from "../types/YokakCriterion";
import { useAuthStore } from "../store/AuthStore"; // Rol kontrolü için

const BLUE = "#05058c";

const SurveyManagement: React.FC = () => {
  const [surveys, setSurveys] = useState<SurveyDto[]>([]);
  const [allHeaders, setAllHeaders] = useState<YokakCriterionResponse[]>([]);
  const [allMainCriteria, setAllMainCriteria] = useState<YokakCriterionResponse[]>([]);
  const [allSubCriteria, setAllSubCriteria] = useState<YokakCriterionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form for New Survey
  const [newSurveyTitle, setNewSurveyTitle] = useState("");
  const [newSurveyDescription, setNewSurveyDescription] = useState("");
  const [newQuestions, setNewQuestions] = useState<CreateQuestionRequest[]>([
    { questionText: "", yokakCriterionId: "" }
  ]);
  const [newQuestionHeaderId, setNewQuestionHeaderId] = useState("");
  const [newQuestionMainId, setNewQuestionMainId] = useState("");

  // Form for Editing Survey
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editQuestions, setEditQuestions] = useState<UpdateQuestionRequest[]>([]);
  const [editQuestionHeaderId, setEditQuestionHeaderId] = useState("");
  const [editQuestionMainId, setEditQuestionMainId] = useState("");

  const { role } = useAuthStore(); // Rolü buradan al

  useEffect(() => {
    // Sayfa erişim kontrolü: Sadece STAFF için izin ver
    if (role === "STAFF") { // Değişiklik burada!
      fetchData();
    } else {
      setError("You are not authorized to view this page.");
    }
  }, [role]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [surveyData, headerData, mainData, subData] = await Promise.all([
        getAllSurveys(),
        getYokakCriteriaByLevel("HEADER"),
        getYokakCriteriaByLevel("MAIN_CRITERION"),
        getYokakCriteriaByLevel("SUB_CRITERION"),
      ]);
      setSurveys(surveyData);
      setAllHeaders(headerData);
      setAllMainCriteria(mainData);
      setAllSubCriteria(subData);

      // Set default selected yokak criterion for new question if any exist
      // This logic will set the default for the *first* question in the newQuestions array
      if (headerData.length > 0) {
        setNewQuestionHeaderId(headerData[0].id);
        const filteredMain = mainData.filter(m => m.parentId === headerData[0].id);
        if (filteredMain.length > 0) {
          setNewQuestionMainId(filteredMain[0].id);
          const filteredSub = subData.filter(s => s.parentId === filteredMain[0].id);
          if (filteredSub.length > 0) {
            setNewQuestions([
              { questionText: "", yokakCriterionId: filteredSub[0].id }
            ]);
          } else {
            setNewQuestions([ { questionText: "", yokakCriterionId: "" } ]);
          }
        } else {
          setNewQuestions([ { questionText: "", yokakCriterionId: "" } ]);
        }
      } else {
        setNewQuestions([ { questionText: "", yokakCriterionId: "" } ]);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to fetch surveys or YÖKAK criteria.");
    } finally {
      setLoading(false);
    }
  };

  const updateQuestionText = (
    list: CreateQuestionRequest[] | UpdateQuestionRequest[],
    setter: React.Dispatch<React.SetStateAction<any>>,
    index: number,
    value: string
  ) => {
    const updatedList = [...list];
    updatedList[index].questionText = value;
    setter(updatedList);
  };

  const updateQuestionYokakCriterionId = (
    list: CreateQuestionRequest[] | UpdateQuestionRequest[],
    setter: React.Dispatch<React.SetStateAction<any>>,
    index: number,
    value: string
  ) => {
    const updatedList = [...list];
    updatedList[index].yokakCriterionId = value;
    setter(updatedList);
  };


  const handleAddQuestionField = () => {
    let defaultHeaderId = allHeaders.length > 0 ? allHeaders[0].id : "";
    let defaultMainId = "";
    let defaultSubId = "";

    if (defaultHeaderId) {
      const filteredMain = allMainCriteria.filter(m => m.parentId === defaultHeaderId);
      if (filteredMain.length > 0) {
        defaultMainId = filteredMain[0].id;
        const filteredSub = allSubCriteria.filter(s => s.parentId === defaultMainId);
        if (filteredSub.length > 0) {
          defaultSubId = filteredSub[0].id;
        }
      }
    }

    setNewQuestions([
      ...newQuestions,
      {
        questionText: "",
        yokakCriterionId: defaultSubId,
      },
    ]);
    setNewQuestionHeaderId(defaultHeaderId);
    setNewQuestionMainId(defaultMainId);
  };

  const handleRemoveQuestionField = (index: number) => {
    const updatedQuestions = newQuestions.filter((_, i) => i !== index);
    setNewQuestions(updatedQuestions);
  };

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validQuestions = newQuestions.filter(
      (q) => q.questionText.trim() !== "" && q.yokakCriterionId.trim() !== ""
    );
    if (validQuestions.length === 0) {
      setError("Please add at least one question with text and a YÖKAK criterion.");
      setLoading(false);
      return;
    }

    try {
      const request: CreateSurveyFormRequest = {
        title: newSurveyTitle,
        description: newSurveyDescription,
        questions: validQuestions,
      };
      await createSurvey(request);
      alert("Survey created successfully!");
      setNewSurveyTitle("");
      setNewSurveyDescription("");
      setNewQuestions([ { questionText: "", yokakCriterionId: "" } ]);
      setNewQuestionHeaderId("");
      setNewQuestionMainId("");
      fetchData();
    } catch (err: any) {
      console.error("Failed to create survey:", err);
      setError(err.response?.data || "Failed to create survey.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSurvey = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this survey?")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteSurvey(id);
      alert("Survey deleted successfully!");
      fetchData();
    } catch (err: any) {
      console.error("Failed to delete survey:", err);
      setError(err.response?.data || "Failed to delete survey. It might have associated data.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (survey: SurveyDto) => {
    setEditingSurveyId(survey.id);
    setEditTitle(survey.title);
    setEditDescription(survey.description);
    
    const mappedQuestions = survey.questions.map((q: QuestionResponse) => {
      let headerId = "";
      let mainId = "";

      if (q.yokakCriterionId) {
        const subCriterion = allSubCriteria.find(s => s.id === q.yokakCriterionId);
        if (subCriterion && subCriterion.parentId) {
          const mainCriterion = allMainCriteria.find(m => m.id === subCriterion.parentId);
          if (mainCriterion) {
            mainId = mainCriterion.id;
            if (mainCriterion.parentId) {
              headerId = mainCriterion.parentId;
            }
          }
        }
      }
      setEditQuestionHeaderId(headerId); 
      setEditQuestionMainId(mainId);

      return {
        id: q.id,
        questionText: q.questionText,
        yokakCriterionId: q.yokakCriterionId || "",
      };
    });
    setEditQuestions(mappedQuestions);
  };

  const handleCancelEdit = () => {
    setEditingSurveyId(null);
    setEditTitle("");
    setEditDescription("");
    setEditQuestions([]);
    setEditQuestionHeaderId("");
    setEditQuestionMainId("");
  };

  const handleAddEditQuestionField = () => {
    let defaultHeaderId = allHeaders.length > 0 ? allHeaders[0].id : "";
    let defaultMainId = "";
    let defaultSubId = "";

    if (defaultHeaderId) {
      const filteredMain = allMainCriteria.filter(m => m.parentId === defaultHeaderId);
      if (filteredMain.length > 0) {
        defaultMainId = filteredMain[0].id;
        const filteredSub = allSubCriteria.filter(s => s.parentId === defaultMainId);
        if (filteredSub.length > 0) {
          defaultSubId = filteredSub[0].id;
        }
      }
    }
    
    setEditQuestions([
      ...editQuestions,
      {
        questionText: "",
        yokakCriterionId: defaultSubId,
      },
    ]);
    setEditQuestionHeaderId(defaultHeaderId);
    setEditQuestionMainId(defaultMainId);
  };

  const handleRemoveEditQuestionField = (index: number) => {
    const updatedQuestions = editQuestions.filter((_, i) => i !== index);
    setEditQuestions(updatedQuestions);
  };

  const handleSaveEdit = async (id: string) => {
    setLoading(true);
    setError(null);
    const validQuestions = editQuestions.filter(
      (q) => q.questionText.trim() !== "" && q.yokakCriterionId.trim() !== ""
    );
    if (validQuestions.length === 0) {
      setError("Please add at least one question with text and a YÖKAK criterion.");
      setLoading(false);
      return;
    }

    try {
      const request: UpdateSurveyFormRequest = {
        title: editTitle,
        description: editDescription,
        questions: validQuestions,
      };
      await updateSurvey(id, request);
      alert("Survey updated successfully!");
      handleCancelEdit();
      fetchData();
    } catch (err: any) {
      console.error("Failed to update survey:", err);
      setError(err.response?.data || "Failed to update survey.");
    } finally {
      setLoading(false);
    }
  };

  // Filter options for chained dropdowns
  const getFilteredMainCriteria = (headerId: string) => {
    return allMainCriteria.filter(mc => mc.parentId === headerId);
  };

  const getFilteredSubCriteria = (mainId: string) => {
    return allSubCriteria.filter(sc => sc.parentId === mainId);
  };

  // Rol kontrolü: Sadece STAFF rolü için izin ver
  if (role !== "STAFF") {
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
          Survey Management
        </h1>

        {/* Add Survey Form */}
        <form
          onSubmit={handleCreateSurvey}
          className="flex flex-col gap-4 mb-10 p-6 border rounded-2xl"
          style={{ borderColor: BLUE }}
        >
          <h2 className="text-xl font-bold mb-3" style={{ color: BLUE }}>
            Create New Survey
          </h2>
          <input
            type="text"
            placeholder="Survey Title"
            value={newSurveyTitle}
            onChange={(e) => setNewSurveyTitle(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
            required
          />
          <textarea
            placeholder="Survey Description"
            value={newSurveyDescription}
            onChange={(e) => setNewSurveyDescription(e.target.value)}
            rows={3}
            className="p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
            required
          ></textarea>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold" style={{ color: BLUE }}>
              Questions (Likert 5-scale)
            </h3>
            {newQuestions.map((q, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder={`Question ${index + 1}`}
                  value={q.questionText}
                  onChange={(e) => updateQuestionText(newQuestions, setNewQuestions, index, e.target.value)}
                  className="flex-1 min-w-[150px] p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
                  required
                />
                {/* Header Dropdown for NEW question */}
                <select
                  value={newQuestionHeaderId}
                  onChange={(e) => {
                    const selectedHeader = e.target.value;
                    setNewQuestionHeaderId(selectedHeader);
                    setNewQuestionMainId(""); // Reset Main
                    updateQuestionYokakCriterionId(newQuestions, setNewQuestions, index, ""); // Reset Sub

                    const filteredMain = getFilteredMainCriteria(selectedHeader);
                    if (filteredMain.length > 0) {
                      setNewQuestionMainId(filteredMain[0].id); // Auto-select first Main
                      const filteredSub = getFilteredSubCriteria(filteredMain[0].id);
                      if (filteredSub.length > 0) {
                        updateQuestionYokakCriterionId(newQuestions, setNewQuestions, index, filteredSub[0].id); // Auto-select first Sub
                      }
                    }
                  }}
                  className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#05058c] outline-none transition"
                  required
                  disabled={allHeaders.length === 0}
                >
                  <option value="" disabled>Select Header</option>
                  {allHeaders.map(header => (
                    <option key={header.id} value={header.id}>{header.code} - {header.name}</option>
                  ))}
                </select>

                {/* Main Criterion Dropdown for NEW question */}
                <select
                  value={newQuestionMainId}
                  onChange={(e) => {
                    const selectedMain = e.target.value;
                    setNewQuestionMainId(selectedMain);
                    updateQuestionYokakCriterionId(newQuestions, setNewQuestions, index, ""); // Reset Sub

                    const filteredSub = getFilteredSubCriteria(selectedMain);
                    if (filteredSub.length > 0) {
                      updateQuestionYokakCriterionId(newQuestions, setNewQuestions, index, filteredSub[0].id); // Auto-select first Sub
                    }
                  }}
                  className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#05058c] outline-none transition"
                  required
                  disabled={!newQuestionHeaderId || getFilteredMainCriteria(newQuestionHeaderId).length === 0}
                >
                  <option value="" disabled>Select Main Criterion</option>
                  {getFilteredMainCriteria(newQuestionHeaderId).map(main => (
                    <option key={main.id} value={main.id}>{main.code} - {main.name}</option>
                  ))}
                </select>

                {/* Sub Criterion Dropdown for NEW question (Final selection) */}
                <select
                  value={q.yokakCriterionId}
                  onChange={(e) => updateQuestionYokakCriterionId(newQuestions, setNewQuestions, index, e.target.value)}
                  className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#05058c] outline-none transition"
                  required
                  disabled={!newQuestionMainId || getFilteredSubCriteria(newQuestionMainId).length === 0}
                >
                  <option value="" disabled>Select Sub Criterion</option>
                  {getFilteredSubCriteria(newQuestionMainId).map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                  ))}
                </select>
                {newQuestions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestionField(index)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddQuestionField}
              className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Add another question
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-bold text-base mt-4 shadow"
            style={{ backgroundColor: BLUE, transition: "background 0.2s" }}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Survey"}
          </button>
        </form>

        {/* Survey List */}
        <h2 className="text-2xl font-extrabold mb-6" style={{ color: BLUE }}>
          Existing Surveys
        </h2>
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        {loading && <div className="text-center" style={{ color: BLUE }}>Loading surveys...</div>}
        {!loading && surveys.length === 0 && (
          <div className="text-center text-gray-600">No surveys found.</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="bg-white rounded-xl shadow-md p-6 border flex flex-col justify-between"
              style={{ borderColor: BLUE }}
            >
              {editingSurveyId === survey.id ? (
                // Edit Form
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 border rounded-lg mb-2 text-lg font-bold"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="w-full p-2 border rounded-lg mb-4 text-gray-600"
                  ></textarea>
                  <h3 className="font-semibold mb-2" style={{ color: BLUE }}>
                    Questions:
                  </h3>
                  {editQuestions.map((q, index) => (
                    <div
                      key={q.id || `new-${index}`}
                      className="flex flex-wrap items-center gap-2 mb-2"
                    >
                      <input
                        type="text"
                        value={q.questionText}
                        onChange={(e) => updateQuestionText(editQuestions, setEditQuestions, index, e.target.value)}
                        className="flex-1 min-w-[120px] p-2 border rounded-lg text-sm"
                      />
                      {/* Header Dropdown (Edit Mode) */}
                      <select
                        value={editQuestionHeaderId}
                        onChange={(e) => {
                          const selectedHeader = e.target.value;
                          setEditQuestionHeaderId(selectedHeader);
                          setEditQuestionMainId("");
                          updateQuestionYokakCriterionId(editQuestions, setEditQuestions, index, "");
                          const filteredMain = getFilteredMainCriteria(selectedHeader);
                          if (filteredMain.length > 0) {
                            setEditQuestionMainId(filteredMain[0].id);
                            const filteredSub = getFilteredSubCriteria(filteredMain[0].id);
                            if (filteredSub.length > 0) {
                              updateQuestionYokakCriterionId(editQuestions, setEditQuestions, index, filteredSub[0].id);
                            }
                          }
                        }}
                        className="p-2 border rounded-lg bg-white text-sm"
                        required
                        disabled={allHeaders.length === 0}
                      >
                        <option value="" disabled>Select Header</option>
                        {allHeaders.map(header => (
                          <option key={header.id} value={header.id}>{header.code} - {header.name}</option>
                        ))}
                      </select>

                      {/* Main Criterion Dropdown (Edit Mode) */}
                      <select
                        value={editQuestionMainId}
                        onChange={(e) => {
                          const selectedMain = e.target.value;
                          setEditQuestionMainId(selectedMain);
                          updateQuestionYokakCriterionId(editQuestions, setEditQuestions, index, "");
                          const filteredSub = getFilteredSubCriteria(selectedMain);
                          if (filteredSub.length > 0) {
                            updateQuestionYokakCriterionId(editQuestions, setEditQuestions, index, filteredSub[0].id);
                          }
                        }}
                        className="p-2 border rounded-lg bg-white text-sm"
                        required
                        disabled={!editQuestionHeaderId || getFilteredMainCriteria(editQuestionHeaderId).length === 0}
                      >
                        <option value="" disabled>Select Main Criterion</option>
                        {getFilteredMainCriteria(editQuestionHeaderId).map(main => (
                          <option key={main.id} value={main.id}>{main.code} - {main.name}</option>
                        ))}
                      </select>

                      {/* Sub Criterion Dropdown (Edit Mode - Final selection) */}
                      <select
                        value={q.yokakCriterionId}
                        onChange={(e) => updateQuestionYokakCriterionId(editQuestions, setEditQuestions, index, e.target.value)}
                        className="p-2 border rounded-lg bg-white text-sm"
                        required
                        disabled={!editQuestionMainId || getFilteredSubCriteria(editQuestionMainId).length === 0}
                      >
                        <option value="" disabled>Select Sub Criterion</option>
                        {getFilteredSubCriteria(editQuestionMainId).map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                        ))}
                      </select>
                      {editQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEditQuestionField(index)}
                          className="p-1 bg-red-400 text-white rounded-md hover:bg-red-500 transition text-sm"
                        >
                          -
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddEditQuestionField}
                    className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Add question
                  </button>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleSaveEdit(survey.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      disabled={loading}
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                // Display Mode
                <>
                  <h3 className="text-xl font-bold mb-2" style={{ color: BLUE }}>
                    {survey.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {survey.description}
                  </p>
                  <h4 className="font-semibold text-sm mb-2" style={{ color: BLUE }}>
                    Questions:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 mb-4">
                    {survey.questions.map((question) => (
                      <li key={question.id}>
                        {question.questionText}{" "}
                        {question.yokakCriterionCode && (
                          <span className="font-semibold" style={{ color: BLUE }}>
                            ({question.yokakCriterionCode})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2 justify-end mt-auto">
                    <button
                      onClick={() => handleStartEdit(survey)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSurvey(survey.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SurveyManagement;