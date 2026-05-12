import assert from "node:assert/strict";

import { buildBatchSocialImagePrompt, buildSingleSocialImagePrompt } from "@/lib/ai/images/socialPrompt";
import {
  buildPromptOrchestratorRequest,
  plannerOutputFromPromptBoard,
  resolveOrchestrationRecipe,
  resolvePromptOrchestrationSituation
} from "@/lib/ai/promptOrchestrator";
import type { ImageBatchGenerationInput, PlannerInput } from "@/lib/types";
import type { NextGenerationDecision } from "@/lib/feedback/types";

const input: ImageBatchGenerationInput = {
  brand: {
    id: "brand_test",
    name: "Mira Crust",
    category: "bakery",
    goal: "product imagery",
    targetAudience: "office commuters",
    toneChips: [],
    avoidNotes: "",
    monogram: "MC",
    createdAt: "2026-05-08T00:00:00.000Z"
  },
  label: "First Directions",
  prompt: "Explore breakfast pastry social media directions.",
  category: "bakery",
  seed: "test",
  outputCount: 4,
  variantLabels: ["Image 1", "Image 2", "Image 3", "Image 4"],
  variantPrompts: [
    "Warm croissant hero",
    "Morning commute lifestyle",
    "Fresh-baked material detail",
    "Simple launch campaign image"
  ],
  references: []
};

const prompt = buildBatchSocialImagePrompt(input);

assert.match(prompt, /separate image files/i);
assert.match(prompt, /one standalone square asset/i);
assert.match(prompt, /Never create a contact sheet, collage, 2x2 grid, four-panel layout/i);
assert.match(prompt, /do not combine the directions into one image/i);
assert.match(prompt, /exactly one image direction/i);

const plannerInput: PlannerInput = {
  brand: input.brand,
  traceMemory: {
    brandSummary: null,
    warmSignals: [],
    coldSignals: [],
    customSteers: [],
    promptHistory: [],
    ancestrySummary: "",
    selectedReferenceSummary: ""
  },
  actionMode: "wide",
  selectedVariants: [],
  userPrompt: "",
  seed: "test",
  outputCount: 9
};

assert.equal(resolvePromptOrchestrationSituation(plannerInput), "first_generation_9");

const orchestratorRequest = buildPromptOrchestratorRequest(plannerInput);
assert.equal(orchestratorRequest.situation, "first_generation_9");
assert.match(orchestratorRequest.user, /first-round creative exploration/i);
assert.match(orchestratorRequest.user, /Brand name: Mira Crust/i);
assert.match(orchestratorRequest.user, /exactly 9 objects/i);
assert.match(orchestratorRequest.user, /description/i);

const regeneratePlannerInput: PlannerInput = {
  ...plannerInput,
  actionMode: "regenerate",
  userPrompt: "Avoid the set feeling too generic and product-shot heavy.",
  selectedVariants: Array.from({ length: 9 }, (_, index) => ({
    id: `variant_${index + 1}`,
    nodeId: "node_1",
    src: `data:image/png;base64,${index}`,
    prompt: `Bakery visual direction ${index + 1} with repeated croissant still life.`,
    styleLabel: `Direction ${index + 1}`,
    status: "done"
  }))
};

const regenerateRequest = buildPromptOrchestratorRequest(regeneratePlannerInput);
assert.equal(regenerateRequest.situation, "regenerate_generation_9");
assert.match(regenerateRequest.user, /first-generation diversity standard as a hard requirement/i);
assert.match(regenerateRequest.user, /same breadth as a fresh first-round board/i);
assert.match(regenerateRequest.user, /Avoid the set feeling too generic/i);
assert.match(regenerateRequest.user, /CURRENT 3x3 BOARD SNAPSHOT/i);

const orchestratedPlan = plannerOutputFromPromptBoard(
  {
    prompts: Array.from({ length: 9 }, (_, index) => ({
      name: `Direction ${index + 1}`,
      description: `A plain-language preview for direction ${index + 1}.`,
      prompt_for_image_model: `[T] 1:1 test visual ${index + 1} for Mira Crust. No headline text.`
    }))
  },
  plannerInput
);

assert.equal(orchestratedPlan.directions.length, 9);
assert.equal(orchestratedPlan.directions[0].prompt, "[T] 1:1 test visual 1 for Mira Crust. No headline text.");
assert.equal(orchestratedPlan.directions[0].description, "A plain-language preview for direction 1.");

const singlePrompt = buildSingleSocialImagePrompt({
  brand: input.brand,
  label: "Direction 1",
  prompt: orchestratedPlan.directions[0].prompt,
  category: input.category,
  styleIndex: 0,
  seed: "test",
  promptSituation: "first_generation_9",
  references: []
});

assert.match(singlePrompt, /Prompt orchestration situation: First-round 9-image exploration/i);
assert.match(singlePrompt, /Use this orchestrated image prompt as the primary generation instruction/i);

function decisionWithMode(mode: NextGenerationDecision["mode"], promptIntent: string): NextGenerationDecision {
  return {
    nextOutputCount: 9,
    mode,
    promptIntent,
    memoryUpdate: promptIntent
  };
}

const likedAnchor: PlannerInput["selectedVariants"][number] = {
  id: "variant_anchor",
  nodeId: "node_anchor",
  src: "data:image/png;base64,anchor",
  prompt: "Soft morning pastry hero with hand-torn croissant edges.",
  styleLabel: "Soft morning pastry",
  status: "done",
  feedback: {
    rating: "like",
    reasonChips: ["warm light", "texture-led"],
    note: "The matte texture and morning light worked.",
    createdAt: "2026-05-08T00:00:00.000Z"
  }
};

