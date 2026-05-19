import type {
  ImagePromptSituation,
  PlannerDirection,
  PlannerInput,
  PlannerOutput,
  TraceMode
} from "@/lib/types";
import type { ImageVariantMetadata } from "@/lib/feedback/types";
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

export type OrchestrationRecipe =
  | "first_generation_board"
  | "regenerate_all_board"
  | "refine"
  | "correct"
  | "explore"
  | "combine"
  | "split"
  | "edit"
  | "revise_goal"
  | "regenerate"
  | "save_direction"
  | "subsequent_exploration";

const situationLabels: Record<ImagePromptSituation, string> = {
  first_generation_9: "First-round 9-image exploration",
  regenerate_generation_9: "Regenerated 9-image board",
  regenerate_single_image: "Single image regeneration",
  subsequent_exploration: "Subsequent visual exploration",
  edit: "Image edit"
};

const recipeLabels: Record<OrchestrationRecipe, string> = {
  first_generation_board: "First-round 9-image exploration",
  regenerate_all_board: "Regenerated 9-image board",
  refine: "Refined variations around a liked anchor",
  correct: "Correction of a rejected refinement",
  explore: "Broader exploration after weak signal",
  combine: "Merged direction from multiple references",
  split: "Comparison paths from conflicting likes",
  edit: "Direct edit of a reference",
  revise_goal: "Re-baseline after revised goal",
  regenerate: "Single-image regeneration of a rejected variant",
  save_direction: "Consolidation of a saved direction",
  subsequent_exploration: "Subsequent visual exploration"
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

export function resolveOrchestrationRecipe(input: PlannerInput): OrchestrationRecipe {
  const situation = resolvePromptOrchestrationSituation(input);
  if (situation === "first_generation_9") return "first_generation_board";
  if (situation === "regenerate_generation_9") return "regenerate_all_board";

  const mode = input.originatingDecision?.mode;
  if (mode === "refine") return "refine";
  if (mode === "correct") return "correct";
  if (mode === "explore") return "explore";
  if (mode === "combine") return "combine";
  if (mode === "split") return "split";
  if (mode === "edit") return "edit";
  if (mode === "revise-goal") return "revise_goal";
  if (mode === "regenerate") return "regenerate";
  if (mode === "save-direction") return "save_direction";

  if (input.actionMode === "regenerate") return "regenerate";
  if (input.actionMode === "converge") return "combine";
  if (input.actionMode === "custom") return "edit";
  if (input.actionMode === "narrow") return "refine";

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
  const recipe = resolveOrchestrationRecipe(input);
  const count = input.outputCount ?? 9;

  return {
    situation,
    recipe,
    count,
    system: [
      "You are a generative visual exploration director and prompt orchestrator.",
      "Return only valid JSON matching the requested schema.",
      "Each prompt must be directly usable as an image model prompt."
    ].join(" "),
    user: buildUserPromptForRecipe(input, recipe, count)
  };
}

function buildUserPromptForRecipe(input: PlannerInput, recipe: OrchestrationRecipe, count: number): string {
  switch (recipe) {
    case "first_generation_board":
      return buildFirstGenerationPrompt(input, count);
    case "regenerate_all_board":
      return buildRegenerateAllPrompt(input, count);
    case "refine":
      return buildRefinePrompt(input, count);
    case "correct":
      return buildCorrectPrompt(input, count);
    case "explore":
      return buildExplorePrompt(input, count);
    case "combine":
      return buildCombinePrompt(input, count);
    case "split":
      return buildSplitPrompt(input, count);
    case "edit":
      return buildEditPrompt(input, count);
    case "revise_goal":
      return buildReviseGoalPrompt(input, count);
    case "regenerate":
      return buildRegenerateSinglePrompt(input, count);
    case "save_direction":
      return buildSaveDirectionPrompt(input, count);
    case "subsequent_exploration":
    default:
      return buildContinuationPrompt(input, "subsequent_exploration", count);
  }
}

export function plannerOutputFromPromptBoard(
  payload: PromptBoardPayload,
  input: PlannerInput
): PlannerOutput {
  const recipe = resolveOrchestrationRecipe(input);
  const count = input.outputCount ?? 9;
  const directions = payload.prompts.slice(0, count).map((item, index): PlannerDirection => {
    const name = compactText(item.name.trim() || `Image ${index + 1}`, 54);
    const prompt = item.prompt_for_image_model.trim();
    const description = compactText(item.description?.trim() || describePromptForUser(prompt, name), 220);

    return {
      label: name,
      prompt,
      description,
      why: `${recipeLabels[recipe]} prompt ${index + 1}.`,
      divergence: divergenceForRecipe(recipe, index, count)
    };
  });

  return {
    nodeTitle: nodeTitleForRecipe(recipe),
    strategy: `${recipeLabels[recipe]} selected by the prompt orchestrator.`,
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
  const boardSnapshot = formatBoardSnapshot(input.selectedVariants, 9);

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
    boardSnapshot || "No completed board snapshot was provided.",
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

function buildRefinePrompt(input: PlannerInput, count: number) {
  const brand = input.brand;
  const intent = compactText(intentFromInput(input), 600);
  const anchor = pickAnchorVariant(input.selectedVariants);
  const anchorBlock = anchor ? formatAnchor(anchor) : "No anchor variant was provided. Use the warm signals below as the closest substitute.";
  const warm = formatSignals(input.traceMemory.warmSignals, "warm");
  const cold = formatSignals(input.traceMemory.coldSignals, "cold");

  return [
    "You are a generative visual exploration director and prompt orchestrator.",
    "",
    `Your task is to write ${count} refined image prompts centered on a direction the user already liked.`,
    "",
    "This is not a fresh exploration sweep.",
    "This is not a regeneration of the whole board.",
    "This is a focused set of sibling variations around a liked anchor, with weaker traits removed.",
    "",
    "INPUTS",
    `- Brand name: ${brand?.name || "Unnamed brand"}`,
    `- Category: ${brand?.category || "open visual exploration"}`,
    `- Target audience: ${brand?.targetAudience || "unspecified audience"}`,
    `- Goal: ${brand?.goal || "visual exploration"}`,
    "",
    "USER INTENT",
    intent,
    "",
    "LIKED ANCHOR",
    anchorBlock,
    "",
    "WARM TRAITS TO PRESERVE",
    warm,
    "",
    "COLD TRAITS TO AVOID",
    cold,
    ...formatHardExclusions(input),
    "",
    "OBJECTIVE",
    `Generate ${count} image prompts that:`,
    "- Treat the user reaction and USER INTENT as authoritative. The anchor is a starting point, not a constraint: where they conflict, follow the user — including changing medium, palette, lighting, or subject.",
    "- Preserve the anchor traits the user did NOT ask to change; vary non-core dimensions: framing, micro-styling, supporting detail.",
    "- Amplify the warm traits where it makes sense, not just maintain them.",
    "- Remove any cold traits that have been recurring.",
    "- Do not drift into a different aesthetic family UNLESS the user intent calls for it (e.g. painting → photograph); then move there decisively and consistently across every prompt.",
    "",
    "CREATIVE METHOD",
    "Before writing prompts, privately do this:",
    "",
    "1. Identify the anchor's visual core. What makes it readable as this direction and not another one?",
    "2. Separate core dimensions (preserve exactly) from peripheral dimensions (vary deliberately).",
    "3. Pick peripheral choices that feel like meaningful options, not random noise around the anchor.",
    "4. Sanity-check that the warm signals are being amplified, not flattened.",
    "",
    "Do not output this planning. Only output the final prompts.",
    "",
    "PROMPT STYLE",
    "Each image prompt must be compact, vivid, and ready to send to an image model.",
    "",
    "Use this structure:",
    "",
    "[T] 1:1 {specific visual form} for {brand_name}. {visual description}. {layout or composition}. {exact readable text if any}. {aesthetic direction}. {important exclusions}.",
    "",
    "Each prompt should read as a sibling of the anchor, not a different direction.",
    "Do not make the prompts feel like the same image with one tweaked word.",
    "If the anchor has no readable text, say \"No headline text.\"",
    "",
    "OUTPUT FORMAT",
    `Return JSON object with key "prompts"; its value must contain exactly ${count} objects.`,
    "",
    "Each object must include only:",
    "- \"name\"",
    "- \"description\"",
    "- \"prompt_for_image_model\"",
    "",
    "\"description\" should be one short natural-language sentence describing what was preserved from the anchor and what was varied.",
    "",
    "Before returning, do one final check:",
    "If your prompts could fit on the anchor's moodboard and each adds one genuinely different choice, you are done.",
    "If they feel like noise around the anchor or have drifted into new territory, revise them."
  ].join("\n");
}

function buildCorrectPrompt(input: PlannerInput, count: number) {
  const brand = input.brand;
  const intent = compactText(intentFromInput(input), 600);
  const rejected = input.selectedVariants[0];
  const rejectedBlock = rejected ? formatAnchor(rejected) : "No specific rejected variant was provided.";
  const warm = formatSignals(input.traceMemory.warmSignals, "warm");
  const cold = formatSignals(input.traceMemory.coldSignals, "cold");

  return [
    "You are a generative visual exploration director and prompt orchestrator.",
    "",
    `Your task is to write ${count} corrected image prompts after a refined image was rejected.`,
    "",
    "The prior turn produced a single refined image. The user rejected that refinement.",
    "Earlier in the trace, there was a warm direction the user did like. The correction must restore that warm signal and fix the specific things that went wrong in the refinement.",
    "",
    "This is not a fresh exploration sweep.",
    "This is not a broad regeneration.",
    "This is a targeted recovery toward the prior warm direction.",
    "",
    "INPUTS",
    `- Brand name: ${brand?.name || "Unnamed brand"}`,
    `- Category: ${brand?.category || "open visual exploration"}`,
    `- Target audience: ${brand?.targetAudience || "unspecified audience"}`,
    `- Goal: ${brand?.goal || "visual exploration"}`,
    "",
    "USER INTENT",
    intent,
    "",
    "REJECTED REFINEMENT",
    rejectedBlock,
    "",
    "PRIOR WARM SIGNAL TO RESTORE",
    warm,
    "",
    "COLD TRAITS TO AVOID",
    cold,
    ...formatHardExclusions(input),
    "",
    "OBJECTIVE",
    `Generate ${count} image prompts that:`,
    "- Re-anchor on the prior warm signal, treating it as the direction to return to.",
    "- Diagnose what went wrong in the rejected refinement and avoid repeating it.",
    "- Do not over-correct into a different aesthetic family.",
    "- Stay tighter than a refine set: these are recovery attempts, not exploration.",
    "",
    "CREATIVE METHOD",
    "Before writing prompts, privately do this:",
    "",
    "1. Identify what made the rejected refinement break the warm signal. Look for changes in subject framing, palette shift, mood drift, composition, or text.",
    "2. Identify the load-bearing traits of the warm signal that must be present in every corrected prompt.",
    "3. Plan a small set of distinct correction attempts. Each should address the failure in a different way.",
    "4. Do not collapse all attempts into the safest possible image.",
    "",
    "Do not output this planning. Only output the final prompts.",
    "",
    "PROMPT STYLE",
    "Each image prompt must be compact, vivid, and ready to send to an image model.",
    "",
    "Use this structure:",
    "",
    "[T] 1:1 {specific visual form} for {brand_name}. {visual description}. {layout or composition}. {exact readable text if any}. {aesthetic direction}. {important exclusions}.",
    "",
    "If the prior warm direction had no readable text, say \"No headline text.\"",
    "",
    "OUTPUT FORMAT",
    `Return JSON object with key "prompts"; its value must contain exactly ${count} objects.`,
    "",
    "Each object must include only:",
    "- \"name\"",
    "- \"description\"",
    "- \"prompt_for_image_model\"",
    "",
    "\"description\" should be one short sentence stating what specifically is being corrected and what is being preserved from the prior warm direction.",
    "",
    "Before returning, do one final check:",
    "If every prompt would reproduce the rejected refinement's failure, revise.",
    "If every prompt has abandoned the prior warm direction, revise."
  ].join("\n");
}

function buildExplorePrompt(input: PlannerInput, count: number) {
  const brand = input.brand;
  const intent = compactText(intentFromInput(input), 600);
  const rejectedSnapshot = formatBoardSnapshot(input.selectedVariants, 9);
  const warm = formatSignals(input.traceMemory.warmSignals, "warm");
  const cold = formatSignals(input.traceMemory.coldSignals, "cold");
  const ancestry = input.traceMemory.ancestrySummary || "No prior ancestry.";

  return [
    "You are a generative visual exploration director and prompt orchestrator.",
    "",
    `Your task is to write ${count} broader image prompts after the prior set did not produce a strong signal.`,
    "",
    "The user is not asking for refinement. They are signaling that the search needs to widen.",
    "",
    "This is not a first-round board (the brand context already has trace history).",
    "This is not a full regeneration of a rejected board.",
    "This is a deliberate widening of the search direction, informed by what has been ruled out so far.",
    "",
    "INPUTS",
    `- Brand name: ${brand?.name || "Unnamed brand"}`,
    `- Category: ${brand?.category || "open visual exploration"}`,
    `- Target audience: ${brand?.targetAudience || "unspecified audience"}`,
    `- Goal: ${brand?.goal || "visual exploration"}`,
    "",
    "USER INTENT",
    intent,
    "",
    "ANCESTRY",
    ancestry,
    "",
    "PRIOR BOARD SNAPSHOT (rule-out signal, not a template)",
    rejectedSnapshot || "No prior board snapshot was provided.",
    "",
    "WARM TRAITS (faint but real, keep available)",
    warm,
    "",
    "COLD TRAITS TO AVOID",
    cold,
    "",
    "OBJECTIVE",
    `Generate ${count} image prompts that:`,
    "- Widen the visual search beyond what the prior board explored.",
    "- Move away from the cold traits without collapsing into a single safer aesthetic.",
    "- Keep faint warm traits available where useful, without forcing them everywhere.",
    "- Sample territories the prior set did not touch.",
    "",
    "CREATIVE METHOD",
    "Before writing prompts, privately do this:",
    "",
    "1. List the dimensions the prior board over-sampled (medium, palette, mood, composition, subject role).",
    "2. List adjacent territories that have not yet been tested.",
    "3. Pick a wide set of distinct territories for the new prompts.",
    "4. Confirm each territory genuinely differs from the prior set, not just superficially.",
    "",
    "Do not output this planning. Only output the final prompts.",
    "",
    "DESIGN SPACE",
    `Across the ${count} prompts, create meaningful contrast in:`,
    "- visual medium or art style",
    "- color palette",
    "- communication style",
    "- composition system",
    "- emotional tone",
    "- role of product, people, place, story, or atmosphere",
    "",
    "PROMPT STYLE",
    "Each image prompt must be compact, vivid, and ready to send to an image model.",
    "",
    "Use this structure:",
    "",
    "[T] 1:1 {specific visual form} for {brand_name}. {visual description}. {layout or composition}. {exact readable text if any}. {aesthetic direction}. {important exclusions}.",
    "",
    "Do not reuse the same visual form pattern across the prompts.",
    "If the image should not contain text, say \"No headline text.\"",
    "",
    "OUTPUT FORMAT",
    `Return JSON object with key "prompts"; its value must contain exactly ${count} objects.`,
    "",
    "Each object must include only:",
    "- \"name\"",
    "- \"description\"",
    "- \"prompt_for_image_model\"",
    "",
    "\"description\" should be one short sentence naming the new territory and how it differs from the prior set.",
    "",
    "Before returning, do one final check:",
    "If your prompts substantially overlap with the prior board, revise them.",
    "If they have ignored what the user already ruled out, revise them."
  ].join("\n");
}

function buildCombinePrompt(input: PlannerInput, count: number) {
  const brand = input.brand;
  const intent = compactText(intentFromInput(input), 600);
  const referenceBlock = formatBoardSnapshot(input.selectedVariants, 9);
  const warm = formatSignals(input.traceMemory.warmSignals, "warm");
  const cold = formatSignals(input.traceMemory.coldSignals, "cold");

  return [
    "You are a generative visual exploration director and prompt orchestrator.",
    "",
    `Your task is to write ${count} merged image prompts that combine the useful parts of multiple liked references.`,
    "",
    "Each reference contributed something the user liked. Your job is to identify what each reference contributes, then write prompts that blend those contributions in different ways.",
    "",
    "This is not a fresh exploration sweep.",
    "This is not a single-direction refinement.",
    "This is a structured merge: each prompt should feel like it inherits from the references rather than replacing them.",
    "",
    "INPUTS",
    `- Brand name: ${brand?.name || "Unnamed brand"}`,
    `- Category: ${brand?.category || "open visual exploration"}`,
    `- Target audience: ${brand?.targetAudience || "unspecified audience"}`,
    `- Goal: ${brand?.goal || "visual exploration"}`,
    "",
    "USER INTENT",
    intent,
    "",
    "REFERENCES TO COMBINE",
    referenceBlock || "No references were provided.",
    "",
    "WARM TRAITS TO PRESERVE",
    warm,
    "",
    "COLD TRAITS TO AVOID",
    cold,
    "",
    "OBJECTIVE",
    `Generate ${count} image prompts that:`,
    "- Identify the single strongest contribution from each reference (subject, composition, palette, mood, medium, or aesthetic detail).",
    "- Blend those contributions in different proportions across the prompts.",
    "- Do not produce N copies of the same blend.",
    "- Do not pick one reference and ignore the others.",
    "",
    "CREATIVE METHOD",
    "Before writing prompts, privately do this:",
    "",
    "1. For each reference, name its strongest contribution in one phrase. Treat that contribution as a building block.",
    "2. Plan how to combine the building blocks. Possible blends include foreground/background pairing, structural inheritance from one and surface treatment from another, or staged compositions that quote each reference.",
    "3. Make sure at least one prompt heavily favors each reference, and at least one prompt mixes more than two.",
    "4. Confirm no prompt is a flat average of all references.",
    "",
    "Do not output this planning. Only output the final prompts.",
    "",
    "PROMPT STYLE",
    "Each image prompt must be compact, vivid, and ready to send to an image model.",
    "",
    "Use this structure:",
    "",
    "[T] 1:1 {specific visual form} for {brand_name}. {visual description}. {layout or composition}. {exact readable text if any}. {aesthetic direction}. {important exclusions}.",
    "",
    "If the references have no readable text, say \"No headline text.\"",
    "",
    "OUTPUT FORMAT",
    `Return JSON object with key "prompts"; its value must contain exactly ${count} objects.`,
    "",
    "Each object must include only:",
    "- \"name\"",
    "- \"description\"",
    "- \"prompt_for_image_model\"",
    "",
    "\"description\" should be one short sentence stating which references are being combined and how.",
    "",
    "Before returning, do one final check:",
    "If your prompts all read as the same blend, revise them.",
    "If any reference's contribution is missing entirely, revise."
  ].join("\n");
}

function buildSplitPrompt(input: PlannerInput, count: number) {
  const brand = input.brand;
  const intent = compactText(intentFromInput(input), 600);
  const referenceBlock = formatBoardSnapshot(input.selectedVariants, 9);
  const warm = formatSignals(input.traceMemory.warmSignals, "warm");
  const cold = formatSignals(input.traceMemory.coldSignals, "cold");
  const pathA = Math.ceil(count / 2);
  const pathB = count - pathA;

  return [
    "You are a generative visual exploration director and prompt orchestrator.",
    "",
    `Your task is to write ${count} image prompts that resolve conflicting liked directions by exploring both as parallel paths.`,
    "",
    "The user liked multiple variants that point in incompatible directions. Instead of merging them, your job is to give each direction its own focused continuation set, so the user can compare side by side.",
    "",
    "This is not a merge.",
    "This is not a refinement around one anchor.",
    "This is two anchored sub-explorations, kept visually parallel in structure but distinct in direction.",
    "",
    "INPUTS",
    `- Brand name: ${brand?.name || "Unnamed brand"}`,
    `- Category: ${brand?.category || "open visual exploration"}`,
    `- Target audience: ${brand?.targetAudience || "unspecified audience"}`,
    `- Goal: ${brand?.goal || "visual exploration"}`,
    "",
    "USER INTENT",
    intent,
    "",
    "CONFLICTING LIKED REFERENCES",
    referenceBlock || "No references were provided.",
    "",
    "WARM TRAITS TO PRESERVE",
    warm,
    "",
    "COLD TRAITS TO AVOID",
    cold,
    "",
    "OBJECTIVE",
    `Generate ${count} image prompts organized as two parallel paths:`,
    `- Path A: ${pathA} prompts anchored on the first liked direction. Each stays close to its anchor and varies in non-core dimensions.`,
    `- Path B: ${pathB} prompts anchored on the second liked direction. Each stays close to its anchor and varies in non-core dimensions.`,
    "- The two paths must remain visually distinct. Do not blend them.",
    "- Within each path, the prompts should feel like siblings rather than duplicates.",
    "",
    "CREATIVE METHOD",
    "Before writing prompts, privately do this:",
    "",
    "1. Name the visual core of each anchor in one phrase.",
    "2. Confirm the two cores are genuinely different (not just surface variation).",
    "3. Plan peripheral variations for each path independently.",
    "4. Order the output so Path A and Path B are clearly grouped.",
    "",
    "Do not output this planning. Only output the final prompts.",
    "",
    "PROMPT STYLE",
    "Each image prompt must be compact, vivid, and ready to send to an image model.",
    "",
    "Use this structure:",
    "",
    "[T] 1:1 {specific visual form} for {brand_name}. {visual description}. {layout or composition}. {exact readable text if any}. {aesthetic direction}. {important exclusions}.",
    "",
    "If the anchor has no readable text, say \"No headline text.\"",
    "",
    "OUTPUT FORMAT",
    `Return JSON object with key "prompts"; its value must contain exactly ${count} objects.`,
    "",
    "Each object must include only:",
    "- \"name\"",
    "- \"description\"",
    "- \"prompt_for_image_model\"",
    "",
    "Order the prompts so that the first set belongs to Path A and the rest to Path B.",
    "\"description\" should be one short sentence naming which path the prompt belongs to and what is being varied within that path.",
    "",
    "Before returning, do one final check:",
    "If Path A and Path B are no longer visually distinct, revise.",
    "If any path collapses into one repeated image, revise."
  ].join("\n");
}

function buildEditPrompt(input: PlannerInput, count: number) {
  const brand = input.brand;
  const instruction = compactText(intentFromInput(input), 600);
  const reference = pickAnchorVariant(input.selectedVariants);
  const referenceBlock = reference ? formatAnchor(reference) : "No reference image was provided.";
  const warm = formatSignals(input.traceMemory.warmSignals, "warm");
  const cold = formatSignals(input.traceMemory.coldSignals, "cold");

  return [
    "You are a generative visual exploration director and prompt orchestrator.",
    "",
    `Your task is to write ${count} image prompts that apply a direct user edit to a reference image.`,
    "",
    "The user has issued a specific instruction. The edit is the controlling intent. Everything else about the reference must be preserved unless the instruction directly contradicts it.",
    "",
    "This is not exploration.",
    "This is not refinement.",
    "This is a tight transformation: apply the instruction, preserve the rest.",
    "",
    "INPUTS",
    `- Brand name: ${brand?.name || "Unnamed brand"}`,
    `- Category: ${brand?.category || "open visual exploration"}`,
    `- Target audience: ${brand?.targetAudience || "unspecified audience"}`,
    `- Goal: ${brand?.goal || "visual exploration"}`,
    "",
    "EDIT INSTRUCTION",
    instruction,
    "",
    "REFERENCE TO EDIT",
    referenceBlock,
    "",
    "WARM TRAITS TO PRESERVE",
    warm,
    "",
    "COLD TRAITS TO AVOID",
    cold,
    ...formatHardExclusions(input),
    "",
    "OBJECTIVE",
    `Generate ${count} image prompts that:`,
    "- Apply the edit instruction precisely.",
    "- Preserve everything else about the reference that the instruction does not directly contradict.",
    "- Vary only in how the edit is interpreted or rendered, not in the underlying direction.",
    "- Do not drift into a different aesthetic or subject.",
    "",
    "CREATIVE METHOD",
    "Before writing prompts, privately do this:",
    "",
    "1. Decompose the instruction. What exactly is being changed? What is implied to stay the same?",
    "2. Identify the reference's load-bearing traits (medium, palette, composition, subject, mood). Keep them.",
    "3. Plan a small set of interpretations of the instruction that genuinely differ in approach, not in topic.",
    "4. Confirm no interpretation contradicts the user's instruction.",
    "",
    "Do not output this planning. Only output the final prompts.",
    "",
    "PROMPT STYLE",
    "Each image prompt must be compact, vivid, and ready to send to an image model.",
    "",
    "Use this structure:",
    "",
    "[T] 1:1 {specific visual form} for {brand_name}. {visual description}. {layout or composition}. {exact readable text if any}. {aesthetic direction}. {important exclusions}.",
    "",
    "If the reference has no readable text and the instruction does not request text, say \"No headline text.\"",
    "",
    "OUTPUT FORMAT",
    `Return JSON object with key "prompts"; its value must contain exactly ${count} objects.`,
    "",
    "Each object must include only:",
    "- \"name\"",
    "- \"description\"",
    "- \"prompt_for_image_model\"",
    "",
    "\"description\" should be one short sentence stating how the instruction is being applied while preserving the rest of the reference.",
    "",
    "Before returning, do one final check:",
    "If any prompt ignores or contradicts the instruction, revise.",
    "If any prompt drifts away from the reference's load-bearing traits, revise."
  ].join("\n");
}

function buildReviseGoalPrompt(input: PlannerInput, count: number) {
  const brand = input.brand;
  const intent = compactText(intentFromInput(input), 600);
  const rejectedSnapshot = formatBoardSnapshot(input.selectedVariants, 9);
  const cold = formatSignals(input.traceMemory.coldSignals, "cold");
  const ancestry = input.traceMemory.ancestrySummary || "No prior ancestry.";

  return [
    "You are a generative visual exploration director and prompt orchestrator.",
    "",
    `Your task is to write ${count} image prompts that re-baseline the exploration around a revised goal.`,
    "",
    "The user has signaled that prior attempts were missing the brief, not just the execution. The goal or audience has been revised. Treat this as a near-fresh exploration, but informed by what was clearly wrong before.",
    "",
    "This is not a small correction.",
    "This is not a refinement.",
    "This is a re-baseline: the search starts close to first-round breadth, with the prior cold traits ruled out.",
    "",
    "INPUTS",
    `- Brand name: ${brand?.name || "Unnamed brand"}`,
    `- Category: ${brand?.category || "open visual exploration"}`,
    `- Target audience: ${brand?.targetAudience || "unspecified audience"}`,
    `- Goal: ${brand?.goal || "visual exploration"}`,
    "",
    "REVISED INTENT FROM USER",
    intent,
    "",
    "ANCESTRY (what has been tried)",
    ancestry,
    "",
    "PRIOR BOARD SNAPSHOT (rule-out signal)",
    rejectedSnapshot || "No prior board snapshot was provided.",
    "",
    "COLD TRAITS TO AVOID",
    cold,
    "",
    "OBJECTIVE",
    `Generate ${count} image prompts that:`,
    "- Treat the revised goal and audience as the new ground truth.",
    "- Match first-round diversity standards: meaningful contrast in medium, palette, composition, mood, subject role.",
    "- Avoid the prior cold traits without collapsing into a single safer aesthetic.",
    "- Do not reuse the prior board's directions even superficially.",
    "",
    "CREATIVE METHOD",
    "Before writing prompts, privately do this:",
    "",
    "1. Restate the revised goal in your own words to confirm understanding.",
    "2. Identify what the prior board was solving for that no longer applies.",
    "3. Map a wide territory under the revised goal. Include obvious, social-friendly, editorial, product-led, atmospheric, and unexpected directions when relevant.",
    "4. Pick prompts with high visual distance from each other.",
    "",
    "Do not output this planning. Only output the final prompts.",
    "",
    "DESIGN SPACE",
    `Across the ${count} prompts, create meaningful contrast in:`,
    "- visual medium or art style",
    "- color palette",
    "- communication style",
    "- composition system",
    "- emotional tone",
    "- role of product, people, place, story, or atmosphere",
    "",
    "PROMPT STYLE",
    "Each image prompt must be compact, vivid, and ready to send to an image model.",
    "",
    "Use this structure:",
    "",
    "[T] 1:1 {specific visual form} for {brand_name}. {visual description}. {layout or composition}. {exact readable text if any}. {aesthetic direction}. {important exclusions}.",
    "",
    "If the image should not contain text, say \"No headline text.\"",
    "",
    "OUTPUT FORMAT",
    `Return JSON object with key "prompts"; its value must contain exactly ${count} objects.`,
    "",
    "Each object must include only:",
    "- \"name\"",
    "- \"description\"",
    "- \"prompt_for_image_model\"",
    "",
    "\"description\" should be one short sentence naming the territory and how it serves the revised goal.",
    "",
    "Before returning, do one final check:",
    "If the prompts still echo the prior board, revise them.",
    "If the prompts ignore the revised goal, revise them."
  ].join("\n");
}

function buildRegenerateSinglePrompt(input: PlannerInput, count: number) {
  const brand = input.brand;
  const intent = compactText(intentFromInput(input), 600);
  const rejected = pickAnchorVariant(input.selectedVariants);
  const rejectedBlock = rejected ? formatAnchor(rejected) : "No specific rejected variant was provided.";
  const warm = formatSignals(input.traceMemory.warmSignals, "warm");
  const cold = formatSignals(input.traceMemory.coldSignals, "cold");

  return [
    "You are a generative visual exploration director and prompt orchestrator.",
    "",
    `Your task is to write ${count} replacement image prompt${count === 1 ? "" : "s"} for a single variant the user rejected in place.`,
    "",
    "The user did not ask to widen or refine the whole board. They want this one cell redone so it works where it currently does not.",
    "",
    "This is not a fresh exploration sweep.",
    "This is not a refinement set around a liked anchor.",
    "This is a same-slot redo: keep the variant's role in the board, fix what made this specific image fail.",
    "",
    "INPUTS",
    `- Brand name: ${brand?.name || "Unnamed brand"}`,
    `- Category: ${brand?.category || "open visual exploration"}`,
    `- Target audience: ${brand?.targetAudience || "unspecified audience"}`,
    `- Goal: ${brand?.goal || "visual exploration"}`,
    "",
    "USER INTENT",
    intent,
    "",
    "REJECTED VARIANT (the cell being replaced)",
    rejectedBlock,
    "",
    "WARM TRAITS TO KEEP AVAILABLE",
    warm,
    "",
    "COLD TRAITS TO AVOID",
    cold,
    ...formatHardExclusions(input),
    "",
    "OBJECTIVE",
    `Generate ${count} image prompt${count === 1 ? "" : "s"} that:`,
    "- Keep the rejected variant's intended role on the board (its subject purpose and slot), not its failed execution.",
    "- Diagnose what specifically made this image fail and fix exactly that.",
    "- Do not drift into a different direction the rest of the board is not exploring.",
    "- Do not simply make the image generically safer.",
    "",
    "CREATIVE METHOD",
    "Before writing prompts, privately do this:",
    "",
    "1. Identify the failed variant's intended contribution to the board.",
    "2. Separate the failure (what to fix) from the intent (what to keep).",
    count === 1
      ? "3. Commit to the single strongest fix rather than hedging."
      : "3. Plan distinct fixes so the options are genuinely different recovery attempts, not near-duplicates.",
    "",
    "Do not output this planning. Only output the final prompts.",
    "",
    "PROMPT STYLE",
    "Each image prompt must be compact, vivid, and ready to send to an image model.",
    "",
    "Use this structure:",
    "",
    "[T] 1:1 {specific visual form} for {brand_name}. {visual description}. {layout or composition}. {exact readable text if any}. {aesthetic direction}. {important exclusions}.",
    "",
    "If the slot has no readable text, say \"No headline text.\"",
    "",
    "OUTPUT FORMAT",
    `Return JSON object with key "prompts"; its value must contain exactly ${count} object${count === 1 ? "" : "s"}.`,
    "",
    "Each object must include only:",
    "- \"name\"",
    "- \"description\"",
    "- \"prompt_for_image_model\"",
    "",
    "\"description\" should be one short sentence stating what failed and how this replacement fixes it.",
    "",
    "Before returning, do one final check:",
    "If the replacement repeats the original failure, revise.",
    "If it abandons the variant's role on the board, revise."
  ].join("\n");
}

function buildSaveDirectionPrompt(input: PlannerInput, count: number) {
  const brand = input.brand;
  const intent = compactText(intentFromInput(input), 600);
  const anchor = pickAnchorVariant(input.selectedVariants);
  const anchorBlock = anchor ? formatAnchor(anchor) : "No anchor variant was provided. Use the warm signals below as the closest substitute.";
  const warm = formatSignals(input.traceMemory.warmSignals, "warm");
  const cold = formatSignals(input.traceMemory.coldSignals, "cold");

  return [
    "You are a generative visual exploration director and prompt orchestrator.",
    "",
    `Your task is to write ${count} image prompt${count === 1 ? "" : "s"} that consolidate a direction the user has explicitly saved as their preferred one.`,
    "",
    "The exploration has converged. The user repeatedly approved this direction and chose to lock it in. This is the highest-confidence signal in the session.",
    "",
    "This is not exploration.",
    "This is not a sibling-variation set.",
    "This is a clean, definitive rendering of the agreed direction: the canonical version of what the user committed to.",
    "",
    "INPUTS",
    `- Brand name: ${brand?.name || "Unnamed brand"}`,
    `- Category: ${brand?.category || "open visual exploration"}`,
    `- Target audience: ${brand?.targetAudience || "unspecified audience"}`,
    `- Goal: ${brand?.goal || "visual exploration"}`,
    "",
    "USER INTENT",
    intent,
    "",
    "SAVED DIRECTION (the locked anchor)",
    anchorBlock,
    "",
    "WARM TRAITS THAT DEFINE THIS DIRECTION",
    warm,
    "",
    "COLD TRAITS TO AVOID",
    cold,
    ...formatHardExclusions(input),
    "",
    "OBJECTIVE",
    `Generate ${count} image prompt${count === 1 ? "" : "s"} that:`,
    "- Render the saved direction as cleanly and confidently as possible.",
    "- Preserve every load-bearing trait of the anchor exactly; do not reinterpret it.",
    count === 1
      ? "- Produce the single strongest canonical rendering, not a variation."
      : "- Vary only in incidental production detail, never in the direction itself.",
    "- Resolve any leftover weakness from the anchor without changing its identity.",
    "",
    "CREATIVE METHOD",
    "Before writing prompts, privately do this:",
    "",
    "1. Name the load-bearing traits that make this the saved direction.",
    "2. Identify any residual flaw worth cleaning up without altering identity.",
    "3. Commit to the definitive rendering.",
    "",
    "Do not output this planning. Only output the final prompts.",
    "",
    "PROMPT STYLE",
    "Each image prompt must be compact, vivid, and ready to send to an image model.",
    "",
    "Use this structure:",
    "",
    "[T] 1:1 {specific visual form} for {brand_name}. {visual description}. {layout or composition}. {exact readable text if any}. {aesthetic direction}. {important exclusions}.",
    "",
    "If the saved direction has no readable text, say \"No headline text.\"",
    "",
    "OUTPUT FORMAT",
    `Return JSON object with key "prompts"; its value must contain exactly ${count} object${count === 1 ? "" : "s"}.`,
    "",
    "Each object must include only:",
    "- \"name\"",
    "- \"description\"",
    "- \"prompt_for_image_model\"",
    "",
    "\"description\" should be one short sentence stating that this is the consolidated saved direction and what defines it.",
    "",
    "Before returning, do one final check:",
    "If any prompt reinterprets or drifts from the saved direction, revise.",
    "If any prompt reads as fresh exploration rather than consolidation, revise."
  ].join("\n");
}

function buildContinuationPrompt(
  input: PlannerInput,
  situation: ImagePromptSituation,
  count: number
) {
  const brand = input.brand;
  const references = formatBoardSnapshot(input.selectedVariants, 6);

  return [
    `Situation: ${situationLabels[situation]}.`,
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
    references ? "Selected references:" : "Selected references: none.",
    references,
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

function intentFromInput(input: PlannerInput) {
  const decisionIntent = input.originatingDecision?.promptIntent?.trim();
  const userPrompt = input.userPrompt?.trim();
  if (decisionIntent && userPrompt && decisionIntent !== userPrompt) {
    return `${decisionIntent} ${userPrompt}`;
  }
  return decisionIntent || userPrompt || "Continue the visual exploration based on the available signals.";
}

function pickAnchorVariant(variants: PlannerInput["selectedVariants"]) {
  const liked = variants.find((variant) => variant.feedback?.rating === "like");
  return liked ?? variants[0];
}

function formatVariantMetadata(metadata?: ImageVariantMetadata) {
  if (!metadata) return null;
  const parts = [
    metadata.visualSummary ? `looks like ${compactText(metadata.visualSummary, 150)}` : null,
    metadata.subjects?.length ? `subjects ${metadata.subjects.slice(0, 4).join(", ")}` : null,
    metadata.style?.length ? `style ${metadata.style.slice(0, 4).join(", ")}` : null,
    metadata.palette?.length ? `palette ${metadata.palette.slice(0, 4).join(", ")}` : null,
    metadata.composition?.length ? `composition ${metadata.composition.slice(0, 3).join(", ")}` : null,
    metadata.brandFitRisks?.length ? `risks ${metadata.brandFitRisks.slice(0, 3).join(", ")}` : null
  ].filter(Boolean);
  return parts.length ? parts.join("; ") : null;
}

function formatAnchor(variant: PlannerInput["selectedVariants"][number]) {
  const meta = formatVariantMetadata(variant.metadata);
  const reaction = variant.feedback
    ? [
        `Signal: ${variant.feedback.rating}`,
        variant.feedback.reasonChips?.length ? `Reasons: ${variant.feedback.reasonChips.join(", ")}` : null,
        variant.feedback.note ? `Note: ${compactText(variant.feedback.note, 200)}` : null
      ]
        .filter(Boolean)
        .join("\n")
    : null;

  return [
    `Label: ${variant.styleLabel || "Anchor"}`,
    // The user judged the rendered image, not the text below. When the
    // original generation text and the reaction disagree, the reaction is
    // the ground truth — state that explicitly so the model does not average
    // a stale "warm/lifestyle" prompt against a "matte/no-people" reaction.
    reaction
      ? `WHAT THE USER ACTUALLY RESPONDED TO (authoritative — overrides the original text below on any conflict):\n${reaction}`
      : null,
    "Original generation text (a starting point only; defer to the reaction above where they conflict):",
    `Prompt: ${compactText(variant.prompt, 280)}`,
    meta ? `Image read: ${meta}` : null
  ]
    .filter(Boolean)
    .join("\n");
}

function formatBoardSnapshot(variants: PlannerInput["selectedVariants"], limit: number) {
  if (!variants.length) return "";
  return variants
    .slice(0, limit)
    .map((variant, index) =>
      [
        `${index + 1}. ${variant.styleLabel || `Image ${index + 1}`}`,
        `Prompt: ${compactText(variant.prompt, 220)}`,
        formatVariantMetadata(variant.metadata) ? `Image read: ${formatVariantMetadata(variant.metadata)}` : null,
        variant.feedback?.rating ? `Signal: ${variant.feedback.rating}` : null,
        variant.feedback?.reasonChips?.length ? `Reasons: ${variant.feedback.reasonChips.join(", ")}` : null,
        variant.feedback?.note ? `Note: ${compactText(variant.feedback.note, 140)}` : null
      ]
        .filter(Boolean)
        .join(" | ")
    )
    .join("\n");
}

function formatSignals(signals: string[], kind: "warm" | "cold") {
  if (!signals.length) return kind === "warm" ? "No warm signals yet." : "No cold signals yet.";
  return signals.slice(-6).map((signal, index) => `${index + 1}. ${signal}`).join("\n");
}

/**
 * Pulls the non-negotiable visual exclusions out of the steering signal:
 * the cold reason-chips plus any "no / without / avoid" phrasing the user
 * wrote. Real runs showed negatives ("no people") silently reappearing
 * because they only lived in prose; these get promoted to a hard list every
 * prompt must echo in its exclusions slot.
 */
function hardExclusions(input: PlannerInput): string[] {
  const out = new Set<string>();

  for (const signal of input.traceMemory.coldSignals) {
    const chips = signal.split(" — ")[0];
    for (const chip of chips.split(",")) {
      const trimmed = chip.trim().toLowerCase();
      if (trimmed.length >= 3 && trimmed.length <= 40) out.add(trimmed);
    }
  }

  const prose = `${intentFromInput(input)} ${input.userPrompt ?? ""}`;
  const negativeRe = /\b(?:no|without|avoid|exclude|never)\s+([a-z][a-z\- ]{2,32}?)(?=[.,;]|\band\b|\bbut\b|$)/gi;
  let match: RegExpExecArray | null;
  while ((match = negativeRe.exec(prose)) !== null) {
    const phrase = match[1].trim().toLowerCase().replace(/\s+/g, " ");
    if (phrase.length >= 3 && phrase.length <= 40) out.add(phrase);
  }

  return [...out].slice(0, 12);
}

function formatHardExclusions(input: PlannerInput): string[] {
  const items = hardExclusions(input);
  if (!items.length) return [];
  return [
    "",
    "NON-NEGOTIABLE EXCLUSIONS",
    "Every prompt's {important exclusions} slot MUST explicitly exclude all of these. Treat them as hard constraints, not soft preferences. If any prompt would contain one of these, rewrite it:",
    items.map((item) => `- no ${item}`).join("\n")
  ];
}

function nodeTitleForRecipe(recipe: OrchestrationRecipe) {
  switch (recipe) {
    case "first_generation_board":
      return "First Directions";
    case "regenerate_all_board":
      return "Regenerated Set";
    case "refine":
      return "Refined Variations";
    case "correct":
      return "Corrected Direction";
    case "explore":
      return "Broader Exploration";
    case "combine":
      return "Combined Direction";
    case "split":
      return "Parallel Paths";
    case "edit":
      return "Custom Steer";
    case "revise_goal":
      return "Re-Baselined Directions";
    case "regenerate":
      return "Regenerated Cell";
    case "save_direction":
      return "Saved Direction";
    case "subsequent_exploration":
    default:
      return "Next Directions";
  }
}

function divergenceForRecipe(
  recipe: OrchestrationRecipe,
  index: number,
  count: number
): PlannerDirection["divergence"] {
  switch (recipe) {
    case "first_generation_board":
      return index < 6 ? "wide" : "medium";
    case "regenerate_all_board":
      return index < 5 ? "wide" : "medium";
    case "explore":
    case "revise_goal":
      return index < Math.ceil(count * 0.6) ? "wide" : "medium";
    case "refine":
      return index < Math.ceil(count / 2) ? "narrow" : "medium";
    case "correct":
    case "edit":
    case "regenerate":
    case "save_direction":
      return "narrow";
    case "combine":
      return index < 2 ? "medium" : "narrow";
    case "split": {
      const pathA = Math.ceil(count / 2);
      return index < pathA ? "narrow" : "narrow";
    }
    case "subsequent_exploration":
    default:
      return index === 0 ? "narrow" : "medium";
  }
}
