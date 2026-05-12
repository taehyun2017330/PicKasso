import type {
  BrandProfile,
  FeedbackAnswer,
  FeedbackOption,
  FeedbackStep,
  GenerationTurn,
  NextGenerationDecision,
  ThreadMacroMemory,
  UserSignal
} from "@/lib/feedback/types";
import { generateFeedbackOptions } from "@/lib/feedback/dynamicChips";
import {
  areConflictingLikes,
  dislikedVariants,
  isDirectEdit,
  likedVariants,
  signalsForTurn,
  variantTraitSummary
} from "@/lib/feedback/scenarios";

function mergeOptions(options: FeedbackOption[]) {
  const seen = new Set<string>();
  return options.filter((option) => {
    if (seen.has(option.id)) return false;
    seen.add(option.id);
    return true;
  });
}

function option(id: string, label: string): FeedbackOption {
  return { id, label, source: "system" };
}

function directEditText(signals: UserSignal[]) {
  return signals.map((signal) => signal.freeText).find((text) => isDirectEdit(text))?.trim();
}

function makeDecision(input: Partial<NextGenerationDecision> & Pick<NextGenerationDecision, "mode" | "promptIntent">): NextGenerationDecision {
  return {
    nextOutputCount: input.nextOutputCount ?? 9,
    memoryUpdate: input.memoryUpdate ?? input.promptIntent,
    shouldOpenGoalRevision: input.shouldOpenGoalRevision,
    mode: input.mode,
    promptIntent: input.promptIntent
  };
}

