import assert from "node:assert/strict";

import { decideNextStep, resolveNextGeneration } from "@/lib/feedback/decisionEngine";
import { updateMacroMemory } from "@/lib/feedback/macroMemory";
import type { BrandProfile, GenerationTurn, ImageVariant, UserSignal } from "@/lib/feedback/types";

const bakeryBrand: BrandProfile = {
  id: "brand_luna",
  name: "Luna Bakery",
  category: "bakery",
  goal: "launch campaign",
  audience: "morning pastry customers"
};

function variant(id: string, label: string, traits: Partial<ImageVariant["metadata"]> = {}): ImageVariant {
  return {
    id,
    label,
    src: "",
    prompt: label,
    metadata: {
      visualSummary: label,
      subjects: traits.subjects ?? ["croissant focus"],
      style: traits.style ?? ["warm"],
      palette: traits.palette ?? ["earthy warm palette"],
      composition: traits.composition ?? ["image-led composition"],
      brandFitStrengths: traits.brandFitStrengths ?? ["fresh-baked texture"],
      brandFitRisks: traits.brandFitRisks ?? ["too polished"]
    }
  };
}

function turn(id: string, signals: UserSignal[], outputCount: 1 | 4 | 9 = 4, variants?: ImageVariant[]): GenerationTurn {
  return {
    id,
    threadId: "thread_1",
    turnIndex: Number(id.replace(/\D/g, "")) || 1,
    outputCount,
    variants:
      variants ??
      [
        variant("a", "Warm Croissant Hero", { style: ["warm"], subjects: ["croissant focus"] }),
        variant("b", "Playful Poster", { style: ["playful"], palette: ["confident color"] }),
        variant("c", "Clinical Product", { style: ["technical trust"], palette: ["calm neutral palette"] }),
        variant("d", "Rustic Table", { style: ["rustic handmade"], subjects: ["fresh-baked texture"] })
      ].slice(0, outputCount),
    userSignals: signals,
    feedbackSteps: []
  };
}

function decide(turns: GenerationTurn[]) {
  const currentTurn = turns.at(-1);
  assert(currentTurn);
  const macroMemory = updateMacroMemory(turns);
  return decideNextStep({
    brand: bakeryBrand,
    currentTurn,
    threadTurns: turns,
    macroMemory,
    userSignals: currentTurn.userSignals
  });
}

{
  const current = turn("turn_1", [
    { variantId: "a", reaction: "like" },
    { variantId: "b", reaction: "dislike" },
    { variantId: "c", reaction: "dislike" },
    { variantId: "d", reaction: "dislike" }
  ]);
  const result = decide([current]);

  assert.equal(result.decisionPreview?.nextOutputCount, 9);
  assert.equal(result.decisionPreview?.mode, "refine");
  assert.match(result.feedbackSteps[0].question, /keep from Warm Croissant Hero and avoid/);
  assert(result.feedbackSteps[0].options?.some((option) => option.label === "warm morning bakery feel"));
}

{
  const rejectedOnce = turn("turn_1", [
    { variantId: "a", reaction: "dislike" },
    { variantId: "b", reaction: "dislike" },
    { variantId: "c", reaction: "dislike" },
    { variantId: "d", reaction: "dislike" }
  ]);
  const rejectedTwice = turn("turn_2", [
    { variantId: "a", reaction: "dislike" },
    { variantId: "b", reaction: "dislike" },
    { variantId: "c", reaction: "dislike" },
    { variantId: "d", reaction: "dislike" }
  ]);
  const result = decide([rejectedOnce, rejectedTwice]);

  assert.equal(result.decisionPreview?.mode, "revise-goal");
  assert.equal(result.decisionPreview?.shouldOpenGoalRevision, true);
  assert.equal(result.feedbackSteps[0].type, "goal-revision");
}

{
  const rejectedOnce = turn("turn_1", [
    { variantId: "a", reaction: "dislike" },
    { variantId: "b", reaction: "dislike" },
    { variantId: "c", reaction: "dislike" },
    { variantId: "d", reaction: "dislike" }
  ]);
  const rejectedTwice = turn("turn_2", [
    { variantId: "a", reaction: "dislike" },
    { variantId: "b", reaction: "dislike" },
    { variantId: "c", reaction: "dislike" },
    { variantId: "d", reaction: "dislike" }
  ]);
  const finallyLiked = turn("turn_3", [
    { variantId: "a", reaction: "skip" },
    { variantId: "b", reaction: "skip" },
    { variantId: "c", reaction: "like" },
    { variantId: "d", reaction: "skip" }
  ]);
  const result = decide([rejectedOnce, rejectedTwice, finallyLiked]);

  assert.equal(result.decisionPreview?.mode, "refine");
  assert.equal(result.decisionPreview?.nextOutputCount, 9);
  assert.match(result.feedbackSteps[0].question, /What finally worked here/);
}

