export interface FormData {
  topics: string[];
  heading: string;
  problem: string;
  solution: string;
  customerSatisfaction: number;
  knowledgeContent: string;
  description: string;
  isFrequent: boolean;
  needsImprovement: boolean;
  status: 'draft' | 'published';
  files: File[];
}

export enum EntryType {
  SUPPORT_CASE = 'support_case',
  PRODUCT_KNOWLEDGE = 'product_knowledge',
  PROCESS = 'process'
}

export interface Topic {
  id: string;
  name: string;
}