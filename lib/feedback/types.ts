export interface BrandProfile {
  id: string;
  name: string;
  category: string;
  goal: string;
  audience: string;
}

export interface ImageVariantMetadata {
  visualSummary: string;
  subjects: string[];
  style: string[];
  palette: string[];
  composition: string[];
  brandFitStrengths: string[];
  brandFitRisks: string[];
}

export interface ImageVariant {
  id: string;
  label: string;
  src: string;
  prompt: string;
  metadata: ImageVariantMetadata;
}

export interface UserSignal {
  variantId: string;
  reaction: "like" | "dislike" | "skip";
  freeText?: string;
  selectedReasons?: string[];
}

export interface GenerationTurn {
  id: string;
  threadId: string;
  turnIndex: number;
  outputCount: 1 | 4 | 9;
  variants: ImageVariant[];
  userSignals: UserSignal[];
  feedbackSteps: FeedbackStep[];
  decision?: NextGenerationDecision;
}

export interface FeedbackStep {
  id: string;
  question: string;
  type: "single-select" | "multi-select" | "free-text" | "goal-revision" | "confirm";
  options?: FeedbackOption[];
  required: boolean;
}

export interface FeedbackOption {
  id: string;
  label: string;
  source: "brand" | "image" | "history" | "system";
}

export interface FeedbackAnswer {
  stepId: string;
  optionIds?: string[];
  freeText?: string;
  confirmed?: boolean;
}

export interface NextGenerationDecision {
  nextOutputCount: 1 | 4 | 9;
  mode: "refine" | "correct" | "explore" | "edit" | "regenerate" | "combine" | "split" | "revise-goal" | "save-direction";
  promptIntent: string;
  memoryUpdate: string;
  shouldOpenGoalRevision?: boolean;
}

export interface ThreadMacroMemory {
  totalTurns: number;
  likeCount: number;
  dislikeCount: number;
  skipCount: number;
  allLikedTurns: number;
  allDislikedTurns: number;
  repeatedDislikeStreak: number;
  repeatedLikeStreak: number;
  selectedReasonFrequency: Record<string, number>;
  avoidedReasonFrequency: Record<string, number>;
  preferredVisualTraits: string[];
  avoidedVisualTraits: string[];
  currentConfidence: "low" | "medium" | "high";
  currentGoalFit: "unclear" | "improving" | "strong";
  suggestedBrandGoalRevision?: string;
}
