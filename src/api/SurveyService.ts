import axiosInstance from "./AxiosInstance.ts";
import type {
  CreateSurveyRequest,
  SurveyResponse,
  UpdateSurveyRequest,
} from "../types/Survey";

export const createSurvey = async (
  data: CreateSurveyRequest
): Promise<SurveyResponse> => {
  const response = await axiosInstance.post("/surveys", data);
  return response.data;
};

export const getAllSurveys = async (): Promise<SurveyResponse[]> => {
  const response = await axiosInstance.get("/surveys");
  return response.data;
};

export const getSurveyById = async (id: string): Promise<SurveyResponse> => {
  const response = await axiosInstance.get(`/surveys/${id}`);
  return response.data;
};

export const updateSurvey = async (
  id: string,
  data: UpdateSurveyRequest
): Promise<SurveyResponse> => {
  const response = await axiosInstance.put(`/surveys/${id}`, data);
  return response.data;
};

export const deleteSurvey = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/surveys/${id}`);
};