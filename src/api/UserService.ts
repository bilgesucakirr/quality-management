// src/api/UserService.ts
import axiosInstance from "./AxiosInstance.ts"; // Import the configured Axios instance (path relative to this file)
import type { UserResponse, AddUserRequest, UpdateUserRequest, UserRole } from "../types/User.ts"; // Import user-related types

// Fetches all users from the backend
export const getAllUsers = async (): Promise<UserResponse[]> => {
    const response = await axiosInstance.get("/users");
    return response.data;
};

// Adds a new user to the system
export const addUser = async (data: AddUserRequest): Promise<UserResponse> => {
    const response = await axiosInstance.post("/users", data);
    return response.data;
};

// Updates an existing user by ID
export const updateUser = async (id: string, data: UpdateUserRequest): Promise<UserResponse> => {
    const response = await axiosInstance.put(`/users/${id}`, data);
    return response.data;
};

// Deletes a user by ID
export const deleteUser = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
};

// Fetches all available roles from the backend
export const getAllRoles = async (): Promise<UserRole[]> => {
    const response = await axiosInstance.get("/roles");
    return response.data;
};