const refineInput: PlannerInput = {
  ...plannerInput,
  actionMode: "narrow",
  selectedVariants: [likedAnchor],
  userPrompt: "Refine around the morning pastry direction.",
  outputCount: 9,
  originatingDecision: decisionWithMode(
    "refine",
    "Refine around the morning pastry direction; preserve warm light and matte texture."
  ),
  traceMemory: {
    ...plannerInput.traceMemory,
    warmSignals: ["Soft morning pastry: warm light, texture-led: matte texture worked"],
    coldSignals: ["Glossy product hero: too commercial"]
  }
};

assert.equal(resolveOrchestrationRecipe(refineInput), "refine");
const refineRequest = buildPromptOrchestratorRequest(refineInput);
assert.equal(refineRequest.recipe, "refine");
assert.match(refineRequest.user, /LIKED ANCHOR/);
assert.match(refineRequest.user, /Soft morning pastry/);
assert.match(refineRequest.user, /WARM TRAITS TO PRESERVE/);
assert.match(refineRequest.user, /sibling of the anchor/i);

const correctInput: PlannerInput = {
  ...refineInput,
  actionMode: "custom",
  outputCount: 9,
  originatingDecision: decisionWithMode(
    "correct",
    "Correct the refined image without losing the prior warm signal."
  )
};
assert.equal(resolveOrchestrationRecipe(correctInput), "correct");
const correctRequest = buildPromptOrchestratorRequest(correctInput);
assert.equal(correctRequest.recipe, "correct");
assert.match(correctRequest.user, /REJECTED REFINEMENT/);
assert.match(correctRequest.user, /PRIOR WARM SIGNAL TO RESTORE/);

const exploreInput: PlannerInput = {
  ...refineInput,
  actionMode: "wide",
  originatingDecision: decisionWithMode("explore", "Shift away from rejected directions and widen.")
};
assert.equal(resolveOrchestrationRecipe(exploreInput), "explore");
const exploreRequest = buildPromptOrchestratorRequest(exploreInput);
assert.equal(exploreRequest.recipe, "explore");
assert.match(exploreRequest.user, /widen the visual search/i);

const combineInput: PlannerInput = {
  ...refineInput,
  actionMode: "converge",
  selectedVariants: [likedAnchor, { ...likedAnchor, id: "variant_b", styleLabel: "Counter still life" }],
  originatingDecision: decisionWithMode("combine", "Combine useful parts of the selected references.")
};
assert.equal(resolveOrchestrationRecipe(combineInput), "combine");
const combineRequest = buildPromptOrchestratorRequest(combineInput);
assert.match(combineRequest.user, /REFERENCES TO COMBINE/);
assert.match(combineRequest.user, /no prompt is a flat average of all references/i);

const splitInput: PlannerInput = {
  ...combineInput,
  originatingDecision: decisionWithMode("split", "Generate two focused comparison paths.")
};
assert.equal(resolveOrchestrationRecipe(splitInput), "split");
const splitRequest = buildPromptOrchestratorRequest(splitInput);
assert.match(splitRequest.user, /Path A/);
assert.match(splitRequest.user, /Path B/);

const editInput: PlannerInput = {
  ...refineInput,
  actionMode: "custom",
  originatingDecision: decisionWithMode("edit", "Make the lighting warmer and remove the blue tint.")
};
assert.equal(resolveOrchestrationRecipe(editInput), "edit");
const editRequest = buildPromptOrchestratorRequest(editInput);
assert.match(editRequest.user, /EDIT INSTRUCTION/);
assert.match(editRequest.user, /Preserve everything else about the reference/i);

const reviseGoalInput: PlannerInput = {
  ...refineInput,
  actionMode: "wide",
  originatingDecision: decisionWithMode("revise-goal", "Re-baseline around the revised audience and goal.")
};
assert.equal(resolveOrchestrationRecipe(reviseGoalInput), "revise_goal");
const reviseGoalRequest = buildPromptOrchestratorRequest(reviseGoalInput);
assert.match(reviseGoalRequest.user, /REVISED INTENT FROM USER/);
assert.match(reviseGoalRequest.user, /re-baseline/i);

// First-generation should still take priority over any decision.mode hint.
const firstGenWithDecision: PlannerInput = {
  ...plannerInput,
  originatingDecision: decisionWithMode("refine", "Should be ignored because this is the root board.")
};
assert.equal(resolveOrchestrationRecipe(firstGenWithDecision), "first_generation_board");

// Manual converge with no decision should still pick the combine recipe.
const manualConverge: PlannerInput = {
  ...refineInput,
  actionMode: "converge",
  selectedVariants: [likedAnchor, { ...likedAnchor, id: "variant_b" }],
  originatingDecision: undefined
};
assert.equal(resolveOrchestrationRecipe(manualConverge), "combine");

// Refined planner output title should reflect the recipe.
const refinedPlan = plannerOutputFromPromptBoard(
  {
    prompts: Array.from({ length: 9 }, (_, index) => ({
      name: `Refined ${index + 1}`,
      description: `Refined direction ${index + 1}`,
      prompt_for_image_model: `[T] 1:1 refined visual ${index + 1} for Mira Crust. No headline text.`
    }))
  },
  refineInput
);
assert.equal(refinedPlan.nodeTitle, "Refined Variations");
assert.match(refinedPlan.strategy, /Refined variations around a liked anchor/);

console.log("image prompt tests passed");
