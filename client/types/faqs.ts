export type FaqCategoryKey = "all" | "general" | "nutrition" | "research" | "advocacy";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: "general" | "nutrition" | "research" | "advocacy";
  featured?: boolean;
  tags?: string[];
}

export interface FaqCategory {
  key: FaqCategoryKey;
  label: string;
  count?: number;
}
