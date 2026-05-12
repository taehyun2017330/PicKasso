import type { FeedbackOption } from "@/lib/feedback/types";
import type { Brand, ImageVariant } from "@/lib/types";
import { compactText } from "@/lib/utils";

export type BoardRegenerationBrand = Pick<Brand, "category" | "name" | "targetAudience"> | null;
export type BoardRegenerationVariant = Pick<ImageVariant, "id" | "prompt" | "src" | "status" | "styleLabel">;

export interface BoardRegenerationReview {
  source: "mock" | "openai";
  model: string | null;
  summary: string;
  options: FeedbackOption[];
  snapshot: string;
}

const defaultReasons = [
  "repeated visual formula",
  "weak main subject",
  "unclear brand fit",
  "wrong emotional tone",
  "busy composition",
  "not enough usable range",
  "unclear product role",
  "weak audience signal"
];

export function analyzeBoardRegeneration(input: {
  brand: BoardRegenerationBrand;
  model?: string | null;
  variants: BoardRegenerationVariant[];
}): BoardRegenerationReview {
  const readyVariants = input.variants.filter((variant) => variant.status === "done" || variant.src);
  const prompts = readyVariants.map((variant) => `${variant.styleLabel}: ${variant.prompt}`).join(" ");
  const lower = prompts.toLowerCase();
  const detected = new Set<string>();

  addIfRepeated(detected, lower, ["minimal", "clean", "quiet", "neutral"], "too many quiet neutrals");
  addIfRepeated(detected, lower, ["poster", "headline", "text", "typography"], "too many text-led layouts");
  addIfRepeated(detected, lower, ["product", "packaging", "still life"], "too many product still lifes");
  addIfRepeated(detected, lower, ["photo", "photoreal", "realistic"], "not enough medium range");
  addIfRepeated(detected, lower, ["warm", "soft", "calm"], "too much soft warmth");

  const options = [...detected, ...defaultReasons]
    .filter((value, index, values) => values.indexOf(value) === index)
    .slice(0, 8)
    .map((label) => ({
      id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label,
      source: "system" as const
    }));

  const brandAnchor = input.brand ? `${input.brand.name} / ${input.brand.category}` : "the current brand";
  const summary =
    readyVariants.length > 1
      ? `I reviewed the full 3x3 board for ${brandAnchor}. Pick what should be avoided before I rebuild the set.`
      : "I need a finished board before I can review what should change.";

  return {
    source: "mock",
    model: input.model ?? null,
    summary,
    options,
    snapshot: boardSnapshot(input.variants)
  };
}

function addIfRepeated(
  target: Set<string>,
  text: string,
  words: string[],
  label: string
) {
  const count = words.reduce((total, word) => total + occurrences(text, word), 0);
  if (count >= 4) target.add(label);
}

function occurrences(text: string, word: string) {
  return text.split(word).length - 1;
}

export function boardSnapshot(variants: BoardRegenerationVariant[]) {
  return variants
    .slice(0, 9)
    .map((variant, index) => {
      const number = index + 1;
      const status = variant.status ?? "done";
      const prompt = compactText(variant.prompt || "No prompt", 160);
      return `${number}. ${variant.styleLabel || `Image ${number}`} [${status}] - ${prompt}`;
    })
    .join(" | ");
}
