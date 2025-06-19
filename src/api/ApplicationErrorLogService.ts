import axiosInstance from "./AxiosInstance";
import type { ApplicationErrorLog } from "../types/ApplicationErrorLog";

export const getAllApplicationErrorLogs = async (): Promise<ApplicationErrorLog[]> => {
  const response = await axiosInstance.get("/api/application-error-logs");
  return response.data;
};