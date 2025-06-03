// src/api/DataUploadService.ts
import axiosInstance from "./AxiosInstance.ts";
import type { UploadResponse } from "../types/DataUpload";
import type { SurveyResponse } from "../types/Survey"; // To get survey list for dropdown

// Function to upload Excel file with survey results
export const uploadSurveyResults = async (file: File, surveyId: string): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("surveyId", surveyId); // Append surveyId as a parameter

  // Axios automatically sets Content-Type to multipart/form-data when FormData is used
  const response = await axiosInstance.post("/api/upload/survey-results", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Explicitly set, though often automatic
    },
  });
  return response.data;
};

// Function to fetch existing surveys (needed for the dropdown in the upload form)
export const getExistingSurveys = async (): Promise<SurveyResponse[]> => {
  const response = await axiosInstance.get("/surveys");
  return response.data;
};

// Optional: functions to get faculties/departments if needed for other filters
// export const getAllFaculties = async (): Promise<FacultyData[]> => {
//   const response = await axiosInstance.get("/faculties");
//   return response.data;
// };

// export const getAllDepartments = async (): Promise<DepartmentData[]> => {
//   const response = await axiosInstance.get("/departments");
//   return response.data;
// };