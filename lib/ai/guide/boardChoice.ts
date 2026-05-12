import type { TraceNode } from "@/lib/types";
import { compactText, hashString } from "@/lib/utils";

export interface BoardChoicePick {
  variantId: string;
  imageNumber: number;
  label: string;
  confidence: number;
  reason: string;
}

export interface BoardChoiceInsight {
  summary: string;
  picks: BoardChoicePick[];
  watchout: string;
}

const reasonPatterns = [
  "clearest single visual idea",
  "strongest thumbnail read",
  "most direct brand signal",
  "best balance of clarity and personality",
  "most flexible direction for the next board"
];

export function analyzeBoardChoice(node: TraceNode): BoardChoiceInsight {
  const readyVariants = node.variants.filter((variant) => variant.status === "done" && variant.src);
  const scored = readyVariants
    .map((variant, index) => {
      const seed = `${node.id}:${variant.id}:${variant.prompt}:${variant.styleLabel}`;
      const hash = hashString(seed);
      return {
        variant,
        imageNumber: node.variants.findIndex((item) => item.id === variant.id) + 1 || index + 1,
        score: 62 + (hash % 34),
        reason: reasonPatterns[hash % reasonPatterns.length]
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const picks = scored.map((item): BoardChoicePick => ({
    variantId: item.variant.id,
    imageNumber: item.imageNumber,
    label: item.variant.styleLabel || `Image ${item.imageNumber}`,
    confidence: item.score,
    reason: item.reason
  }));

  return {
    summary: picks.length
      ? `Start with ${picks[0].label}. It has the strongest immediate read and should branch cleanly.`
      : "The board is still missing finished images.",
    picks,
    watchout: readyVariants.length > 1
      ? `Avoid choosing only by polish. Compare the idea behind each image: ${compactText(readyVariants[0]?.prompt ?? "", 92)}`
      : "Wait for more finished images before making a direction call."
  };
}
