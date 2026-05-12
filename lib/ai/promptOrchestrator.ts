import type {
  ImagePromptSituation,
  PlannerDirection,
  PlannerInput,
  PlannerOutput,
  TraceMode
} from "@/lib/types";
import { compactText } from "@/lib/utils";

export interface PromptBoardItem {
  name: string;
  description?: string;
  prompt_for_image_model: string;
}

export interface PromptBoardPayload {
  prompts: PromptBoardItem[];
}

interface ImagePromptSituationInput {
  mode: TraceMode;
  outputCount: number;
  depth: number;
  parentVariantCount: number;
  activeVariantCount?: number;
  hasExistingVariants?: boolean;
  attempt?: number;
}

const situationLabels: Record<ImagePromptSituation, string> = {
  first_generation_9: "First-round 9-image exploration",
  regenerate_generation_9: "Regenerated 9-image board",
  regenerate_single_image: "Single image regeneration",
  subsequent_exploration: "Subsequent visual exploration",
  edit: "Image edit"
};

export function resolvePromptOrchestrationSituation(input: Pick<
  PlannerInput,
  "actionMode" | "selectedVariants" | "outputCount"
>): ImagePromptSituation {
  const count = input.outputCount ?? 9;

  if (input.actionMode === "custom") return "edit";
  if (input.actionMode === "regenerate" && count === 1) return "regenerate_single_image";
  if (input.actionMode === "regenerate" && count === 9) return "regenerate_generation_9";
  if (input.actionMode === "wide" && count === 9 && input.selectedVariants.length === 0) {
    return "first_generation_9";
  }

  return "subsequent_exploration";
}

export function resolveImagePromptSituation(input: ImagePromptSituationInput): ImagePromptSituation {
  if (input.mode === "custom") return "edit";

  if (
    input.hasExistingVariants &&
    input.attempt &&
    input.attempt > 0 &&
    input.activeVariantCount === 1
  ) {
    return "regenerate_single_image";
  }

  if (input.mode === "regenerate" && input.outputCount === 9) return "regenerate_generation_9";

  if (
    input.mode === "wide" &&
    input.depth === 1 &&
    input.outputCount === 9 &&
    input.parentVariantCount === 0
  ) {
    return "first_generation_9";
  }

  return "subsequent_exploration";
}

export function promptBoardSchema(count: number) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["prompts"],
    properties: {
      prompts: {
        type: "array",
        minItems: count,
        maxItems: count,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "description", "prompt_for_image_model"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            prompt_for_image_model: { type: "string" }
          }
        }
      }
    }
  };
}

export function buildPromptOrchestratorRequest(input: PlannerInput) {
  const situation = resolvePromptOrchestrationSituation(input);
  const count = input.outputCount ?? 9;

  return {
    situation,
    count,
    system: [
      "You are a generative visual exploration director and prompt orchestrator.",
      "Return only valid JSON matching the requested schema.",
      "Each prompt must be directly usable as an image model prompt."
    ].join(" "),
    user:
      situation === "first_generation_9"
        ? buildFirstGenerationPrompt(input, count)
        : situation === "regenerate_generation_9"
          ? buildRegenerateAllPrompt(input, count)
        : buildContinuationPrompt(input, situation, count)
  };
}

export function plannerOutputFromPromptBoard(
  payload: PromptBoardPayload,
  input: PlannerInput,
  situation: ImagePromptSituation
): PlannerOutput {
  const count = input.outputCount ?? 9;
  const directions = payload.prompts.slice(0, count).map((item, index): PlannerDirection => {
    const name = compactText(item.name.trim() || `Image ${index + 1}`, 54);
    const prompt = item.prompt_for_image_model.trim();
    const description = compactText(item.description?.trim() || describePromptForUser(prompt, name), 220);

    return {
      label: name,
      prompt,
      description,
      why: `${situationLabels[situation]} prompt ${index + 1}.`,
      divergence: divergenceForSituation(situation, index)
    };
  });

  return {
    nodeTitle: nodeTitleForSituation(situation),
    strategy: `${situationLabels[situation]} selected by the prompt orchestrator.`,
    traceSummary: buildTraceSummary(input),
    directions
  };
}

export function situationLabel(situation: ImagePromptSituation) {
  return situationLabels[situation];
}

