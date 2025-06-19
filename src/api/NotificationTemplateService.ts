import axiosInstance from "./AxiosInstance";
import type { NotificationTemplate, CreateUpdateNotificationTemplateRequest } from "../types/NotificationTemplate";

export const getAllNotificationTemplates = async (): Promise<NotificationTemplate[]> => {
  const response = await axiosInstance.get("/api/notification-templates");
  return response.data;
};

export const getNotificationTemplateById = async (id: string): Promise<NotificationTemplate> => {
  const response = await axiosInstance.get(`/api/notification-templates/${id}`);
  return response.data;
};

export const createNotificationTemplate = async (data: CreateUpdateNotificationTemplateRequest): Promise<NotificationTemplate> => {
  const response = await axiosInstance.post("/api/notification-templates", data);
  return response.data;
};

export const updateNotificationTemplate = async (id: string, data: Partial<CreateUpdateNotificationTemplateRequest>): Promise<NotificationTemplate> => {
  const response = await axiosInstance.put(`/api/notification-templates/${id}`, data);
  return response.data;
};

export const deleteNotificationTemplate = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/notification-templates/${id}`);
};