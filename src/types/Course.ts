// src/types/Course.ts
export interface Course {
  id: string;
  courseCode: string; // e.g., "INDE2001.1"
  courseName: string; // e.g., "Operations Research I"
  credits: number;
  semester: string; // e.g., "FALL23"
  departmentId: string;
  departmentName: string;
  instructorId?: string; // Optional
  instructorName?: string; // Optional
}