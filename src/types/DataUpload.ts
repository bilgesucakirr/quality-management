// src/types/DataUpload.ts

// Request for file upload (handled by FormData, so no direct interface needed for the body)
// Response interface for the upload operation
export interface UploadResponse {
  message: string;
}

// Optional: if we want to list Faculties/Departments for filtering on frontend
export interface FacultyData {
    id: string;
    name: string;
}

export interface DepartmentData {
    id: string;
    name: string;
    facultyId: string;
    facultyName: string; // Optional, might be useful for display
}