// src/types/University.ts

// Type for Faculty data
export interface Faculty {
  id: string;
  name: string;
}

// Type for Department data
export interface Department {
  id: string;
  name: string;
  facultyId: string;
  facultyName: string; // For display purposes, comes from backend DTO
}

// Request DTO for creating/updating a Faculty
export interface CreateUpdateFacultyRequest {
  name: string;
}

// Request DTO for creating/updating a Department
export interface CreateUpdateDepartmentRequest {
  name: string;
  facultyId: string;
}