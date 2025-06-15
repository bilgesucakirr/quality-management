export interface SurveySubmissionResponse {
  id: string;
  studentNumber: string;
  submissionCode: string;
  submissionDate: string; 
  surveyId: string;
  surveyTitle: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  facultyId: string;
  facultyName: string;
  departmentId: string;
  departmentName: string;
  semester: string;
}

export interface UpdateSubmissionRequest {
  semester?: string;
  courseId?: string;
  facultyId?: string;
  departmentId?: string;
}

export interface BulkSubmissionUpdateRequest {
  courseId: string;
  oldSemester: string;
  newSemester: string;
}