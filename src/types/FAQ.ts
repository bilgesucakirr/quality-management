export interface FAQ {
  faqId: string;
  question: string;
  answer: string;
  category?: string | null;
}

export interface CreateUpdateFAQRequest {
  question: string;
  answer: string;
  category?: string | null;
}