import axiosInstance from "./AxiosInstance.ts";
import type { UserResponse, AddUserRequest, UpdateUserRequest, UserRole } from "../types/User.ts";

export const getAllUsers = async (): Promise<UserResponse[]> => {
    const response = await axiosInstance.get("/users");
    return response.data;
};

export const addUser = async (data: AddUserRequest): Promise<UserResponse> => {
    const response = await axiosInstance.post("/users", data);
    return response.data;
};

export const updateUser = async (id: string, data: UpdateUserRequest): Promise<UserResponse> => {
    const response = await axiosInstance.put(`/users/${id}`, data);
    return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
};

export const getAllRoles = async (): Promise<UserRole[]> => {
    const response = await axiosInstance.get("/roles");
    return response.data;
};

export const getUserById = async (id: string): Promise<UserResponse> => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
};