function buildFirstGenerationPrompt(input: PlannerInput, count: number) {
  const brand = input.brand;
  const brandName = brand?.name || "Unnamed brand";
  const category = brand?.category || "open visual exploration";
  const targetAudience = brand?.targetAudience || "unspecified audience";
  const goal = brand?.goal || input.userPrompt || "first-round visual exploration";

  return [
    "You are a generative visual exploration director and prompt orchestrator.",
    "",
    "Your task is to turn a brand brief into 9 compact image-generation prompts for first-round creative exploration.",
    "",
    "INPUTS",
    `- Brand name: ${brandName}`,
    `- Category: ${category}`,
    `- Target audience: ${targetAudience}`,
    `- Goal: ${goal}`,
    "",
    "OBJECTIVE",
    "Create a 9-image exploration board for the brand.",
    "",
    "This is not a final campaign system.",
    "This is not a polished brand-consistency pass.",
    "This is a first-round visual search across the possible design space.",
    "",
    "The user should see 9 directions that feel meaningfully different from one another in style, medium, tone, color, composition, and image-making approach.",
    "",
    "The goal is to discover what visual worlds might work for the brand, including some that are obvious, some that are social-friendly, and some that are unexpected but potentially strong.",
    "",
    "CREATIVE METHOD",
    "Before writing prompts, privately do this:",
    "",
    "1. Identify the category default.",
    "   For example, what would this category normally produce if the prompt were too safe?",
    "",
    "2. Step beyond that default.",
    "   The 9 directions should not all live inside the obvious category look.",
    "",
    "3. Create a wide internal map of possible visual territories.",
    "   Think in terms of image-making possibilities, not only social post types.",
    "",
    "4. Select 9 territories with high visual distance from each other.",
    "   Each territory should feel like a different direction a user could react to.",
    "",
    "Do not output this planning.",
    "Only output the final prompts.",
    "",
    "DESIGN SPACE",
    "Across the 9 prompts, create meaningful contrast in:",
    "- visual medium or art style",
    "- color palette",
    "- communication style",
    "- level of realism",
    "- composition system",
    "- amount of text",
    "- role of product, people, place, story, or atmosphere",
    "- emotional tone",
    "- degree of graphic design vs image-making",
    "",
    "The brand brief should guide the subject and purpose, but it should not force every output into the same aesthetic family.",
    "",
    "PROMPT STYLE",
    "Each image prompt must be compact, vivid, and ready to send to an image model.",
    "",
    "Use this structure:",
    "",
    "[T] 1:1 {specific visual form} for {brand_name}. {visual description}. {layout or composition}. {exact readable text if any}. {aesthetic direction}. {important exclusions}.",
    "",
    "Important:",
    "The phrase after \"1:1\" should be a specific visual form invented for that direction.",
    "Do not use internal strategy labels as the visual form.",
    "Do not repeat the same visual form pattern across the 9 prompts.",
    "If the image should contain text, write the exact text.",
    "If the image should not contain text, say \"No headline text.\"",
    "Keep each prompt concise.",
    "",
    "OUTPUT FORMAT",
    `Return JSON object with key "prompts"; its value must contain exactly ${count} objects.`,
    "",
    "Each object must include only:",
    "- \"name\"",
    "- \"description\"",
    "- \"prompt_for_image_model\"",
    "",
    "\"description\" should be one short natural-language sentence for the user preview. It should explain the visual direction, not expose prompt mechanics.",
    "",
    "Before returning, do one final check:",
    "If the 9 prompts could all belong to the same moodboard, revise them.",
    "The final set should feel like a broad visual exploration, not nine similar brand images."
  ].join("\n");
}

