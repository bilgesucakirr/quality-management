// src/api/AnalysisService.ts
import axiosInstance from "./AxiosInstance";
import type { // NEW: Added 'type' keyword for type-only imports
  OverallAverageResponse,
  EntityAverageResponse,
  CriterionAverageResponse,
} from "../types/Analysis";

// Endpoint for overall survey average with filters
export const getOverallAverage = async (
  semester?: string,
  facultyId?: string,
  departmentId?: string,
  courseId?: string
): Promise<OverallAverageResponse> => {
  const params: { [key: string]: string | undefined } = {};
  if (semester) params.semester = semester;
  if (facultyId) params.facultyId = facultyId;
  if (departmentId) params.departmentId = departmentId;
  if (courseId) params.courseId = courseId;

  const response = await axiosInstance.get("/api/analysis/overall", { params });
  return response.data;
};

// Endpoint for averages grouped by Faculty, Department, or Course
export const getEntityAverages = async (
  entityType: "FACULTY" | "DEPARTMENT" | "COURSE",
  semester?: string,
  facultyId?: string,
  departmentId?: string
): Promise<EntityAverageResponse[]> => {
  const params: { [key: string]: string | undefined } = { entityType };
  if (semester) params.semester = semester;
  if (facultyId) params.facultyId = facultyId;
  if (departmentId) params.departmentId = departmentId;

  const response = await axiosInstance.get("/api/analysis/entity-averages", { params });
  return response.data;
};

// Endpoint for averages grouped by YÖKAK criteria levels
export const getCriterionAverages = async (
  criterionLevel?: "HEADER" | "MAIN_CRITERION" | "SUB_CRITERION",
  semester?: string,
  facultyId?: string,
  departmentId?: string,
  courseId?: string,
  parentCriterionId?: string
): Promise<CriterionAverageResponse[]> => {
  const params: { [key: string]: string | undefined } = {};
  if (criterionLevel) params.criterionLevel = criterionLevel;
  if (semester) params.semester = semester;
  if (facultyId) params.facultyId = facultyId;
  if (departmentId) params.departmentId = departmentId;
  if (courseId) params.courseId = courseId;
  if (parentCriterionId) params.parentCriterionId = parentCriterionId;

  const response = await axiosInstance.get("/api/analysis/criterion-averages", { params });
  return response.data;
};