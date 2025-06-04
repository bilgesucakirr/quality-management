// src/api/SurveyService.ts
import axiosInstance from "./AxiosInstance.ts";
import type {
  CreateSurveyFormRequest, // Frontend'den gönderilen istek DTO'su
  SurveyDto, // Backend'den dönen yanıt DTO'su
  UpdateSurveyFormRequest, // Frontend'den gönderilen güncelleme isteği DTO'su
} from "../types/Survey";

export const createSurvey = async (
  data: CreateSurveyFormRequest
): Promise<SurveyDto> => {
  const response = await axiosInstance.post("/surveys", data);
  return response.data;
};

export const getAllSurveys = async (): Promise<SurveyDto[]> => {
  const response = await axiosInstance.get("/surveys");
  return response.data;
};

export const getSurveyById = async (id: string): Promise<SurveyDto> => {
  const response = await axiosInstance.get(`/surveys/${id}`);
  return response.data;
};

export const updateSurvey = async (
  id: string,
  data: UpdateSurveyFormRequest
): Promise<SurveyDto> => {
  const response = await axiosInstance.put(`/surveys/${id}`, data);
  return response.data;
};

export const deleteSurvey = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/surveys/${id}`);
};