import type { GenerationTurn, ImageVariant } from "@/lib/feedback/types";

export function signalsForTurn(turn: GenerationTurn, signals = turn.userSignals) {
  const likes = signals.filter((signal) => signal.reaction === "like");
  const dislikes = signals.filter((signal) => signal.reaction === "dislike");
  const skips = signals.filter((signal) => signal.reaction === "skip");

  return {
    likes,
    dislikes,
    skips,
    hasSignals: likes.length + dislikes.length + skips.length > 0,
    allLiked: turn.outputCount > 0 && likes.length >= turn.outputCount && dislikes.length === 0,
    allDisliked: turn.outputCount > 0 && dislikes.length >= turn.outputCount && likes.length === 0,
    allSkipped: skips.length > 0 && likes.length === 0 && dislikes.length === 0,
    oneLikedRestDisliked: turn.outputCount >= 4 && likes.length === 1 && dislikes.length >= 2,
    multipleLiked: likes.length >= 2,
    hasDirectEdit: signals.some((signal) => isDirectEdit(signal.freeText))
  };
}

export function isDirectEdit(value?: string) {
  if (!value) return false;
  const text = value.toLowerCase();
  return /\b(remove|make|change|replace|increase|decrease|crop|move|add|less|more|warm|warmer|cool|cooler|big|bigger|large|larger|small|smaller|zoom|closer|background|text|product|focus|hero)\b/.test(
    text
  );
}

export function findVariant(turn: GenerationTurn, variantId: string) {
  return turn.variants.find((variant) => variant.id === variantId) ?? null;
}

export function likedVariants(turn: GenerationTurn, signals = turn.userSignals) {
  const likedIds = new Set(signals.filter((signal) => signal.reaction === "like").map((signal) => signal.variantId));
  return turn.variants.filter((variant) => likedIds.has(variant.id));
}

export function dislikedVariants(turn: GenerationTurn, signals = turn.userSignals) {
  const dislikedIds = new Set(signals.filter((signal) => signal.reaction === "dislike").map((signal) => signal.variantId));
  return turn.variants.filter((variant) => dislikedIds.has(variant.id));
}

export function variantTraitSummary(variants: ImageVariant[]) {
  return Array.from(
    new Set(
      variants.flatMap((variant) => [
        ...variant.metadata.subjects,
        ...variant.metadata.style,
        ...variant.metadata.palette,
        ...variant.metadata.composition,
        ...variant.metadata.brandFitStrengths
      ])
    )
  ).slice(0, 6);
}

export function areConflictingLikes(variants: ImageVariant[]) {
  if (variants.length < 2) return false;
  const styleSets = variants.map((variant) => new Set([...variant.metadata.style, ...variant.metadata.palette]));
  const shared = [...styleSets[0]].filter((trait) => styleSets.slice(1).every((set) => set.has(trait)));
  return shared.length === 0;
}