{
  const edited = turn("turn_1", [
    {
      variantId: "b",
      reaction: "like",
      freeText: "Remove the text and make the background warmer."
    }
  ]);
  const macroMemory = updateMacroMemory([edited]);
  const result = decideNextStep({
    brand: bakeryBrand,
    currentTurn: edited,
    threadTurns: [edited],
    macroMemory,
    userSignals: edited.userSignals
  });

  assert.equal(result.feedbackSteps.length, 0);
  assert.equal(result.decisionPreview?.mode, "edit");
  assert.equal(result.decisionPreview?.nextOutputCount, 4);
}

{
  const first = turn("turn_1", [
    { variantId: "a", reaction: "like" },
    { variantId: "b", reaction: "dislike" },
    { variantId: "c", reaction: "dislike" },
    { variantId: "d", reaction: "dislike" }
  ]);
  const refined = turn("turn_2", [{ variantId: "a", reaction: "dislike" }], 1, [
    variant("a", "Single Warm Refinement", { style: ["warm"], subjects: ["croissant focus"] })
  ]);
  const result = decide([first, refined]);

  assert.equal(result.decisionPreview?.mode, "correct");
  assert.equal(result.decisionPreview?.nextOutputCount, 4);
  assert.match(result.feedbackSteps[0].question, /What changed in the wrong way/);
}

{
  const corrected = turn("turn_3", [{ variantId: "a", reaction: "like" }], 1, [
    variant("a", "Corrected Croissant Direction", { style: ["warm"], subjects: ["croissant focus"] })
  ]);
  const result = decide([corrected]);

  assert.equal(result.decisionPreview?.mode, "refine");
  assert.equal(result.decisionPreview?.nextOutputCount, 9);
  assert.match(result.feedbackSteps[0].question, /Should this become the direction/);
}

{
  const allLiked = turn("turn_1", [
    { variantId: "a", reaction: "like" },
    { variantId: "b", reaction: "like" },
    { variantId: "c", reaction: "like" },
    { variantId: "d", reaction: "like" }
  ]);
  const result = decide([allLiked]);

  assert.match(result.feedbackSteps[0].question, /This board works/);
  assert.equal(result.decisionPreview?.mode, "refine");

  const decision = resolveNextGeneration({
    brand: bakeryBrand,
    currentTurn: allLiked,
    macroMemory: updateMacroMemory([allLiked]),
    feedbackAnswers: [{ stepId: "optimize-liked-set", optionIds: ["specific-revision"], freeText: "make one hero image" }]
  });
  assert.equal(decision.nextOutputCount, 4);
}

{
  const mixed = turn("turn_1", [
    { variantId: "a", reaction: "like" },
    { variantId: "b", reaction: "skip" },
    { variantId: "c", reaction: "skip" },
    { variantId: "d", reaction: "skip" }
  ]);
  const decision = resolveNextGeneration({
    brand: bakeryBrand,
    currentTurn: mixed,
    macroMemory: updateMacroMemory([mixed]),
    feedbackAnswers: [{ stepId: "custom-instruction", freeText: "Make the product larger and remove the text." }]
  });

  assert.equal(decision.mode, "edit");
  assert.equal(decision.nextOutputCount, 4);
}

{
  assert.equal(
    resolveNextGeneration({
      brand: bakeryBrand,
      currentTurn: turn("turn_1", [{ variantId: "a", reaction: "like" }]),
      macroMemory: updateMacroMemory([]),
      feedbackAnswers: [{ stepId: "custom-instruction", freeText: "Better, but the product feels too small." }]
    }).mode,
    "edit"
  );
}

{
  const edited = {
    ...turn("turn_1", [{ variantId: "a", reaction: "like" }], 1, [variant("a", "Edited product hero")]),
    decision: {
      mode: "edit" as const,
      nextOutputCount: 4 as const,
      promptIntent: "Remove text and warm the background.",
      memoryUpdate: "Direct edit."
    }
  };
  const likedEdit = turn("turn_2", [{ variantId: "a", reaction: "like" }], 1, [
    variant("a", "Improved product focus")
  ]);
  const result = decide([edited, likedEdit]);

  assert.match(result.feedbackSteps[0].question, /Use this as a reference/);
  assert(result.feedbackSteps[0].options?.some((option) => option.id === "save-reference"));
}

