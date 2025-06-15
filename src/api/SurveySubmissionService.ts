
import axiosInstance from "./AxiosInstance";
import type { SurveySubmissionResponse, UpdateSubmissionRequest, BulkSubmissionUpdateRequest } from "../types/Submission"; // NEW: BulkSubmissionUpdateRequest added


export const getAllSubmissions = async (
  surveyId?: string,
  semester?: string,
  facultyId?: string,
  departmentId?: string,
  courseId?: string
): Promise<SurveySubmissionResponse[]> => {
  const params: { [key: string]: string | undefined } = {};
  if (surveyId) params.surveyId = surveyId;
  if (semester) params.semester = semester;
  if (facultyId) params.facultyId = facultyId;
  if (departmentId) params.departmentId = departmentId;
  if (courseId) params.courseId = courseId;

  const response = await axiosInstance.get("/api/submissions", { params });
  return response.data;
};


export const deleteSubmission = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/submissions/${id}`);
};


export const updateSubmission = async (
  id: string,
  data: UpdateSubmissionRequest
): Promise<SurveySubmissionResponse> => {
  const response = await axiosInstance.put(`/api/submissions/${id}`, data); 
  return response.data;
};


export const bulkUpdateSubmissions = async (
  data: BulkSubmissionUpdateRequest
): Promise<string> => { 
  const response = await axiosInstance.post("/api/submissions/bulk-update", data);
  return response.data;
};