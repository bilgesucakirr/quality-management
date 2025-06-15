import axiosInstance from "./AxiosInstance";
import type { 
  OverallAverageResponse, 
  EntityAverageResponse, 
  CriterionAverageResponse,
  QuestionAverageByDepartmentResponse 
} from "../types/Analysis";

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

export const getQuestionAveragesByDepartment = async (
  surveyId: string, 
  questionId: string, 
  semester?: string,
  facultyId?: string,
  departmentId?: string,
  courseId?: string
): Promise<QuestionAverageByDepartmentResponse[]> => {
  const params: { [key: string]: string | undefined } = { surveyId, questionId };
  if (semester) params.semester = semester;
  if (facultyId) params.facultyId = facultyId;
  if (departmentId) params.departmentId = departmentId;
  if (courseId) params.courseId = courseId;

  const response = await axiosInstance.get("/api/analysis/question-department-averages", { params });
  return response.data;
};