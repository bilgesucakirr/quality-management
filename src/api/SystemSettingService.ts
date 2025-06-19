import axiosInstance from "./AxiosInstance";
import type { SystemSetting, CreateUpdateSystemSettingRequest } from "../types/SystemSetting";

export const getAllSystemSettings = async (): Promise<SystemSetting[]> => {
  const response = await axiosInstance.get("/api/system-settings");
  return response.data;
};

export const getSystemSettingByKey = async (key: string): Promise<SystemSetting> => {
  const response = await axiosInstance.get(`/api/system-settings/${key}`);
  return response.data;
};

export const createSystemSetting = async (data: CreateUpdateSystemSettingRequest): Promise<SystemSetting> => {
  const response = await axiosInstance.post("/api/system-settings", data);
  return response.data;
};

export const updateSystemSetting = async (key: string, data: CreateUpdateSystemSettingRequest): Promise<SystemSetting> => {
  const response = await axiosInstance.put(`/api/system-settings/${key}`, data);
  return response.data;
};

export const deleteSystemSetting = async (key: string): Promise<void> => {
  await axiosInstance.delete(`/api/system-settings/${key}`);
};