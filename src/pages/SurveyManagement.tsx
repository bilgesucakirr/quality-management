import React, { useEffect, useState } from "react";
import {
  createSurvey,
  getAllSurveys,
  updateSurvey,
  deleteSurvey,
} from "../api/SurveyService";
import { getYokakCriteriaByLevel } from "../api/YokakCriterionService";
import type {
  CreateSurveyFormRequest,
  SurveyDto,
  UpdateSurveyFormRequest,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  QuestionResponse,
} from "../types/Survey";
import type { YokakCriterionResponse } from "../types/YokakCriterion";
import { useAuthStore } from "../store/AuthStore";

const BG = "#f8f9fb";
const PRIMARY = "#21409a";

const SurveyManagement: React.FC = () => {
  const [surveys, setSurveys] = useState<SurveyDto[]>([]);
  const [allHeaders, setAllHeaders] = useState<YokakCriterionResponse[]>([]);
  const [allMainCriteria, setAllMainCriteria] = useState<YokakCriterionResponse[]>([]);
  const [allSubCriteria, setAllSubCriteria] = useState<YokakCriterionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newSurveyTitle, setNewSurveyTitle] = useState("");
  const [newSurveyDescription, setNewSurveyDescription] = useState("");
  const [newQuestions, setNewQuestions] = useState<CreateQuestionRequest[]>([
    { questionText: "", yokakCriterionId: "" }
  ]);
  const [newQuestionHeaderId, setNewQuestionHeaderId] = useState("");
  const [newQuestionMainId, setNewQuestionMainId] = useState("");

  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editQuestions, setEditQuestions] = useState<UpdateQuestionRequest[]>([]);
  const [editQuestionHeaderId, setEditQuestionHeaderId] = useState("");
  const [editQuestionMainId, setEditQuestionMainId] = useState("");

  const { role } = useAuthStore();

  useEffect(() => {
    if (role === "STAFF") {
      fetchData();
    } else {
      setError("You are not authorized to view this page.");
    }
    // eslint-disable-next-line
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
            setNewQuestions([{ questionText: "", yokakCriterionId: "" }]);
          }
        } else {
          setNewQuestions([{ questionText: "", yokakCriterionId: "" }]);
        }
      } else {
        setNewQuestions([{ questionText: "", yokakCriterionId: "" }]);
      }
    } catch (err) {
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
      { questionText: "", yokakCriterionId: defaultSubId }
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
      setNewQuestions([{ questionText: "", yokakCriterionId: "" }]);
      setNewQuestionHeaderId("");
      setNewQuestionMainId("");
      fetchData();
    } catch (err: any) {
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
            if (mainCriterion.parentId) headerId = mainCriterion.parentId;
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
      { questionText: "", yokakCriterionId: defaultSubId }
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
      setError(err.response?.data || "Failed to update survey.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMainCriteria = (headerId: string) => allMainCriteria.filter(mc => mc.parentId === headerId);
  const getFilteredSubCriteria = (mainId: string) => allSubCriteria.filter(sc => sc.parentId === mainId);

  if (role !== "STAFF") {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: BG }}>
        <div className="text-xl text-gray-700">Access Denied.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-10 px-2" style={{ background: BG }}>
      <div className="w-full max-w-6xl flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-[#21409a] text-center tracking-tight">
          Survey Management
        </h1>

        {/* Add Survey Form */}
        <form
          onSubmit={handleCreateSurvey}
          className="w-full flex flex-col gap-4 mb-8 px-2"
        >
          <div className="bg-white rounded-2xl border border-[#e5eaf8] p-6 shadow flex flex-col gap-4">
            <h2 className="text-xl font-semibold mb-2" style={{ color: PRIMARY }}>
              Create New Survey
            </h2>
            <input
              type="text"
              placeholder="Survey Title"
              value={newSurveyTitle}
              onChange={(e) => setNewSurveyTitle(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
              required
            />
            <textarea
              placeholder="Survey Description"
              value={newSurveyDescription}
              onChange={(e) => setNewSurveyDescription(e.target.value)}
              rows={3}
              className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
              required
            />
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-sm" style={{ color: PRIMARY }}>
                Questions (Likert 5-scale)
              </h3>
              {newQuestions.map((q, index) => (
                <div key={index} className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Question ${index + 1}`}
                    value={q.questionText}
                    onChange={(e) => updateQuestionText(newQuestions, setNewQuestions, index, e.target.value)}
                    className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#21409a] outline-none transition"
                    required
                  />
                  <select
                    value={newQuestionHeaderId}
                    onChange={(e) => {
                      const selectedHeader = e.target.value;
                      setNewQuestionHeaderId(selectedHeader);
                      setNewQuestionMainId("");
                      updateQuestionYokakCriterionId(newQuestions, setNewQuestions, index, "");
                      const filteredMain = getFilteredMainCriteria(selectedHeader);
                      if (filteredMain.length > 0) {
                        setNewQuestionMainId(filteredMain[0].id);
                        const filteredSub = getFilteredSubCriteria(filteredMain[0].id);
                        if (filteredSub.length > 0) {
                          updateQuestionYokakCriterionId(newQuestions, setNewQuestions, index, filteredSub[0].id);
                        }
                      }
                    }}
                    className="p-2 border border-gray-300 rounded-lg bg-white text-xs focus:ring-2 focus:ring-[#21409a] outline-none transition"
                    required
                    disabled={allHeaders.length === 0}
                  >
                    <option value="" disabled>Select Header</option>
                    {allHeaders.map(header => (
                      <option key={header.id} value={header.id}>{header.code} - {header.name}</option>
                    ))}
                  </select>
                  <select
                    value={newQuestionMainId}
                    onChange={(e) => {
                      const selectedMain = e.target.value;
                      setNewQuestionMainId(selectedMain);
                      updateQuestionYokakCriterionId(newQuestions, setNewQuestions, index, "");
                      const filteredSub = getFilteredSubCriteria(selectedMain);
                      if (filteredSub.length > 0) {
                        updateQuestionYokakCriterionId(newQuestions, setNewQuestions, index, filteredSub[0].id);
                      }
                    }}
                    className="p-2 border border-gray-300 rounded-lg bg-white text-xs focus:ring-2 focus:ring-[#21409a] outline-none transition"
                    required
                    disabled={!newQuestionHeaderId || getFilteredMainCriteria(newQuestionHeaderId).length === 0}
                  >
                    <option value="" disabled>Select Main Criterion</option>
                    {getFilteredMainCriteria(newQuestionHeaderId).map(main => (
                      <option key={main.id} value={main.id}>{main.code} - {main.name}</option>
                    ))}
                  </select>
                  <select
                    value={q.yokakCriterionId}
                    onChange={(e) => updateQuestionYokakCriterionId(newQuestions, setNewQuestions, index, e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg bg-white text-xs focus:ring-2 focus:ring-[#21409a] outline-none transition"
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
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg font-semibold text-xs shadow hover:bg-red-600 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddQuestionField}
                className="self-start mt-2 px-4 py-1.5 bg-gray-100 text-[#21409a] rounded-lg font-semibold text-xs hover:bg-gray-200 transition"
              >
                Add another question
              </button>
            </div>
            <button
              type="submit"
              className="self-end mt-2 px-7 py-2 rounded-lg bg-[#21409a] hover:bg-[#18316e] text-white font-bold text-base shadow-md transition-all duration-150"
              style={{ letterSpacing: ".03em" }}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Survey"}
            </button>
            {error && <div className="text-red-600 text-center mt-2 text-sm">{error}</div>}
          </div>
        </form>

        {/* Survey List */}
        <h2 className="text-2xl font-bold mb-4 mt-8 text-[#21409a]">Existing Surveys</h2>
        {loading && <div className="text-center text-[#21409a]">Loading surveys...</div>}
        {!loading && surveys.length === 0 && (
          <div className="text-center text-gray-600">No surveys found.</div>
        )}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="bg-white rounded-2xl border border-[#e5eaf8] p-5 flex flex-col gap-2 shadow"
            >
              {editingSurveyId === survey.id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 border rounded-lg mb-2 text-base font-semibold"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="w-full p-2 border rounded-lg mb-2 text-base"
                  ></textarea>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: PRIMARY }}>Questions:</h3>
                  {editQuestions.map((q, index) => (
                    <div key={q.id || `edit-q-${index}`} className="flex flex-wrap items-center gap-2 mb-1">
                      <input
                        type="text"
                        value={q.questionText}
                        onChange={(e) => updateQuestionText(editQuestions, setEditQuestions, index, e.target.value)}
                        className="flex-1 min-w-[120px] p-2 border rounded-lg text-xs"
                      />
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
                        className="p-2 border rounded-lg bg-white text-xs"
                        required
                        disabled={allHeaders.length === 0}
                      >
                        <option value="" disabled>Select Header</option>
                        {allHeaders.map(header => (
                          <option key={header.id} value={header.id}>{header.code} - {header.name}</option>
                        ))}
                      </select>
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
                        className="p-2 border rounded-lg bg-white text-xs"
                        required
                        disabled={!editQuestionHeaderId || getFilteredMainCriteria(editQuestionHeaderId).length === 0}
                      >
                        <option value="" disabled>Select Main Criterion</option>
                        {getFilteredMainCriteria(editQuestionHeaderId).map(main => (
                          <option key={main.id} value={main.id}>{main.code} - {main.name}</option>
                        ))}
                      </select>
                      <select
                        value={q.yokakCriterionId}
                        onChange={(e) => updateQuestionYokakCriterionId(editQuestions, setEditQuestions, index, e.target.value)}
                        className="p-2 border rounded-lg bg-white text-xs"
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
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg font-semibold text-xs shadow hover:bg-red-600 transition"
                        >
                          -
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddEditQuestionField}
                    className="self-start mt-2 px-4 py-1.5 bg-gray-100 text-[#21409a] rounded-lg font-semibold text-xs hover:bg-gray-200 transition"
                  >
                    Add question
                  </button>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleSaveEdit(survey.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm shadow hover:bg-green-700 transition"
                      disabled={loading}
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg font-bold text-sm shadow hover:bg-gray-600 transition"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold mb-2" style={{ color: PRIMARY }}>
                    {survey.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{survey.description}</p>
                  <h4 className="font-semibold text-xs mb-1" style={{ color: PRIMARY }}>Questions:</h4>
                  <ul className="list-disc list-inside text-xs text-gray-700 mb-2">
                    {survey.questions.map((question) => (
                      <li key={question.id}>
                        {question.questionText}{" "}
                        {question.yokakCriterionCode && (
                          <span className="font-semibold" style={{ color: PRIMARY }}>
                            ({question.yokakCriterionCode})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2 justify-end mt-auto">
                    <button
                      onClick={() => handleStartEdit(survey)}
                      className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg font-semibold text-xs shadow hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSurvey(survey.id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-semibold text-xs shadow hover:bg-red-700 transition"
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
