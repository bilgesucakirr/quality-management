import axiosInstance from "./AxiosInstance";
import type { AuditLog } from "../types/AuditLog";

export const getAllAuditLogs = async (): Promise<AuditLog[]> => {
  const response = await axiosInstance.get("/api/audit-logs");
  return response.data;
};