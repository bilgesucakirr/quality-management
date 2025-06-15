export interface OverallAverageResponse {
  averageScore: number;
  totalSubmissions: number;
  description: string;
}

export interface EntityAverageResponse {
  id: string;
  name: string;
  averageScore: number;
  totalSubmissions: number;
  type: "FACULTY" | "DEPARTMENT" | "COURSE"; 
}

export interface CriterionAverageResponse {
  criterionId: string;
  criterionCode: string;
  criterionName: string;
  criterionLevel: "HEADER" | "MAIN_CRITERION" | "SUB_CRITERION"; 
  averageScore: number;
  totalAnswers: number;
}

export interface QuestionAverageByDepartmentResponse {
  departmentId: string;
  departmentName: string;
  questionId: string;
  questionText: string;
  averageScore: number;
  totalAnswers: number;
}