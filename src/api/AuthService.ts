import axiosInstance from "./AxiosInstance.ts";
import type { LoginRequest } from "../types/LoginRequest";
import type { LoginResponse } from "../types/LoginResponse";

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};
