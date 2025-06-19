import axiosInstance from "./AxiosInstance";
import type { LoginAttempt } from "../types/LoginAttempt";

export const getAllLoginAttempts = async (): Promise<LoginAttempt[]> => {
  const response = await axiosInstance.get("/api/login-attempts");
  return response.data;
};

export const getLoginAttemptsByEmail = async (email: string): Promise<LoginAttempt[]> => {
  const response = await axiosInstance.get(`/api/login-attempts/email/${email}`);
  return response.data;
};