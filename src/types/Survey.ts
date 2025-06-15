// src/types/Survey.ts

// Mevcut CreateQuestionRequest ve QuestionResponse tanımları kalacak
export interface CreateQuestionRequest {
  questionText: string;
  yokakCriterionId: string; // YÖKAK kriterinin ID'si (combo box'tan seçilecek)
}

export interface UpdateQuestionRequest {
  id?: string; // Mevcut soruyu güncellemek için ID, yeni soru ekleniyorsa null/undefined
  questionText: string;
  yokakCriterionId: string;
}

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

// NEW: UI'da Create Survey formundaki her bir sorunun durumunu tutmak için
export interface QuestionFormState {
  id?: string; // Sadece edit modunda mevcut sorular için olabilir
  questionText: string;
  selectedHeaderId: string;      // Kullanıcının seçtiği Header ID
  selectedMainCriterionId: string; // Kullanıcının seçtiği Main Criterion ID
  yokakCriterionId: string;      // Kullanıcının seçtiği Sub Criterion ID (backend'e gönderilen)
}