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

// Optional env overrides. Defaults above are unchanged unless these are set,
// so normal/mock runs are unaffected. Used to point at real model IDs when
// exercising the live OpenAI pipeline.
const modelEnvOverrides: Partial<Record<AiModelTask, string | undefined>> = {
  promptOrchestrator: process.env.OPENAI_ORCHESTRATOR_MODEL,
  imageGeneration: process.env.OPENAI_IMAGE_MODEL
};

export function getAiModelRoute(task: AiModelTask): AiModelRoute {
  const route = modelRoutes[task];
  const override = modelEnvOverrides[task]?.trim();
  return override ? { ...route, model: override } : route;
}