export function decideNextStep(input: {
  brand: BrandProfile | null;
  currentTurn: GenerationTurn;
  threadTurns: GenerationTurn[];
  macroMemory: ThreadMacroMemory;
  userSignals: UserSignal[];
  freeText?: string;
}): {
  feedbackSteps: FeedbackStep[];
  decisionPreview?: NextGenerationDecision;
} {
  const { brand, currentTurn, macroMemory } = input;
  const signals = input.userSignals;
  const state = signalsForTurn(currentTurn, signals);
  const liked = likedVariants(currentTurn, signals);
  const disliked = dislikedVariants(currentTurn, signals);
  const directEdit = input.freeText?.trim() || directEditText(signals);

  if (!state.hasSignals && !input.freeText?.trim()) {
    return { feedbackSteps: [] };
  }

  if (directEdit && (state.likes.length > 0 || currentTurn.outputCount === 1 || isDirectEdit(directEdit))) {
    return {
      feedbackSteps: [],
      decisionPreview: makeDecision({
        mode: "edit",
        nextOutputCount: 4,
        promptIntent: directEdit,
        memoryUpdate: `Direct edit requested: ${directEdit}`
      })
    };
  }

  if (
    state.allSkipped ||
    (!state.likes.length &&
      !state.dislikes.length &&
      macroMemory.skipCount >= Math.max(2, macroMemory.likeCount + macroMemory.dislikeCount))
  ) {
    return {
      feedbackSteps: [
        {
          id: "unclear-direction",
          question: "Not seeing a strong direction?",
          type: "single-select",
          required: true,
          options: [
            option("broader", "show broader alternatives"),
            option("closer", brand ? "stay closer to brand" : "make the goal more specific"),
            option("visual-style", "try a different visual style")
          ]
        }
      ],
      decisionPreview: makeDecision({
        mode: "explore",
        nextOutputCount: 9,
        promptIntent: "Generate broader alternatives because the direction is not producing a strong signal.",
        memoryUpdate: "User skipped instead of selecting a direction."
      })
    };
  }

  if (currentTurn.outputCount === 1 && state.dislikes.length > 0) {
    const priorLiked = input.threadTurns.flatMap((turn) => likedVariants(turn)).at(-1);
    return {
      feedbackSteps: [
        {
          id: "what-changed",
          question: priorLiked
            ? `You liked ${variantTraitSummary([priorLiked]).slice(0, 2).join(" and ")} before. What changed in the wrong way?`
            : "What changed in the wrong way?",
          type: "multi-select",
          required: true,
          options: mergeOptions(
            currentTurn.variants.flatMap((variant) =>
              generateFeedbackOptions({ brand, variant, reaction: "dislike", macroMemory })
            )
          )
        }
      ],
      decisionPreview: makeDecision({
        mode: "correct",
        nextOutputCount: 4,
        promptIntent: "Correct the refined image without losing the prior warm signal.",
        memoryUpdate: "A refinement was rejected."
      })
    };
  }

  if (currentTurn.outputCount === 1 && state.likes.length > 0) {
    const hasPriorEdit = input.threadTurns
      .filter((turn) => turn.id !== currentTurn.id)
      .some((turn) => turn.decision?.mode === "edit");

    return {
      feedbackSteps: [
        {
          id: hasPriorEdit ? "save-reference" : "save-or-continue",
          question: hasPriorEdit
            ? "Use this as a reference for future generations?"
            : "Should this become the direction, or should we make variations?",
          type: "single-select",
          required: true,
          options: hasPriorEdit
            ? [
                option("save-reference", "save as reference"),
                option("variations", "make close variations"),
                option("lifestyle", "try lifestyle version")
              ]
            : [
                option("save", "save direction"),
                option("variations", "make close variations"),
                option("campaign", "adapt for campaign format")
              ]
        }
      ],
      decisionPreview: makeDecision({
        mode: macroMemory.repeatedLikeStreak >= 2 ? "save-direction" : "refine",
        nextOutputCount: 9,
        promptIntent: "Continue from the approved refinement or save it as the preferred direction.",
        memoryUpdate: "Single image refinement was liked."
      })
    };
  }

  if (state.allDisliked) {
    const repeated = macroMemory.repeatedDislikeStreak >= 2 || macroMemory.allDislikedTurns >= 2;
    return {
      feedbackSteps: [
        {
          id: repeated ? "revise-brief" : "all-missed",
          question: repeated
            ? brand
              ? "Should we revise the brief before continuing?"
              : "We may need to recalibrate the goal before continuing."
            : brand
              ? "Are these missing because of style, audience, or goal?"
              : "What do you think we got wrong?",
          type: repeated ? "goal-revision" : "single-select",
          required: true,
          options: repeated
            ? undefined
            : brand
              ? [option("style", "style"), option("audience", "audience"), option("goal", "goal"), option("subject", "subject focus")]
              : [
                  option("style", "style feels wrong"),
                  option("subject", "subject is unclear"),
                  option("broad", "too broad"),
                  option("visual-style", "wrong visual style")
                ]
        }
      ],
      decisionPreview: makeDecision({
        mode: repeated ? "revise-goal" : "explore",
        nextOutputCount: 9,
        shouldOpenGoalRevision: repeated,
        promptIntent: repeated
          ? "Revise the goal or audience before generating more."
          : "Shift away from all rejected directions and generate nine new alternatives.",
        memoryUpdate: "All shown images were rejected."
      })
    };
  }

  if (state.allLiked) {
    const shouldSave = macroMemory.repeatedLikeStreak >= 2 || macroMemory.allLikedTurns >= 2;
    return {
      feedbackSteps: [
        {
          id: shouldSave ? "save-or-variations" : "optimize-liked-set",
          question: shouldSave
            ? "Should this become the preferred direction?"
            : "This board works. What should we optimize for?",
          type: "single-select",
          required: true,
          options: shouldSave
            ? [
                option("save", "save direction"),
                option("variations", "make close variations"),
                option("campaign", "create a small campaign set")
              ]
            : [
                option("specific-revision", "make one specific revision"),
                option("choose", "help me choose"),
                option("campaign", "adapt for campaign format")
              ]
        }
      ],
      decisionPreview: makeDecision({
        mode: shouldSave ? "save-direction" : "refine",
        nextOutputCount: shouldSave ? 1 : 9,
        promptIntent: shouldSave
          ? "Save or make close variations from the approved direction."
          : "Narrow the approved set by optimizing for a specific use.",
        memoryUpdate: "All images were liked."
      })
    };
  }

  if (state.oneLikedRestDisliked && liked[0]) {
    const keepOptions = generateFeedbackOptions({ brand, variant: liked[0], reaction: "like", macroMemory });
    const avoidOptions = mergeOptions(
      disliked.flatMap((variant) => generateFeedbackOptions({ brand, variant, reaction: "dislike", macroMemory }))
    );
    return {
      feedbackSteps: [
        {
          id: "keep-and-avoid",
          question: `What should we keep from ${liked[0].label} and avoid from the others?`,
          type: "multi-select",
          required: true,
          options: mergeOptions([...keepOptions.slice(0, 5), ...avoidOptions.slice(0, 5)])
        }
      ],
      decisionPreview: makeDecision({
        mode: "refine",
        nextOutputCount: 9,
        promptIntent: `Refine around ${liked[0].label}; preserve ${variantTraitSummary(liked).join(", ")} and avoid rejected traits.`,
        memoryUpdate: "One image worked and the rest failed."
      })
    };
  }

  if (state.multipleLiked && areConflictingLikes(liked)) {
    return {
      feedbackSteps: [
        {
          id: "conflicting-likes",
          question: "These point to different directions. Explore both or combine them?",
          type: "single-select",
          required: true,
          options: [option("split", "explore both"), option("combine", "combine what works"), option("choose", "pick one direction")]
        }
      ],
      decisionPreview: makeDecision({
        mode: "split",
        nextOutputCount: 9,
        promptIntent: `Resolve conflicting liked directions: ${variantTraitSummary(liked).join(", ")}.`,
        memoryUpdate: "Multiple liked images point in different directions."
      })
    };
  }

  if (state.likes.length > 0 && macroMemory.allDislikedTurns >= 2) {
    return {
      feedbackSteps: [
        {
          id: "finally-worked",
          question: "What finally worked here?",
          type: "multi-select",
          required: true,
          options: mergeOptions(
            liked.flatMap((variant) => generateFeedbackOptions({ brand, variant, reaction: "like", macroMemory }))
          )
        }
      ],
      decisionPreview: makeDecision({
        mode: "refine",
        nextOutputCount: 9,
        promptIntent: "Refine from the first positive signal after repeated rejected directions.",
        memoryUpdate: "A direction finally worked after repeated rejection."
      })
    };
  }

  if (state.likes.length === 1 && state.dislikes.length === 0 && macroMemory.skipCount >= 4) {
    const settled = macroMemory.likeCount >= 2 || currentTurn.turnIndex >= 3;
    return {
      feedbackSteps: [
        {
          id: settled ? "preserve-unsure-direction" : "tentative-closest",
          question: settled ? "What should we preserve?" : "What feels closest?",
          type: "multi-select",
          required: true,
          options: mergeOptions(
            liked.flatMap((variant) => generateFeedbackOptions({ brand, variant, reaction: "like", macroMemory }))
          )
        }
      ],
      decisionPreview: makeDecision({
        mode: "refine",
        nextOutputCount: settled ? 4 : 9,
        promptIntent: settled
          ? "Preserve the clearer liked direction and refine into one image."
          : "Generate nine close variations around the tentative liked direction.",
        memoryUpdate: settled
          ? "User found a clearer direction after an unsure exploration."
          : "User found a tentative direction after skipping broad options."
      })
    };
  }

  const hasPriorSplit = input.threadTurns
    .filter((turn) => turn.id !== currentTurn.id)
    .some((turn) => turn.decision?.mode === "split");
  if (hasPriorSplit && state.likes.length > 0 && state.dislikes.length > 0) {
    return {
      feedbackSteps: [
        {
          id: "resolve-split",
          question: "Should we retire the weaker path or keep a small part of it?",
          type: "single-select",
          required: true,
          options: [
            option("retire", "retire the weaker path"),
            option("combine", "keep a small part of it"),
            option("variations", "make close variations of the stronger path")
          ]
        }
      ],
      decisionPreview: makeDecision({
        mode: "combine",
        nextOutputCount: 9,
        promptIntent: "Merge the stronger liked path with only a small useful cue from the rejected path.",
        memoryUpdate: "User chose a stronger path after a split exploration."
      })
    };
  }

  return {
    feedbackSteps: [
      {
        id: "closest-direction",
        question: state.likes.length ? "What feels closest?" : "What do you think we got wrong?",
        type: "multi-select",
        required: true,
        options: mergeOptions(
          (state.likes.length ? liked : currentTurn.variants).flatMap((variant) =>
            generateFeedbackOptions({
              brand,
              variant,
              reaction: state.likes.length ? "like" : "dislike",
              macroMemory
            })
          )
        )
      }
    ],
    decisionPreview: makeDecision({
      mode: state.likes.length ? "refine" : "explore",
      nextOutputCount: 9,
      promptIntent: state.likes.length
        ? "Use the closest signal to refine the next generation."
        : "Shift direction based on what was wrong.",
      memoryUpdate: "Mixed or unclear feedback was given."
    })
  };
}

