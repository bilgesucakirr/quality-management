// Backend: CreateQuestionRequest'e karşılık gelen
export interface CreateQuestionRequest {
  questionText: string;
  yokakCriterionId: string; // YÖKAK kriterinin ID'si (combo box'tan seçilecek)
}

// Backend: UpdateQuestionRequest'e karşılık gelen
export interface UpdateQuestionRequest {
  id?: string; // Mevcut soruyu güncellemek için ID, yeni soru ekleniyorsa null/undefined
  questionText: string;
  yokakCriterionId: string;
}

// Backend: QuestionResponse'a karşılık gelen
export interface QuestionResponse {
  id: string;
  questionText: string;
  questionType: string; // Örneğin "LIKERT_5_SCALE"
  yokakCriterionId?: string; // YÖKAK kriterinin ID'si
  yokakCriterionCode?: string; // YÖKAK kriterinin kodu (örn. "B.1")
  yokakCriterionName?: string; // YÖKAK kriterinin adı (örn. "Liderlik")
}

// Backend: CreateSurveyRequest'e karşılık gelen (Frontend formundan gönderilen)
export interface CreateSurveyFormRequest { // Bu, frontend formundan backend'e giden request
  title: string;
  description: string;
  questions: CreateQuestionRequest[];
}

// Backend: UpdateSurveyRequest'e karşılık gelen (Frontend formundan gönderilen)
export interface UpdateSurveyFormRequest { // Bu, frontend formundan backend'e giden request
  title?: string;
  description?: string;
  questions?: UpdateQuestionRequest[];
}

// Backend: Survey DTO'suna karşılık gelen (API yanıtından dönen anket yapısı)
export interface SurveyDto { // SurveyResponse yerine SurveyDto olarak adlandırdım
  id: string;
  title: string;
  description: string;
  questions: QuestionResponse[];
}