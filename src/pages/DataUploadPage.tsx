// src/pages/DataUploadPage.tsx
import React, { useState, useEffect } from "react";
import { uploadSurveyResults, getExistingSurveys } from "../api/DataUploadService";
import type { SurveyResponse } from "../types/Survey"; // Import SurveyResponse type

const BLUE = "#05058c";

const DataUploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [surveys, setSurveys] = useState<SurveyResponse[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch available surveys when the component mounts
    const fetchSurveys = async () => {
      try {
        const fetchedSurveys = await getExistingSurveys();
        setSurveys(fetchedSurveys);
        if (fetchedSurveys.length > 0) {
          setSelectedSurveyId(fetchedSurveys[0].id); // Select the first survey by default
        }
      } catch (err) {
        console.error("Failed to fetch surveys:", err);
        setError("Failed to load surveys. Please create at least one survey first.");
      }
    };
    fetchSurveys();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadMessage(null); // Clear previous message
      setError(null); // Clear previous error
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    setUploadMessage(null);
    setError(null);

    if (!selectedFile) {
      setError("Please select an Excel file to upload.");
      return;
    }

    if (!selectedSurveyId) {
      setError("Please select a survey to associate with the results.");
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadSurveyResults(selectedFile, selectedSurveyId);
      setUploadMessage(response.message);
      setSelectedFile(null); // Clear selected file after successful upload
      // Optionally reset the file input field
      const fileInput = document.getElementById("excel-file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

    } catch (err: any) {
      console.error("Upload failed:", err.response?.data || err.message);
      setError("Upload failed: " + (err.response?.data || err.message || "Unknown error."));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-200 py-8">
      <div
        className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg border"
        style={{ borderColor: BLUE }}
      >
        <h1
          className="text-2xl font-extrabold mb-8 text-center tracking-tight drop-shadow"
          style={{ color: BLUE }}
        >
          Upload Survey Results
        </h1>

        <form onSubmit={handleUpload} className="flex flex-col gap-5">
          {/* Survey Selection Dropdown */}
          <div>
            <label htmlFor="survey-select" className="block text-gray-700 text-sm font-bold mb-2">
              Select Survey:
            </label>
            <select
              id="survey-select"
              value={selectedSurveyId}
              onChange={(e) => setSelectedSurveyId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
              disabled={surveys.length === 0 || isUploading}
            >
              {surveys.length === 0 ? (
                <option value="">No surveys available</option>
              ) : (
                surveys.map((survey) => (
                  <option key={survey.id} value={survey.id}>
                    {survey.title}
                  </option>
                ))
              )}
            </select>
            {surveys.length === 0 && <p className="text-red-500 text-xs mt-1">Please create a survey in Survey Management first.</p>}
          </div>

          {/* File Input */}
          <div>
            <label htmlFor="excel-file-input" className="block text-gray-700 text-sm font-bold mb-2">
              Upload Excel File:
            </label>
            <input
              type="file"
              id="excel-file-input"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-xl text-base file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0 file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={isUploading}
            />
          </div>

          {/* Upload Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-bold text-base mt-4 shadow"
            style={{ backgroundColor: BLUE, transition: "background 0.2s" }}
            disabled={isUploading || !selectedFile || !selectedSurveyId}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {/* Messages */}
        {uploadMessage && (
          <p className="mt-4 text-center text-green-600 font-semibold">{uploadMessage}</p>
        )}
        {error && (
          <p className="mt-4 text-center text-red-600 font-semibold">{error}</p>
        )}
      </div>
    </div>
  );
};

export default DataUploadPage;