function buildRegenerateAllPrompt(input: PlannerInput, count: number) {
  const brand = input.brand;
  const brandName = brand?.name || "Unnamed brand";
  const category = brand?.category || "open visual exploration";
  const targetAudience = brand?.targetAudience || "unspecified audience";
  const goal = brand?.goal || "visual exploration";
  const feedback = compactText(input.userPrompt || "The user wants the full board regenerated.", 900);
  const boardSnapshot = input.selectedVariants
    .slice(0, 9)
    .map((variant, index) =>
      [
        `${index + 1}. ${variant.styleLabel || `Image ${index + 1}`}`,
        `Prompt: ${compactText(variant.prompt, 220)}`,
        variant.feedback?.rating ? `Signal: ${variant.feedback.rating}` : null,
        variant.feedback?.reasonChips.length ? `Reasons: ${variant.feedback.reasonChips.join(", ")}` : null,
        variant.feedback?.note ? `Note: ${compactText(variant.feedback.note, 140)}` : null
      ]
        .filter(Boolean)
        .join(" | ")
    );

  return [
    "You are a generative visual exploration director and prompt orchestrator.",
    "",
    "Your task is to regenerate an entire 9-image exploration board after the user rejected or questioned the current board.",
    "",
    "This is not a single-image regeneration.",
    "This is not a small shuffle of the previous board.",
    "This is a fresh first-round-style visual search that learns from what the user did not like.",
    "",
    "INPUTS",
    `- Brand name: ${brandName}`,
    `- Category: ${category}`,
    `- Target audience: ${targetAudience}`,
    `- Goal: ${goal}`,
    "",
    "USER FEEDBACK / AVOID SIGNAL",
    feedback,
    "",
    "CURRENT 3x3 BOARD SNAPSHOT",
    boardSnapshot.length ? boardSnapshot.join("\n") : "No completed board snapshot was provided.",
    "",
    "OBJECTIVE",
    "Create a replacement 9-image exploration board for the same brand.",
    "",
    "Use the first-generation diversity standard as a hard requirement.",
    "The user's feedback tells you what to avoid and where to redirect, but it must not collapse the board into one visual family.",
    "",
    "Keep the useful part of first-round exploration:",
    "- broad visual distance across the 9 prompts",
    "- meaningful contrast in medium, tone, color, composition, realism, subject, and text use",
    "- enough diversity that the user can react to different possible visual worlds",
    "- the same breadth as a fresh first-round board, with the weak traits removed",
    "",
    "But steer away from what the user disliked:",
    "- Treat the user feedback as negative direction, not as a request to repeat those traits.",
    "- Avoid the weaknesses visible in the current board snapshot.",
    "- Do not solve the rejection by making every image safer or more similar.",
    "",
    "CREATIVE METHOD",
    "Before writing prompts, privately do this:",
    "",
    "1. Identify what the current board was over-indexing on.",
    "   Look for repeated composition, subject, mood, palette, medium, or usefulness problems.",
    "",
    "2. Translate the user's avoid feedback into creative constraints.",
    "   The constraints should redirect the board, not narrow it into one aesthetic.",
    "",
    "3. Rebuild a wide map of 9 new territories.",
    "   Each territory should feel newly sampled while still belonging to the brand and goal.",
    "",
    "4. Preserve exploration range.",
    "   Match the breadth expected from the initial-generation prompt: vary medium, mood, format, and subject role aggressively.",
    "   Include obvious, social-friendly, editorial, product-led, atmospheric, graphic, human, and unexpected possibilities when relevant.",
    "",
    "Do not output this planning.",
    "Only output the final prompts.",
    "",
    "DESIGN SPACE",
    "Across the 9 prompts, create meaningful contrast in:",
    "- visual medium or art style",
    "- color palette",
    "- communication style",
    "- level of realism",
    "- composition system",
    "- amount of text",
    "- role of product, people, place, story, or atmosphere",
    "- emotional tone",
    "- degree of graphic design vs image-making",
    "",
    "PROMPT STYLE",
    "Each image prompt must be compact, vivid, and ready to send to an image model.",
    "",
    "Use this structure:",
    "",
    "[T] 1:1 {specific visual form} for {brand_name}. {visual description}. {layout or composition}. {exact readable text if any}. {aesthetic direction}. {important exclusions}.",
    "",
    "Important:",
    "The phrase after \"1:1\" should be a specific visual form invented for that direction.",
    "Do not reuse the same visual form pattern across the 9 prompts.",
    "Do not recreate the current board cell-by-cell.",
    "If the image should contain text, write the exact text.",
    "If the image should not contain text, say \"No headline text.\"",
    "Keep each prompt concise.",
    "",
    "OUTPUT FORMAT",
    `Return JSON object with key "prompts"; its value must contain exactly ${count} objects.`,
    "",
    "Each object must include only:",
    "- \"name\"",
    "- \"description\"",
    "- \"prompt_for_image_model\"",
    "",
    "\"description\" should be one short natural-language sentence for the user preview. It should explain the new visual direction, not expose prompt mechanics.",
    "",
    "Before returning, do one final check:",
    "If the regenerated 9 prompts could be mistaken for minor variations of the rejected board, revise them.",
    "If the 9 prompts could all belong to the same moodboard, revise them.",
    "The final set should feel broad, newly redirected, and responsive to the avoid feedback."
  ].join("\n");
}

