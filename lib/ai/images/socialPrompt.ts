import type { Brand, ImageBatchGenerationInput, ImageGenerationInput } from "@/lib/types";
import { situationLabel } from "@/lib/ai/promptOrchestrator";
import { compactText } from "@/lib/utils";

function brandBrief(brand: Brand | null, fallbackCategory: string) {
  if (!brand) {
    return [
      "Brand context: unavailable.",
      `Category: ${fallbackCategory || "open social media visual exploration"}.`,
      "Use only the current thread prompt and user feedback. Do not invent fixed brand pillars."
    ].join("\n");
  }

  return [
    `Brand: ${brand.name}`,
    `Category: ${brand.category}`,
    `Primary business/creative goal: ${brand.goal}`,
    `Target audience: ${brand.targetAudience}`
  ].join("\n");
}

function referenceBrief(
  references: ImageGenerationInput["references"],
  situation?: ImageGenerationInput["promptSituation"]
) {
  if (!references?.length) return "";
  const isRegenerateAll = situation === "regenerate_generation_9";
  const limit = isRegenerateAll ? 9 : 4;

  return [
    isRegenerateAll ? "Rejected board context. Use these as avoid-and-redirect context, not as images to copy:" : "Reference image guidance:",
    ...references.slice(0, limit).map((variant, index) =>
      [
        `${index + 1}. ${variant.styleLabel || `Reference ${index + 1}`}`,
        `Direction: ${compactText(variant.prompt, 120)}`,
        variant.feedback?.rating ? `User signal: ${variant.feedback.rating}` : null,
        variant.feedback?.reasonChips.length ? `Reasons: ${variant.feedback.reasonChips.join(", ")}` : null,
        variant.feedback?.note ? `Note: ${compactText(variant.feedback.note, 120)}` : null
      ]
        .filter(Boolean)
        .join(" | ")
    )
  ].join("\n");
}

function socialMediaRules() {
  return [
    "Role: Act as a senior social media content strategist and visual creative director.",
    "Goal: produce brand-owner-ready social media image directions that can work as premium Instagram, TikTok cover, paid social, launch, or campaign concept art.",
    "Composition: square 1:1 image, one full-bleed scene or one complete graphic composition, strong thumb-stopping focal point, clear visual hierarchy, polished art direction, not a generic stock photo.",
    "Text: avoid readable copy unless explicitly requested; if text is needed, leave clean negative space for later design/layout.",
    "Brand safety: do not use real logos, trademarks, UI from existing brands, or OpenAI marks.",
    "Output: one finished image asset only. Never create a contact sheet, collage, 2x2 grid, four-panel layout, split-screen comparison, labels, captions, or UI frame inside the image."
  ].join("\n");
}

function situationBrief(situation: ImageGenerationInput["promptSituation"]) {
  if (!situation) return "";
  return `Prompt orchestration situation: ${situationLabel(situation)}.`;
}

function situationImageInstruction(situation: ImageGenerationInput["promptSituation"]) {
  if (!situation) return "";

  if (situation === "regenerate_single_image") {
    return "Situation instruction: create a fresh image for this same direction, changing the image-making details enough that it does not feel like a near-duplicate.";
  }

  if (situation === "regenerate_generation_9") {
    return "Situation instruction: make this regenerated board feel newly sampled, not a minor shuffle of the previous board. Preserve brand context, but avoid repeating the rejected board's dominant subjects, compositions, and mood.";
  }

  if (situation === "subsequent_exploration") {
    return "Situation instruction: use prior reference signals as guidance, while still producing a distinct next-step visual direction.";
  }

  if (situation === "edit") {
    return "Situation instruction: treat the user edit as the controlling instruction and preserve useful reference traits unless the edit contradicts them.";
  }

  return "Situation instruction: this is the first exploration board; maximize visual distance across directions while staying anchored in the brand brief.";
}

function creativeDirectionBlock(prompt: string) {
  const isOrchestratedImagePrompt = /^\s*\[T\]\s+1:1/i.test(prompt);

  if (!isOrchestratedImagePrompt) {
    return ["Creative direction:", prompt].join("\n");
  }

  return [
    "Creative direction:",
    "Use this orchestrated image prompt as the primary generation instruction.",
    prompt,
    "Respect exact readable text instructions from the prompt. If it says No headline text, do not add headline text."
  ].join("\n");
}

export function buildSingleSocialImagePrompt(input: ImageGenerationInput) {
  return [
    socialMediaRules(),
    brandBrief(input.brand, input.category),
    situationBrief(input.promptSituation),
    situationImageInstruction(input.promptSituation),
    referenceBrief(input.references, input.promptSituation),
    creativeDirectionBlock(input.prompt),
    input.label ? `Direction label: ${input.label}` : null,
    "Make the result feel like a plausible high-quality social media content direction for the brand owner to review."
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildBatchSocialImagePrompt(input: ImageBatchGenerationInput) {
  const count = input.outputCount;
  const directionLines = input.variantPrompts.length
    ? input.variantPrompts.slice(0, count).map((prompt, index) => {
        const label = input.variantLabels[index] || `Image ${index + 1}`;
        return `${index + 1}. ${label}: ${compactText(prompt, 320)}`;
      })
    : [`1. ${input.label}: ${input.prompt}`];

  return [
    socialMediaRules(),
    brandBrief(input.brand, input.category),
    situationBrief(input.promptSituation),
    situationImageInstruction(input.promptSituation),
    referenceBrief(input.references, input.promptSituation),
    count > 1
      ? `This API request will return ${count} separate image files. Each returned file must be one standalone square asset that fills the entire canvas.`
      : "This API request will return one separate image file. It must be one standalone square asset that fills the entire canvas.",
    count > 1
      ? [
          "Vary the separate returned files across these directions, but do not combine the directions into one image:",
          "- one returned file can lean product/subject hero",
          "- one returned file can lean lifestyle/context",
          "- one returned file can lean editorial/material detail",
          "- one returned file can lean campaign/graphic composition",
          "Keep all of them within the same brand brief and current hot/cold trace memory."
        ].join("\n")
      : "Generate one focused continuation image from the current thread decision.",
    "Current creative brief and trace intent:",
    compactText(input.prompt, 700),
    count > 1 ? "Candidate directions for the separate returned files:" : "Candidate direction for this returned file:",
    directionLines.join("\n"),
    "Critical output rule: every returned file must contain exactly one image direction, not multiple smaller images arranged inside the square."
  ].join("\n\n");
}
