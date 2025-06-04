// src/api/DataUploadService.ts
import axiosInstance from "./AxiosInstance";

export const uploadSurveyResults = async (
  file: File,
  surveyId: string,
  facultyId: string,
  departmentId: string,
  courseId: string
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("surveyId", surveyId);
  formData.append("facultyId", facultyId);
  formData.append("departmentId", departmentId);
  formData.append("courseId", courseId);

  const response = await axiosInstance.post(
    "/api/upload/survey-results",
    formData
  );
  return response.data;
};