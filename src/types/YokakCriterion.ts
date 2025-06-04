// Backend'deki YokakCriterion modeline karşılık gelen temel interface
export interface YokakCriterion {
  id: string;
  code: string; // Örneğin "B.1", "C.2"
  name: string; // Örneğin "Leadership", "Learning and Teaching"
}

// Backend'deki YokakCriterionResponse DTO'suna karşılık gelen
export interface YokakCriterionResponse {
  id: string;
  code: string;
  name: string;
  level: "HEADER" | "MAIN_CRITERION" | "SUB_CRITERION"; // Enum string değerleri
  parentId?: string | null;
  parentCode?: string | null;
  parentName?: string | null;
}