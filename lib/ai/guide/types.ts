export interface TargetAudienceSuggestionInput {
  brandName: string;
  category: string;
  currentAudience?: string;
  rerollKey?: number;
}

export interface TargetAudienceSuggestion {
  id: string;
  label: string;
  audience: string;
  rationale: string;
}

export interface TargetAudienceSuggestionOutput {
  source: "mock" | "openai";
  model: string | null;
  suggestions: TargetAudienceSuggestion[];
}
