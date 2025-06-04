import axiosInstance from "./AxiosInstance";
import type { YokakCriterion, YokakCriterionResponse } from "../types/YokakCriterion";

// Create, Update, Delete fonksiyonları değişmedi, ancak tutarlılık için tekrar veriyorum
export const createYokakCriterion = async (
  data: Omit<YokakCriterion, "id"> & { level: "HEADER" | "MAIN_CRITERION" | "SUB_CRITERION"; parentId?: string | null }
): Promise<YokakCriterionResponse> => {
  const response = await axiosInstance.post("/yokak-criteria", data);
  return response.data;
};

// UPDATED: Now takes level, parentId, and searchTerm as parameters
export const getAllYokakCriteria = async (
    level?: "" | "HEADER" | "MAIN_CRITERION" | "SUB_CRITERION",
    parentId?: string,
    searchTerm?: string
): Promise<YokakCriterionResponse[]> => {
    const params: { level?: string; parentId?: string; searchTerm?: string } = {};
    if (level) params.level = level;
    if (parentId) params.parentId = parentId;
    if (searchTerm) params.searchTerm = searchTerm;

    const response = await axiosInstance.get("/yokak-criteria", { params });
    return response.data;
};

// UPDATED: Changed endpoint path to /yokak-criteria/by-level
// This is now used specifically for populating parent dropdowns.
export const getYokakCriteriaByLevel = async (level: "HEADER" | "MAIN_CRITERION" | "SUB_CRITERION"): Promise<YokakCriterionResponse[]> => {
  const response = await axiosInstance.get("/yokak-criteria/by-level", { params: { level } });
  return response.data;
};

// getChildrenOfCriterion'ın backend'deki karşılığı artık getAllYokakCriteria içinde,
// bu fonksiyonu doğrudan kullanmayacağız ama frontend'de tutabiliriz.
// Eğer spesifik parentId'ye göre arama yapılıyorsa getAllYokakCriteria kullanılmalı.
// Frontend'de bu fonksiyonu `getAllYokakCriteria("", parentId)` şeklinde çağırabiliriz.

export const updateYokakCriterion = async (
  id: string,
  data: Partial<Omit<YokakCriterion, "id">> & { level?: "HEADER" | "MAIN_CRITERION" | "SUB_CRITERION"; parentId?: string | null }
): Promise<YokakCriterionResponse> => {
  const response = await axiosInstance.put(`/yokak-criteria/${id}`, data);
  return response.data;
};

export const deleteYokakCriterion = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/yokak-criteria/${id}`);
};