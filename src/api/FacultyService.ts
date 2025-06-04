// src/api/FacultyService.ts
import axiosInstance from "./AxiosInstance.ts";
import type { Faculty } from "../types/Faculty"; // Düzeltildi

// This DTO type is used for create and update requests
type FacultyRequest = Omit<Faculty, "id">;

export const createFaculty = async (
  data: FacultyRequest
): Promise<Faculty> => {
  const response = await axiosInstance.post("/faculties", data);
  return response.data;
};

export const getAllFaculties = async (): Promise<Faculty[]> => {
  const response = await axiosInstance.get("/faculties");
  return response.data;
};

export const getFacultyById = async (id: string): Promise<Faculty> => {
  const response = await axiosInstance.get(`/faculties/${id}`);
  return response.data;
};

export const updateFaculty = async (
  id: string,
  data: Partial<FacultyRequest>
): Promise<Faculty> => {
  const response = await axiosInstance.put(`/faculties/${id}`, data);
  return response.data;
};

export const deleteFaculty = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/faculties/${id}`);
};