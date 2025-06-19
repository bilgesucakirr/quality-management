import axiosInstance from "./AxiosInstance";
import type { FAQ, CreateUpdateFAQRequest } from "../types/FAQ";

export const getAllFAQs = async (): Promise<FAQ[]> => {
  const response = await axiosInstance.get("/api/faqs");
  return response.data;
};

export const getFAQById = async (id: string): Promise<FAQ> => {
  const response = await axiosInstance.get(`/api/faqs/${id}`);
  return response.data;
};

export const createFAQ = async (data: CreateUpdateFAQRequest): Promise<FAQ> => {
  const response = await axiosInstance.post("/api/faqs", data);
  return response.data;
};

export const updateFAQ = async (id: string, data: Partial<CreateUpdateFAQRequest>): Promise<FAQ> => {
  const response = await axiosInstance.put(`/api/faqs/${id}`, data);
  return response.data;
};

export const deleteFAQ = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/faqs/${id}`);
};