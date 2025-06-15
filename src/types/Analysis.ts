// src/types/Analysis.ts

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
  type: "FACULTY" | "DEPARTMENT" | "COURSE"; // Corresponding to backend enum/string
}

export interface CriterionAverageResponse { // <-- BU SATIR VE SONRASI TAM OLDUĞUNDAN EMİN OLUN
  criterionId: string;
  criterionCode: string;
  criterionName: string;
  criterionLevel: "HEADER" | "MAIN_CRITERION" | "SUB_CRITERION"; // Corresponding to backend enum/string
  averageScore: number;
  totalAnswers: number;
}