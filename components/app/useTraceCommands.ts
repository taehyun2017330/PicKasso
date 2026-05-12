"use client";

import type { BrandInput, ImageVariant, TraceMode, TraceNode } from "@/lib/types";
import type { FeedbackAnswer, NextGenerationDecision } from "@/lib/feedback/types";
import { findVariantWithNode } from "@/lib/utils";
import type { TraceStore } from "@/store/traceStore.types";

interface TraceCommandInput {
  nodes: Record<string, TraceNode>;
  selectedVariantIds: string[];
  actions: Pick<
    TraceStore,
    | "createBrand"
    | "startThread"
    | "createChildNode"
    | "setTurnDecision"
    | "addToast"
    | "clearSelectedVariants"
    | "clearDemo"
  >;
  onCloseOverlays: () => void;
}

export function useTraceCommands({ nodes, selectedVariantIds, actions, onCloseOverlays }: TraceCommandInput) {
  function startThread(brandId: string) {
    actions.startThread(brandId, "");
    onCloseOverlays();
  }

  function createBrand(input: BrandInput) {
    return actions.createBrand(input);
  }

  function handleFork(variant: ImageVariant) {
    const found = findVariantWithNode(nodes, variant.id);
    if (!found) return;
    actions.createChildNode({
      threadId: found.node.threadId,
      parentNodeIds: [found.node.id],
      parentVariantIds: [variant.id],
      mode: "narrow",
      userPrompt: `Explore the warmer direction from ${variant.styleLabel}.`
    });
  }

  function handleRegenerate(node: TraceNode, mode: Exclude<TraceMode, "root">, prompt: string) {
    const likedVariantIds = node.variants
      .filter((variant) => variant.feedback?.rating === "like")
      .map((variant) => variant.id);
    actions.createChildNode({
      threadId: node.threadId,
      parentNodeIds: [node.id],
      parentVariantIds: mode === "narrow" ? likedVariantIds : node.parentVariantIds,
      mode,
      userPrompt: prompt
    });
  }

  function modeForDecision(decision: NextGenerationDecision): Exclude<TraceMode, "root"> {
    if (decision.mode === "combine") return "converge";
    if (decision.mode === "regenerate") return "regenerate";
    if (decision.mode === "explore" || decision.mode === "split" || decision.mode === "revise-goal") return "wide";
    if (decision.mode === "edit" || decision.mode === "correct") return "custom";
    return "narrow";
  }

  function handleDecision(node: TraceNode, decision: NextGenerationDecision, answers: FeedbackAnswer[]) {
    actions.setTurnDecision(node.id, decision, answers);

    if (decision.mode === "save-direction") {
      actions.addToast("Direction saved for future generations");
      return;
    }

    const selectedFromNode = selectedVariantIds.filter((variantId) =>
      node.variants.some((variant) => variant.id === variantId)
    );
    const likedVariantIds = node.variants
      .filter((variant) => variant.feedback?.rating === "like")
      .map((variant) => variant.id);
    const parentVariantIds =
      decision.mode === "regenerate"
        ? node.variants.map((variant) => variant.id)
        : selectedFromNode.length
          ? selectedFromNode
          : likedVariantIds.length
            ? likedVariantIds
            : node.parentVariantIds;

    actions.createChildNode({
      threadId: node.threadId,
      parentNodeIds: [node.id],
      parentVariantIds,
      mode: modeForDecision(decision),
      userPrompt: decision.promptIntent,
      outputCount: decision.nextOutputCount
    });
    actions.clearSelectedVariants();
  }

  function handleForkSelected() {
    const selected = selectedVariantIds
      .map((variantId) => findVariantWithNode(nodes, variantId))
      .filter((entry): entry is NonNullable<ReturnType<typeof findVariantWithNode>> => Boolean(entry));

    if (selected.length !== 1) {
      actions.addToast("Select one image to fork");
      return;
    }

    handleFork(selected[0].variant);
  }

  function handleCombineSelected() {
    if (selectedVariantIds.length < 2) {
      actions.addToast("Select 2-9 images to combine");
      return;
    }

    handleConverge("");
  }

  function handleConverge(instruction: string) {
    const selected = selectedVariantIds
      .map((variantId) => findVariantWithNode(nodes, variantId))
      .filter((entry): entry is NonNullable<ReturnType<typeof findVariantWithNode>> => Boolean(entry));

    if (selected.length < 2) {
      actions.addToast("Select at least 2 variants");
      return;
    }

    const threadId = selected[0].node.threadId;
    const sameThread = selected.filter((entry) => entry.node.threadId === threadId).slice(0, 9);
    if (sameThread.length < selected.length) {
      actions.addToast("Converging the first thread selection");
    }

    actions.createChildNode({
      threadId,
      parentNodeIds: Array.from(new Set(sameThread.map((entry) => entry.node.id))),
      parentVariantIds: sameThread.map((entry) => entry.variant.id),
      mode: "converge",
      userPrompt: instruction || "Combine what works from these references."
    });
    actions.clearSelectedVariants();
  }

  function handleClearDemo() {
    actions.clearDemo();
    onCloseOverlays();
  }

  return {
    startThread,
    createBrand,
    handleFork,
    handleRegenerate,
    handleForkSelected,
    handleCombineSelected,
    handleConverge,
    handleDecision,
    handleClearDemo
  };
}
