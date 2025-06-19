import axiosInstance from "./AxiosInstance";
import type { ScheduledTaskHistory } from "../types/ScheduledTaskHistory";

export const getAllScheduledTaskHistories = async (): Promise<ScheduledTaskHistory[]> => {
  const response = await axiosInstance.get("/api/scheduled-task-history");
  return response.data;
};

export const getScheduledTaskHistoryByTaskName = async (taskName: string): Promise<ScheduledTaskHistory[]> => {
  const response = await axiosInstance.get(`/api/scheduled-task-history/task/${taskName}`);
  return response.data;
};