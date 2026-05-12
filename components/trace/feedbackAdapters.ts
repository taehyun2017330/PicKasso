import type {
  BrandProfile,
  GenerationTurn as FeedbackGenerationTurn,
  ImageVariant as FeedbackImageVariant,
  UserSignal
} from "@/lib/feedback/types";
import { inferVariantMetadata } from "@/lib/feedback/dynamicChips";
import type { Brand, ImageVariant, TraceNode } from "@/lib/types";

export function toBrandProfile(brand: Brand | null): BrandProfile | null {
  if (!brand) return null;

  return {
    id: brand.id,
    name: brand.name,
    category: brand.category,
    goal: brand.goal,
    audience: brand.targetAudience
  };
}

export function toFeedbackVariant(
  variant: ImageVariant,
  brand: BrandProfile | null,
  index: number
): FeedbackImageVariant {
  return {
    id: variant.id,
    label: `Image ${index + 1}`,
    src: variant.src,
    prompt: variant.prompt,
    metadata:
      variant.metadata ??
      inferVariantMetadata({
        label: variant.styleLabel,
        prompt: variant.prompt,
        brand
      })
  };
}

export function toFeedbackTurn(
  node: TraceNode,
  threadNodes: TraceNode[],
  brand: BrandProfile | null
): FeedbackGenerationTurn {
  return {
    id: node.id,
    threadId: node.threadId,
    turnIndex: threadNodes.filter((item) => item.mode !== "root" && item.createdAt <= node.createdAt).length,
    outputCount: node.outputCount ?? (node.variants.length === 1 ? 1 : node.variants.length === 4 ? 4 : 9),
    variants: node.variants.map((variant, index) => toFeedbackVariant(variant, brand, index)),
    userSignals: signalsFromNode(node),
    feedbackSteps: [],
    decision: node.decision
  };
}

export function toFeedbackTurns(nodes: TraceNode[], brand: BrandProfile | null) {
  return nodes
    .filter((node) => node.mode !== "root")
    .sort((a, b) => a.depth - b.depth || a.createdAt.localeCompare(b.createdAt))
    .map((node) => toFeedbackTurn(node, nodes, brand));
}

function signalsFromNode(node: TraceNode): UserSignal[] {
  const variantSignals = node.variants
    .filter((variant) => Boolean(variant.feedback))
    .map((variant): UserSignal => ({
      variantId: variant.id,
      reaction: variant.feedback?.rating ?? "skip",
      freeText: variant.feedback?.note,
      selectedReasons: variant.feedback?.reasonChips
    }));

  if (!node.turnSkipped) return variantSignals;

  return [
    ...variantSignals,
    {
      variantId: `${node.id}:turn-skip`,
      reaction: "skip",
      freeText: node.turnFreeText,
      selectedReasons: []
    }
  ];
}
