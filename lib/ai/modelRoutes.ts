export type AiModelTask =
  | "promptOrchestrator"
  | "feedbackReasons"
  | "targetAudienceGuide"
  | "audiencePersonas"
  | "audienceImageReview"
  | "boardRegenerationReview"
  | "imageGeneration";

export type ReasoningEffort = "low" | "medium" | "high";

export interface AiModelRoute {
  model: string;
  reasoningEffort?: ReasoningEffort;
}

const modelRoutes: Record<AiModelTask, AiModelRoute> = {
  promptOrchestrator: {
    model: "gpt-5.4-mini",
    reasoningEffort: "low"
  },
  feedbackReasons: {
    model: "gpt-5.4-nano"
  },
  targetAudienceGuide: {
    model: "gpt-5.4-nano"
  },
  audiencePersonas: {
    model: "gpt-5.4-nano"
  },
  audienceImageReview: {
    model: "gpt-5.4-mini"
  },
  boardRegenerationReview: {
    model: "gpt-5.4-mini"
  },
  imageGeneration: {
    model: "gpt-image-2"
  }
};

export function getAiModelRoute(task: AiModelTask): AiModelRoute {
  return modelRoutes[task];
}
