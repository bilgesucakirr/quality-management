// src/api/CourseService.ts
import axiosInstance from "./AxiosInstance";
import type { Course } from "../types/Course"; 

export const createCourse = async (
  data: Omit<Course, "id" | "departmentName" | "instructorName">
): Promise<Course> => {
  const response = await axiosInstance.post("/courses", data);
  return response.data;
};

export const getAllCourses = async (departmentId?: string): Promise<Course[]> => {
  const params = departmentId ? { departmentId } : {};
  const response = await axiosInstance.get("/courses", { params });
  return response.data;
};

export const getCourseById = async (id: string): Promise<Course> => {
  const response = await axiosInstance.get(`/courses/${id}`);
  return response.data;
};

export const updateCourse = async (
  id: string,
  data: Partial<Omit<Course, "id" | "departmentName" | "instructorName">>
): Promise<Course> => {
  const response = await axiosInstance.put(`/courses/${id}`, data);
  return response.data;
};

export const deleteCourse = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/courses/${id}`);
};