function buildContinuationPrompt(
  input: PlannerInput,
  situation: ImagePromptSituation,
  count: number
) {
  const brand = input.brand;
  const references = input.selectedVariants
    .slice(0, 6)
    .map((variant, index) =>
      [
        `${index + 1}. ${variant.styleLabel}`,
        `Prompt: ${compactText(variant.prompt, 220)}`,
        variant.feedback?.rating ? `Signal: ${variant.feedback.rating}` : null,
        variant.feedback?.reasonChips.length ? `Reasons: ${variant.feedback.reasonChips.join(", ")}` : null,
        variant.feedback?.note ? `Note: ${compactText(variant.feedback.note, 140)}` : null
      ]
        .filter(Boolean)
        .join(" | ")
    );

  return [
    `Situation: ${situationLabels[situation]}.`,
    "This prompt recipe is a placeholder until a dedicated situation prompt is written.",
    "Use the trace context to create compact, image-model-ready prompts without collapsing every option into the same look.",
    "",
    "Brand brief:",
    `- Brand name: ${brand?.name || "Unnamed brand"}`,
    `- Category: ${brand?.category || "open visual exploration"}`,
    `- Target audience: ${brand?.targetAudience || "unspecified audience"}`,
    `- Goal: ${brand?.goal || input.userPrompt || "visual exploration"}`,
    "",
    "Current user intent:",
    compactText(input.userPrompt || "Continue the visual exploration.", 450),
    "",
    "Trace memory:",
    buildTraceSummary(input),
    "",
    references.length ? "Selected references:" : "Selected references: none.",
    references.join("\n"),
    "",
    "Write compact image prompts in this structure:",
    "[T] 1:1 {specific visual form} for {brand_name}. {visual description}. {layout or composition}. {exact readable text if any}. {aesthetic direction}. {important exclusions}.",
    "",
    `Return JSON object with key "prompts"; its value must contain exactly ${count} objects.`,
    "Each object must include only \"name\", \"description\", and \"prompt_for_image_model\".",
    "\"description\" should be one short natural-language sentence for the user preview."
  ].join("\n");
}

export function describePromptForUser(prompt: string, fallbackName = "Image direction") {
  const withoutTag = prompt
    .replace(/^\s*\[T\]\s*/i, "")
    .replace(/^\s*1:1\s*/i, "")
    .trim();
  const sentences = withoutTag
    .split(".")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !/^No headline text$/i.test(item))
    .filter((item) => !/^Exact readable text/i.test(item))
    .filter((item) => !/^No logos?/i.test(item))
    .filter((item) => !/^No extra/i.test(item));
  const firstTwo = sentences.slice(0, 2).join(". ");

  if (firstTwo) return compactText(`${firstTwo}.`, 220);
  return compactText(fallbackName, 220);
}

function buildTraceSummary(input: PlannerInput) {
  return [
    input.traceMemory.ancestrySummary || "No prior ancestry.",
    input.traceMemory.warmSignals.length ? `Warm signals: ${input.traceMemory.warmSignals.slice(-4).join("; ")}` : "Warm signals: none.",
    input.traceMemory.coldSignals.length ? `Cold signals: ${input.traceMemory.coldSignals.slice(-4).join("; ")}` : "Cold signals: none.",
    input.traceMemory.customSteers.length
      ? `Custom steers: ${input.traceMemory.customSteers.slice(-3).join("; ")}`
      : "Custom steers: none."
  ].join(" ");
}

function nodeTitleForSituation(situation: ImagePromptSituation) {
  if (situation === "first_generation_9") return "First Directions";
  if (situation === "regenerate_generation_9") return "Regenerated Set";
  if (situation === "regenerate_single_image") return "Regenerated Image";
  if (situation === "edit") return "Custom Steer";
  return "Next Directions";
}

function divergenceForSituation(
  situation: ImagePromptSituation,
  index: number
): PlannerDirection["divergence"] {
  if (situation === "first_generation_9") return index < 6 ? "wide" : "medium";
  if (situation === "regenerate_generation_9") return index < 5 ? "wide" : "medium";
  if (situation === "regenerate_single_image" || situation === "edit") return "narrow";
  return index === 0 ? "narrow" : "medium";
}