export function resolveNextGeneration(input: {
  brand: BrandProfile | null;
  currentTurn: GenerationTurn;
  macroMemory: ThreadMacroMemory;
  feedbackAnswers: FeedbackAnswer[];
}): NextGenerationDecision {
  const customInstruction =
    input.feedbackAnswers.find((answer) => answer.stepId === "custom-instruction")?.freeText?.trim() ?? "";
  const text = input.feedbackAnswers
    .filter((answer) => answer.stepId !== "custom-instruction")
    .map((answer) => answer.freeText)
    .filter(Boolean)
    .join(" ");
  const selected = input.feedbackAnswers.flatMap((answer) => answer.optionIds ?? []);
  const preview = decideNextStep({
    brand: input.brand,
    currentTurn: input.currentTurn,
    threadTurns: [input.currentTurn],
    macroMemory: input.macroMemory,
    userSignals: input.currentTurn.userSignals,
    freeText: text
  }).decisionPreview;

  if (selected.includes("save")) {
    return makeDecision({
      mode: "save-direction",
      nextOutputCount: 1,
      promptIntent: "Save this as a preferred brand direction.",
      memoryUpdate: "User chose to save direction."
    });
  }

  if (customInstruction) {
    const direct = isDirectEdit(customInstruction);
    return makeDecision({
      mode: direct ? "edit" : (preview?.mode ?? "refine"),
      nextOutputCount: direct ? 4 : (preview?.nextOutputCount ?? 9),
      promptIntent: [customInstruction, selected.length ? `Use feedback choices: ${selected.join(", ")}.` : null]
        .filter(Boolean)
        .join(" "),
      memoryUpdate: `Custom steer requested: ${customInstruction}`
    });
  }

  if (selected.includes("split")) {
    return makeDecision({
      mode: "split",
      nextOutputCount: 9,
      promptIntent: "Generate two focused comparison paths from the conflicting liked directions.",
      memoryUpdate: "User chose to explore both directions."
    });
  }

  if (selected.includes("combine")) {
    return makeDecision({
      mode: "combine",
      nextOutputCount: 9,
      promptIntent: "Combine the useful parts of the selected directions into one merged image.",
      memoryUpdate: "User chose to combine liked signals."
    });
  }

  if (selected.includes("specific-revision") || selected.includes("variations") || selected.includes("campaign")) {
    return makeDecision({
      mode: "refine",
      nextOutputCount: selected.includes("specific-revision") ? 4 : 9,
      promptIntent: `Optimize the approved direction for ${selected.join(", ")}.${text ? ` ${text}` : ""}`,
      memoryUpdate: `User chose ${selected.join(", ")} after positive feedback.`
    });
  }

  if (selected.includes("broader") || selected.includes("style") || selected.includes("audience") || selected.includes("goal")) {
    return makeDecision({
      mode: selected.includes("goal") ? "revise-goal" : "explore",
      nextOutputCount: 9,
      shouldOpenGoalRevision: input.macroMemory.repeatedDislikeStreak >= 2 && selected.includes("goal"),
      promptIntent: `Shift the next set around: ${selected.join(", ")}.`,
      memoryUpdate: `Feedback answer selected: ${selected.join(", ")}.`
    });
  }

  if (text && isDirectEdit(text)) {
    return makeDecision({
      mode: "edit",
      nextOutputCount: 4,
      promptIntent: text,
      memoryUpdate: `Direct edit from feedback answer: ${text}`
    });
  }

  const fallback = preview ?? makeDecision({
    mode: "explore",
    nextOutputCount: 9,
    promptIntent: "Generate a broader set because the next step is still unclear.",
    memoryUpdate: "No concrete decision preview was available."
  });

  return makeDecision({
    ...fallback,
    promptIntent: [fallback.promptIntent, selected.length ? `Feedback choices: ${selected.join(", ")}.` : null, text || null]
      .filter(Boolean)
      .join(" "),
    memoryUpdate: [fallback.memoryUpdate, text || selected.join(", ")].filter(Boolean).join(" ")
  });
}
