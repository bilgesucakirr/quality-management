import axiosInstance from "./AxiosInstance";
import type { Announcement, CreateUpdateAnnouncementRequest } from "../types/Announcement";

export const getAllAnnouncements = async (): Promise<Announcement[]> => {
  const response = await axiosInstance.get("/api/announcements");
  return response.data;
};

export const getAnnouncementById = async (id: string): Promise<Announcement> => {
  const response = await axiosInstance.get(`/api/announcements/${id}`);
  return response.data;
};

export const createAnnouncement = async (data: CreateUpdateAnnouncementRequest): Promise<Announcement> => {
  const response = await axiosInstance.post("/api/announcements", data);
  return response.data;
};

export const updateAnnouncement = async (id: string, data: Partial<CreateUpdateAnnouncementRequest>): Promise<Announcement> => {
  const response = await axiosInstance.put(`/api/announcements/${id}`, data);
  return response.data;
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/announcements/${id}`);
};