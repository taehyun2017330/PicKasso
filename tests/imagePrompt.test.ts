import assert from "node:assert/strict";

import { buildBatchSocialImagePrompt, buildSingleSocialImagePrompt } from "@/lib/ai/images/socialPrompt";
import {
  buildPromptOrchestratorRequest,
  plannerOutputFromPromptBoard,
  resolvePromptOrchestrationSituation
} from "@/lib/ai/promptOrchestrator";
import type { ImageBatchGenerationInput, PlannerInput } from "@/lib/types";

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
  plannerInput,
  "first_generation_9"
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

console.log("image prompt tests passed");
