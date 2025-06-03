import React, { useEffect, useState } from "react";
import {
  createSurvey,
  getAllSurveys,
  updateSurvey,
  deleteSurvey,
} from "../api/SurveyService";
import type {
  CreateSurveyRequest,
  SurveyResponse,
  UpdateSurveyRequest,
} from "../types/Survey";

const BLUE = "#05058c";

const SurveyManagement: React.FC = () => {
  const [surveys, setSurveys] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form için state'ler
  const [newSurveyTitle, setNewSurveyTitle] = useState("");
  const [newSurveyDescription, setNewSurveyDescription] = useState("");
  const [newQuestionTexts, setNewQuestionTexts] = useState<string[]>([""]); // Varsayılan olarak bir boş soru

  // Düzenleme için state'ler
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editQuestionTexts, setEditQuestionTexts] = useState<string[]>([]);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllSurveys();
      setSurveys(data);
    } catch (err) {
      console.error("Failed to fetch surveys:", err);
      setError("Failed to fetch surveys.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestionField = () => {
    setNewQuestionTexts([...newQuestionTexts, ""]);
  };

  const handleRemoveQuestionField = (index: number) => {
    const updatedQuestions = newQuestionTexts.filter((_, i) => i !== index);
    setNewQuestionTexts(updatedQuestions);
  };

  const handleNewQuestionTextChange = (index: number, value: string) => {
    const updatedQuestions = [...newQuestionTexts];
    updatedQuestions[index] = value;
    setNewQuestionTexts(updatedQuestions);
  };

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const request: CreateSurveyRequest = {
        title: newSurveyTitle,
        description: newSurveyDescription,
        questionTexts: newQuestionTexts.filter((text) => text.trim() !== ""),
      };
      await createSurvey(request);
      alert("Survey created successfully!");
      setNewSurveyTitle("");
      setNewSurveyDescription("");
      setNewQuestionTexts([""]); // Formu sıfırla
      fetchSurveys(); // Anketleri yeniden yükle
    } catch (err) {
      console.error("Failed to create survey:", err);
      setError("Failed to create survey.");
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
      fetchSurveys();
    } catch (err) {
      console.error("Failed to delete survey:", err);
      setError("Failed to delete survey.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (survey: SurveyResponse) => {
    setEditingSurveyId(survey.id);
    setEditTitle(survey.title);
    setEditDescription(survey.description);
    setEditQuestionTexts(survey.questions.map((q) => q.questionText));
  };

  const handleCancelEdit = () => {
    setEditingSurveyId(null);
    setEditTitle("");
    setEditDescription("");
    setEditQuestionTexts([]);
  };

  const handleEditQuestionTextChange = (index: number, value: string) => {
    const updatedQuestions = [...editQuestionTexts];
    updatedQuestions[index] = value;
    setEditQuestionTexts(updatedQuestions);
  };

  const handleAddEditQuestionField = () => {
    setEditQuestionTexts([...editQuestionTexts, ""]);
  };

  const handleRemoveEditQuestionField = (index: number) => {
    const updatedQuestions = editQuestionTexts.filter((_, i) => i !== index);
    setEditQuestionTexts(updatedQuestions);
  };

  const handleSaveEdit = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const request: UpdateSurveyRequest = {
        title: editTitle,
        description: editDescription,
        questionTexts: editQuestionTexts.filter((text) => text.trim() !== ""),
      };
      await updateSurvey(id, request);
      alert("Survey updated successfully!");
      handleCancelEdit(); // Düzenlemeyi bitir
      fetchSurveys(); // Anketleri yeniden yükle
    } catch (err) {
      console.error("Failed to update survey:", err);
      setError("Failed to update survey.");
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
          Survey Management
        </h1>

        {/* Add Survey Form */}
        <form onSubmit={handleCreateSurvey} className="flex flex-col gap-4 mb-10 p-6 border rounded-2xl" style={{ borderColor: BLUE }}>
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
            <h3 className="font-semibold" style={{ color: BLUE }}>Questions (Likert 5-scale)</h3>
            {newQuestionTexts.map((qText, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Question ${index + 1}`}
                  value={qText}
                  onChange={(e) => handleNewQuestionTextChange(index, e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
                  required
                />
                {newQuestionTexts.length > 1 && (
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
              className="bg-white rounded-xl shadow-md p-6 border"
              style={{ borderColor: BLUE }}
            >
              {editingSurveyId === survey.id ? (
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
                  <h3 className="font-semibold mb-2" style={{ color: BLUE }}>Questions:</h3>
                  {editQuestionTexts.map((qText, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={qText}
                        onChange={(e) => handleEditQuestionTextChange(index, e.target.value)}
                        className="flex-1 p-2 border rounded-lg text-sm"
                      />
                      {editQuestionTexts.length > 1 && (
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
                    className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                  >
                    Add question
                  </button>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleSaveEdit(survey.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-2" style={{ color: BLUE }}>
                    {survey.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {survey.description}
                  </p>
                  <h4 className="font-semibold text-sm mb-2" style={{ color: BLUE }}>Questions:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 mb-4">
                    {survey.questions.map((question) => (
                      <li key={question.id}>{question.questionText}</li>
                    ))}
                  </ul>
                  <div className="flex gap-2 justify-end">
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