{
  const conflicting = turn("turn_1", [
    { variantId: "b", reaction: "like" },
    { variantId: "c", reaction: "skip" },
    { variantId: "a", reaction: "skip" },
    { variantId: "d", reaction: "like" }
  ]);
  const result = decide([conflicting]);

  assert.match(result.feedbackSteps[0].question, /different directions/);
  assert.equal(result.decisionPreview?.mode, "split");
  assert(result.feedbackSteps[0].options?.some((option) => option.id === "combine"));
}

{
  const splitChoice = {
    ...turn("turn_1", [
      { variantId: "b", reaction: "like" },
      { variantId: "d", reaction: "like" }
    ]),
    decision: {
      mode: "split" as const,
      nextOutputCount: 9 as const,
      promptIntent: "Explore both directions.",
      memoryUpdate: "Split directions."
    }
  };
  const splitResult = turn("turn_2", [
    { variantId: "a", reaction: "dislike" },
    { variantId: "b", reaction: "like" },
    { variantId: "c", reaction: "skip" },
    { variantId: "d", reaction: "skip" }
  ]);
  const result = decide([splitChoice, splitResult]);

  assert.match(result.feedbackSteps[0].question, /retire the weaker path/);
  assert.equal(result.decisionPreview?.mode, "combine");
  assert.equal(result.decisionPreview?.nextOutputCount, 9);
}

{
  const skipped = turn("turn_1", [{ variantId: "turn", reaction: "skip" }]);
  const result = decide([skipped]);

  assert.match(result.feedbackSteps[0].question, /Not seeing a strong direction/);
  assert.equal(result.decisionPreview?.nextOutputCount, 9);
}

{
  const skipped = turn("turn_1", [
    { variantId: "a", reaction: "skip" },
    { variantId: "b", reaction: "skip" },
    { variantId: "c", reaction: "skip" },
    { variantId: "d", reaction: "skip" }
  ]);
  const tentative = turn("turn_2", [
    { variantId: "a", reaction: "skip" },
    { variantId: "b", reaction: "like" },
    { variantId: "c", reaction: "skip" },
    { variantId: "d", reaction: "skip" }
  ]);
  const result = decide([skipped, tentative]);

  assert.match(result.feedbackSteps[0].question, /What feels closest/);
  assert.equal(result.decisionPreview?.nextOutputCount, 9);
}

{
  const skipped = turn("turn_1", [
    { variantId: "a", reaction: "skip" },
    { variantId: "b", reaction: "skip" },
    { variantId: "c", reaction: "skip" },
    { variantId: "d", reaction: "skip" }
  ]);
  const tentative = turn("turn_2", [
    { variantId: "a", reaction: "skip" },
    { variantId: "b", reaction: "like" },
    { variantId: "c", reaction: "skip" },
    { variantId: "d", reaction: "skip" }
  ]);
  const clear = turn("turn_3", [
    { variantId: "a", reaction: "like" },
    { variantId: "b", reaction: "skip" },
    { variantId: "c", reaction: "skip" },
    { variantId: "d", reaction: "skip" }
  ]);
  const result = decide([skipped, tentative, clear]);

  assert.match(result.feedbackSteps[0].question, /What should we preserve/);
  assert.equal(result.decisionPreview?.nextOutputCount, 4);
}

{
  const rejected = turn("turn_1", [
    { variantId: "a", reaction: "dislike" },
    { variantId: "b", reaction: "dislike" },
    { variantId: "c", reaction: "dislike" },
    { variantId: "d", reaction: "dislike" }
  ]);
  const macroMemory = updateMacroMemory([rejected]);
  const result = decideNextStep({
    brand: null,
    currentTurn: rejected,
    threadTurns: [rejected],
    macroMemory,
    userSignals: rejected.userSignals
  });

  assert.match(result.feedbackSteps[0].question, /What do you think we got wrong/);
}

{
  const rejected = turn("turn_1", [
    { variantId: "a", reaction: "dislike" },
    { variantId: "b", reaction: "dislike" },
    { variantId: "c", reaction: "dislike" },
    { variantId: "d", reaction: "dislike" }
  ]);
  const decision = resolveNextGeneration({
    brand: null,
    currentTurn: rejected,
    macroMemory: updateMacroMemory([rejected]),
    feedbackAnswers: [
      { stepId: "all-missed", optionIds: ["broad"], freeText: "Selected reasons: too broad" },
      { stepId: "custom-instruction", freeText: "The lifestyle direction feels too vague and not specific enough." }
    ]
  });

  assert.equal(decision.mode, "explore");
  assert.equal(decision.nextOutputCount, 9);
}

console.log("feedback scenario tests passed");
