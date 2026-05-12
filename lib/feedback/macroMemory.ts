import type { GenerationTurn, ThreadMacroMemory } from "@/lib/feedback/types";
import { signalsForTurn, variantTraitSummary, likedVariants, dislikedVariants } from "@/lib/feedback/scenarios";

function increment(record: Record<string, number>, values: string[]) {
  for (const value of values) {
    record[value] = (record[value] ?? 0) + 1;
  }
}

function topKeys(record: Record<string, number>, limit: number) {
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key)
    .slice(0, limit);
}

export function updateMacroMemory(turns: GenerationTurn[]): ThreadMacroMemory {
  const selectedReasonFrequency: Record<string, number> = {};
  const avoidedReasonFrequency: Record<string, number> = {};
  let likeCount = 0;
  let dislikeCount = 0;
  let skipCount = 0;
  let allLikedTurns = 0;
  let allDislikedTurns = 0;
  let repeatedDislikeStreak = 0;
  let repeatedLikeStreak = 0;

  for (const turn of turns) {
    const signalState = signalsForTurn(turn);
    likeCount += signalState.likes.length;
    dislikeCount += signalState.dislikes.length;
    skipCount += signalState.skips.length;

    for (const signal of signalState.likes) increment(selectedReasonFrequency, signal.selectedReasons ?? []);
    for (const signal of signalState.dislikes) increment(avoidedReasonFrequency, signal.selectedReasons ?? []);

    increment(selectedReasonFrequency, variantTraitSummary(likedVariants(turn)));
    increment(avoidedReasonFrequency, variantTraitSummary(dislikedVariants(turn)));

    if (signalState.allLiked) {
      allLikedTurns += 1;
      repeatedLikeStreak += 1;
      repeatedDislikeStreak = 0;
    } else if (signalState.allDisliked) {
      allDislikedTurns += 1;
      repeatedDislikeStreak += 1;
      repeatedLikeStreak = 0;
    } else if (signalState.likes.length > signalState.dislikes.length) {
      repeatedLikeStreak += 1;
      repeatedDislikeStreak = 0;
    } else if (signalState.dislikes.length > signalState.likes.length) {
      repeatedDislikeStreak += 1;
      repeatedLikeStreak = 0;
    } else if (signalState.skips.length) {
      repeatedLikeStreak = 0;
      repeatedDislikeStreak = 0;
    }
  }

  const totalSignals = likeCount + dislikeCount + skipCount;
  const currentConfidence =
    repeatedLikeStreak >= 2 || likeCount >= dislikeCount + 3
      ? "high"
      : totalSignals === 0 || skipCount > likeCount + dislikeCount || repeatedDislikeStreak >= 1
        ? "low"
        : "medium";
  const currentGoalFit =
    repeatedLikeStreak >= 2 || allLikedTurns > 0
      ? "strong"
      : repeatedDislikeStreak >= 2 || allDislikedTurns >= 2
        ? "unclear"
        : likeCount > dislikeCount
          ? "improving"
          : "unclear";

  return {
    totalTurns: turns.length,
    likeCount,
    dislikeCount,
    skipCount,
    allLikedTurns,
    allDislikedTurns,
    repeatedDislikeStreak,
    repeatedLikeStreak,
    selectedReasonFrequency,
    avoidedReasonFrequency,
    preferredVisualTraits: topKeys(selectedReasonFrequency, 8),
    avoidedVisualTraits: topKeys(avoidedReasonFrequency, 8),
    currentConfidence,
    currentGoalFit,
    suggestedBrandGoalRevision:
      repeatedDislikeStreak >= 2 || allDislikedTurns >= 2
        ? "The current direction is not producing usable signals. Tighten the goal or audience before generating more."
        : undefined
  };
}
