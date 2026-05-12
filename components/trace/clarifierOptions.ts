import { generateFeedbackOptions } from "@/lib/feedback/dynamicChips";
import type { BrandProfile, FeedbackOption, ImageVariant as FeedbackImageVariant } from "@/lib/feedback/types";
import type { ClarifierMode } from "@/components/trace/modes";

const exploreFallback = [
  "stillness",
  "ritual",
  "warm lighting",
  "editorial",
  "less text",
  "natural ingredients",
  "quiet workspace",
  "strong focal point",
  "premium crop"
];

const leanFallback = [
  "calm atmosphere",
  "human moment",
  "material texture",
  "cleaner layout",
  "softer tones",
  "bolder composition",
  "product clarity",
  "campaign polish"
];

const editFallback = [
  "remove text",
  "warmer light",
  "clean background",
  "closer crop",
  "less clutter",
  "more product focus",
  "stronger color",
  "softer shadows"
];

const preserveFallback = [
  "composition",
  "subject",
  "lighting",
  "palette",
  "mood",
  "negative space",
  "texture",
  "brand fit"
];

export function buildTraitOptions({
  mode,
  brand,
  variants,
  selectedCount
}: {
  mode: ClarifierMode;
  brand: BrandProfile | null;
  variants: FeedbackImageVariant[];
  selectedCount: number;
}) {
  const reaction = "like";
  const dynamic = variants.flatMap((variant) =>
    generateFeedbackOptions({
      brand,
      variant,
      reaction,
      macroMemory: {
        totalTurns: 0,
        likeCount: selectedCount,
        dislikeCount: 0,
        skipCount: 0,
        allLikedTurns: 0,
        allDislikedTurns: 0,
        repeatedDislikeStreak: 0,
        repeatedLikeStreak: 0,
        selectedReasonFrequency: {},
        avoidedReasonFrequency: {},
        preferredVisualTraits: [],
        avoidedVisualTraits: [],
        currentConfidence: "medium",
        currentGoalFit: "improving"
      }
    })
  );
  const fallback = mode === "edit" ? preserveFallback : exploreFallback;
  return mergeOptions([...dynamic, ...fallbackOptions(fallback)]).slice(0, 9);
}

export function directionOptionsFor(mode: ClarifierMode) {
  if (mode === "edit") return fallbackOptions(editFallback);
  return fallbackOptions(leanFallback);
}

function fallbackOptions(values: string[], source: FeedbackOption["source"] = "system"): FeedbackOption[] {
  return values.map((value) => ({
    id: value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label: value,
    source
  }));
}

function mergeOptions(options: FeedbackOption[]) {
  const seen = new Set<string>();
  return options.filter((option) => {
    const key = option.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
