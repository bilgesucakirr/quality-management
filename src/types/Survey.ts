export interface QuestionResponse {
  id: string;
  questionText: string;
  questionType: string;
}

export interface SurveyResponse {
  id: string;
  title: string;
  description: string;
  questions: QuestionResponse[];
}

export interface CreateSurveyRequest {
  title: string;
  description: string;
  questionTexts: string[];
}

export interface UpdateSurveyRequest {
  title?: string; // Opsiyonel olabilir
  description?: string; // Opsiyonel olabilir
  questionTexts?: string[]; // Opsiyonel olabilir
}