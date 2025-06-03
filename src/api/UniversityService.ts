// src/api/UniversityService.ts
import axiosInstance from "./AxiosInstance.ts";
import type { Faculty, Department, CreateUpdateFacultyRequest, CreateUpdateDepartmentRequest } from "../types/University";

// --- Faculty API calls ---

export const getAllFaculties = async (): Promise<Faculty[]> => {
  const response = await axiosInstance.get("/faculties");
  return response.data;
};

export const createFaculty = async (data: CreateUpdateFacultyRequest): Promise<Faculty> => {
  const response = await axiosInstance.post("/faculties", data);
  return response.data;
};

export const updateFaculty = async (id: string, data: CreateUpdateFacultyRequest): Promise<Faculty> => {
  const response = await axiosInstance.put(`/faculties/${id}`, data);
  return response.data;
};

export const deleteFaculty = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/faculties/${id}`);
};

// --- Department API calls ---

export const getAllDepartments = async (): Promise<Department[]> => {
  const response = await axiosInstance.get("/departments");
  return response.data;
};

export const createDepartment = async (data: CreateUpdateDepartmentRequest): Promise<Department> => {
  const response = await axiosInstance.post("/departments", data);
  return response.data;
};

export const updateDepartment = async (id: string, data: CreateUpdateDepartmentRequest): Promise<Department> => {
  const response = await axiosInstance.put(`/departments/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/departments/${id}`);
};