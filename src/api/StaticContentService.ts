import axiosInstance from "./AxiosInstance";
import type { StaticContent, CreateUpdateStaticContentRequest } from "../types/StaticContent";

export const getAllStaticContents = async (): Promise<StaticContent[]> => {
  const response = await axiosInstance.get("/api/static-content");
  return response.data;
};

export const getStaticContentByKey = async (key: string): Promise<StaticContent> => {
  const response = await axiosInstance.get(`/api/static-content/${key}`);
  return response.data;
};

export const createOrUpdateStaticContent = async (data: CreateUpdateStaticContentRequest): Promise<StaticContent> => {
  const response = await axiosInstance.post("/api/static-content", data);
  return response.data;
};

export const deleteStaticContent = async (key: string): Promise<void> => {
  await axiosInstance.delete(`/api/static-content/${key}`);
};