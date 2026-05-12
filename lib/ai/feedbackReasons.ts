import type {
  BrandProfile,
  FeedbackOption,
  FeedbackStep,
  GenerationTurn,
  NextGenerationDecision,
  ThreadMacroMemory
} from "@/lib/feedback/types";
import { createOpenAIClient } from "@/lib/ai/openAiClient";
import { getAiModelRoute } from "@/lib/ai/modelRoutes";
import { isRealOpenAIEnabled } from "@/lib/ai/openAiSettings";
import type { RuntimeConfig } from "@/lib/types";

export interface FeedbackReasonPlannerInput {
  brand: BrandProfile | null;
  currentTurn: GenerationTurn;
  threadTurns: GenerationTurn[];
  macroMemory: ThreadMacroMemory;
  feedbackSteps: FeedbackStep[];
  decisionPreview?: NextGenerationDecision;
  runtimeConfig?: RuntimeConfig;
}

export interface FeedbackReasonPlannerOutput {
  feedbackSteps: FeedbackStep[];
  source: "mock" | "openai";
  model: string | null;
}

const controlOptionIds = new Set([
  "save",
  "variations",
  "campaign",
  "specific-revision",
  "choose",
  "split",
  "combine",
  "broader",
  "closer",
  "tone",
  "style",
  "audience",
  "goal",
  "subject"
]);

const feedbackStepSchema = {
  type: "object",
  additionalProperties: false,
  required: ["feedbackSteps"],
  properties: {
    feedbackSteps: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "question", "type", "required", "options"],
        properties: {
          id: { type: "string" },
          question: { type: "string" },
          type: { enum: ["single-select", "multi-select", "free-text", "confirm"] },
          required: { type: "boolean" },
          options: {
            type: "array",
            minItems: 0,
            maxItems: 12,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["id", "label", "source"],
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                source: { enum: ["brand", "image", "history", "system"] }
              }
            }
          }
        }
      }
    }
  }
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);
}

function isControlStep(step: FeedbackStep) {
  if (step.type === "goal-revision" || step.type === "confirm") return true;
  return step.options?.some((option) => controlOptionIds.has(option.id)) ?? false;
}

function compactTurn(turn: GenerationTurn): GenerationTurn {
  return {
    ...turn,
    variants: turn.variants.map((variant) => ({
      ...variant,
      src: ""
    }))
  };
}

function cleanOption(option: FeedbackOption): FeedbackOption | null {
  const label = option.label.trim().replace(/\s+/g, " ");
  if (!label || label.length > 80) return null;

  return {
    id: slugify(option.id || label) || slugify(label),
    label,
    source: option.source
  };
}

function cleanStep(step: FeedbackStep, index: number): FeedbackStep | null {
  const question = step.question.trim().replace(/\s+/g, " ");
  if (!question || question.length > 140) return null;

  const options = (step.options ?? [])
    .map(cleanOption)
    .filter((option): option is FeedbackOption => Boolean(option));
  const seen = new Set<string>();
  const uniqueOptions = options.filter((option) => {
    if (seen.has(option.id)) return false;
    seen.add(option.id);
    return true;
  });

  return {
    id: slugify(step.id || `gpt-feedback-${index + 1}`) || `gpt-feedback-${index + 1}`,
    question,
    type: step.type,
    required: step.required,
    options: uniqueOptions
  };
}

function mergeGeneratedSteps(localSteps: FeedbackStep[], generatedSteps: FeedbackStep[]) {
  if (!localSteps.length) return [];
  if (localSteps.some(isControlStep)) return localSteps;

  const cleaned = generatedSteps
    .map(cleanStep)
    .filter((step): step is FeedbackStep => Boolean(step))
    .filter((step) => step.type !== "goal-revision");

  const [localStep] = localSteps;
  if (localSteps.length === 1 && localStep.id !== "closest-direction") {
    const generatedOptions = cleaned.flatMap((step) => step.options ?? []);
    const options = [...generatedOptions, ...(localStep.options ?? [])];
    const seen = new Set<string>();
    const uniqueOptions = options.filter((option) => {
      if (seen.has(option.id)) return false;
      seen.add(option.id);
      return true;
    });

    return [
      {
        ...localStep,
        options: uniqueOptions.slice(0, 12)
      }
    ];
  }

  return cleaned.length ? cleaned.slice(0, 3) : localSteps;
}

function fallback(input: FeedbackReasonPlannerInput, model: string | null = null): FeedbackReasonPlannerOutput {
  return {
    feedbackSteps: input.feedbackSteps,
    source: "mock",
    model
  };
}

export async function generateFeedbackReasonSteps(
  input: FeedbackReasonPlannerInput
): Promise<FeedbackReasonPlannerOutput> {
  const model = getAiModelRoute("feedbackReasons").model;
  const shouldUseReal = isRealOpenAIEnabled() && input.runtimeConfig?.realMode !== false && Boolean(model);

  if (!shouldUseReal || !model || !input.feedbackSteps.length) return fallback(input, model);
  if (input.feedbackSteps.some((step) => step.type === "goal-revision")) return fallback(input, model);

  const openai = createOpenAIClient();

  const response = await openai.responses.create({
    model,
    input: [
      {
        role: "system",
        content:
          "You write contextual feedback questions and selectable reason chips for a brand-owner image exploration UI. Ask only what is needed before the next generation. Return concise JSON only. Avoid generic chips like lighting, composition, mood, or typography unless the image metadata makes them specific. Use concrete visual reasons tied to the brand, image metadata, user reactions, and thread memory. Do not mention models, prompts, APIs, or internal planning."
      },
      {
        role: "user",
        content: JSON.stringify({
          brand: input.brand,
          currentTurn: compactTurn(input.currentTurn),
          recentTurns: input.threadTurns.slice(-4).map(compactTurn),
          macroMemory: input.macroMemory,
          localFeedbackSteps: input.feedbackSteps,
          decisionPreview: input.decisionPreview,
          instruction:
            "Generate one feedback question if that is enough, or two to three short follow-up questions only when the user's signal is genuinely ambiguous. Preserve the intent of localFeedbackSteps; for a keep-and-avoid step, do not break it into separate per-image questions. Keep options specific enough that selecting them would help plan the next image generation."
        })
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "brand_image_feedback_reasons",
        schema: feedbackStepSchema,
        strict: true
      }
    } as never
  });

  const parsed = JSON.parse(response.output_text) as { feedbackSteps?: FeedbackStep[] };

  return {
    feedbackSteps: mergeGeneratedSteps(input.feedbackSteps, parsed.feedbackSteps ?? []),
    source: "openai",
    model
  };
}
