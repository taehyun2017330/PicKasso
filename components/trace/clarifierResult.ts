import type { FeedbackAnswer, FeedbackOption, NextGenerationDecision } from "@/lib/feedback/types";
import type { ImageVariant, TraceNode } from "@/lib/types";
import type { ClarifierMode } from "@/components/trace/modes";
import { cellLabel } from "@/components/trace/nodeHelpers";

export function toggleOption(values: string[], value: string, max?: number) {
  if (values.includes(value)) return values.filter((item) => item !== value);
  if (max && values.length >= max) return values;
  return [...values, value];
}

export function labelsFor(options: FeedbackOption[], ids: string[]) {
  return options.filter((option) => ids.includes(option.id)).map((option) => option.label);
}

export function labelForVariant(node: TraceNode, variant: ImageVariant) {
  const index = node.variants.findIndex((item) => item.id === variant.id);
  return index >= 0 ? cellLabel(index) : "Image";
}

export function buildClarifierResult(input: {
  mode: ClarifierMode;
  node: TraceNode;
  selectedVariants: ImageVariant[];
  traitOptions: FeedbackOption[];
  directionOptions: FeedbackOption[];
  likedIds: string[];
  leanIds: string[];
  note: string;
}) {
  const likedLabels = labelsFor(input.traitOptions, input.likedIds);
  const leanLabels = labelsFor(input.directionOptions, input.leanIds);
  const selectedCells = input.selectedVariants.map((variant) => labelForVariant(input.node, variant)).join(", ");
  const selectedSubject = input.selectedVariants.length > 1
    ? `selected images ${selectedCells}`
    : `selected image ${selectedCells}`;
  const noteText = input.note.trim();
  const promptIntent = intentFor({ ...input, likedLabels, leanLabels, selectedCells, selectedSubject, noteText });

  return {
    likedLabels,
    noteText,
    answers: answersFor(input.mode, input.likedIds, input.leanIds, likedLabels, leanLabels, noteText),
    decision: decisionFor(input.mode, promptIntent)
  };
}

function intentFor(input: {
  mode: ClarifierMode;
  likedLabels: string[];
  leanLabels: string[];
  selectedCells: string;
  selectedSubject: string;
  noteText: string;
}) {
  if (input.mode === "edit") {
    return [
      `Edit ${input.selectedSubject}.`,
      input.likedLabels.length ? `Preserve: ${input.likedLabels.join(", ")}.` : null,
      input.leanLabels.length ? `Change: ${input.leanLabels.join(", ")}.` : null,
      input.noteText ? `Specific edit: ${input.noteText}.` : null
    ]
      .filter(Boolean)
      .join(" ");
  }

  return [
    `Create a new nine-image exploration board from selected cells ${input.selectedCells}.`,
    input.likedLabels.length ? `User likes: ${input.likedLabels.join(", ")}.` : null,
    input.leanLabels.length ? `Next board should lean into: ${input.leanLabels.join(", ")}.` : null,
    input.noteText ? `Additional steer: ${input.noteText}.` : null
  ]
    .filter(Boolean)
    .join(" ");
}

function answersFor(
  mode: ClarifierMode,
  likedIds: string[],
  leanIds: string[],
  likedLabels: string[],
  leanLabels: string[],
  noteText: string
): FeedbackAnswer[] {
  return [
    {
      stepId: mode === "edit" ? "preserve-traits" : "liked-traits",
      optionIds: likedIds,
      freeText: likedLabels.join(", ")
    },
    {
      stepId: mode === "edit" ? "edit-intent" : "next-lean",
      optionIds: leanIds,
      freeText: leanLabels.join(", ")
    },
    ...(noteText ? [{ stepId: "freeform-steer", freeText: noteText }] : [])
  ];
}

function decisionFor(mode: ClarifierMode, promptIntent: string): NextGenerationDecision {
  return {
    mode: mode === "edit" ? "edit" : "explore",
    nextOutputCount: mode === "edit" ? 4 : 9,
    promptIntent,
    memoryUpdate: promptIntent
  };
}
