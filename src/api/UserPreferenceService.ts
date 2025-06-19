import axiosInstance from "./AxiosInstance";
import type { UserPreference, CreateUpdateUserPreferenceRequest } from "../types/UserPreference";

export const getUserPreferences = async (userId: string): Promise<UserPreference[]> => {
  const response = await axiosInstance.get(`/api/user-preferences/user/${userId}`);
  return response.data;
};

export const getUserPreferenceByKey = async (userId: string, key: string): Promise<UserPreference> => {
  const response = await axiosInstance.get(`/api/user-preferences/user/${userId}/key/${key}`);
  return response.data;
};

export const createOrUpdateUserPreference = async (data: CreateUpdateUserPreferenceRequest): Promise<UserPreference> => {
  const response = await axiosInstance.post("/api/user-preferences", data);
  return response.data;
};

export const deleteUserPreference = async (userId: string, key: string): Promise<void> => {
  await axiosInstance.delete(`/api/user-preferences/user/${userId}/key/${key}`);
};