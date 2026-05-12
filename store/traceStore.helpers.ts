import type { Brand, ImageVariant, TraceMode, TraceNode } from "@/lib/types";
import { compactText, createId, nowIso } from "@/lib/utils";

export function newRootNode(threadId: string, brand: Brand): TraceNode {
  const at = nowIso();

  return {
    id: createId("node"),
    threadId,
    title: brand.name,
    parentNodeIds: [],
    parentVariantIds: [],
    depth: 0,
    lane: 0,
    outputCount: 1,
    mode: "root",
    status: "done",
    userPrompt: "",
    plannerSummary: `${brand.category}; ${brand.goal}; for ${brand.targetAudience}`,
    generatedPrompts: [],
    variants: [],
    createdAt: at,
    updatedAt: at,
    attempt: 0
  };
}

export function buildThreadTitle(brand: Brand, userPrompt?: string) {
  if (userPrompt?.trim()) return compactText(userPrompt.trim(), 26);
  return `${brand.name} Directions`;
}

export function getChildren(nodes: Record<string, TraceNode>, parentNodeId: string, threadId: string) {
  return Object.values(nodes).filter(
    (node) => node.threadId === threadId && node.parentNodeIds.includes(parentNodeId)
  );
}

export function nodeTitleForMode(mode: TraceMode, selectedVariant?: ImageVariant | null) {
  if (mode === "narrow") return selectedVariant ? `Fork: ${selectedVariant.styleLabel}` : "Forked Direction";
  if (mode === "converge") return "Combined Direction";
  if (mode === "custom") return "Custom Steer";
  if (mode === "regenerate") return "Regenerated Set";
  if (mode === "wide") return "First Directions";
  return "Trace Root";
}
