// src/api/DepartmentService.ts
import axiosInstance from "./AxiosInstance.ts";
import type { Department } from "../types/Department"; // Düzeltildi
// import type { Faculty } from "../types/Faculty"; // This import is not directly used in the current file, so removed.

// This DTO type is used for create and update requests
type DepartmentRequest = Omit<Department, "id" | "facultyName">;

export const createDepartment = async (
  data: DepartmentRequest
): Promise<Department> => {
  const response = await axiosInstance.post("/departments", data);
  return response.data;
};

// getAllDepartments fonksiyonu isteğe bağlı olarak facultyId alabilir
export const getAllDepartments = async (facultyId?: string): Promise<Department[]> => {
  const params = facultyId ? { facultyId } : {};
  const response = await axiosInstance.get("/departments", { params });
  return response.data;
};

export const getDepartmentById = async (id: string): Promise<Department> => {
  const response = await axiosInstance.get(`/departments/${id}`);
  return response.data;
};

export const updateDepartment = async (
  id: string,
  data: Partial<DepartmentRequest>
): Promise<Department> => {
  const response = await axiosInstance.put(`/departments/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/departments/${id}`);
};