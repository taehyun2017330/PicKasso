import type { Brand, ExplorationThread, ImageVariant, TraceMemory, TraceNode } from "@/lib/types";
import { compactText } from "@/lib/utils";

interface TraceMemoryInput {
  brand: Brand | null;
  thread: ExplorationThread | null;
  nodes: TraceNode[];
  selectedVariants?: ImageVariant[];
}

export function summarizeTraceMemory({
  brand,
  thread,
  nodes,
  selectedVariants = []
}: TraceMemoryInput): TraceMemory {
  const warmSignals: string[] = [];
  const coldSignals: string[] = [];
  const customSteers: string[] = [];
  const promptHistory: string[] = [];

  for (const node of nodes) {
    if (node.userPrompt) customSteers.push(compactText(node.userPrompt, 90));
    for (const prompt of node.generatedPrompts) promptHistory.push(compactText(prompt, 96));
    for (const variant of node.variants) {
      if (!variant.feedback) continue;
      const signal = [
        variant.styleLabel,
        variant.feedback.reasonChips.join(", "),
        variant.feedback.note
      ]
        .filter(Boolean)
        .join(": ");

      if (variant.feedback.rating === "like") warmSignals.push(compactText(signal, 90));
      if (variant.feedback.rating === "dislike") coldSignals.push(compactText(signal, 90));
    }
  }

  const depth = nodes.reduce((max, node) => Math.max(max, node.depth), 0);
  const completeNodes = nodes.filter((node) => node.status === "done").length;
  const selectedReferenceSummary = selectedVariants
    .map((variant) => `${variant.styleLabel} (${compactText(variant.prompt, 72)})`)
    .join("; ");

  return {
    brandSummary: brand
      ? `${brand.name}: ${brand.category}; goal ${brand.goal}; audience ${brand.targetAudience}`
      : null,
    warmSignals: warmSignals.slice(-10),
    coldSignals: coldSignals.slice(-10),
    customSteers: customSteers.slice(-8),
    promptHistory: promptHistory.slice(-12),
    ancestrySummary: thread
      ? `${thread.title}: ${nodes.length} nodes, ${completeNodes} complete, deepest generation ${depth}.`
      : "New trace.",
    selectedReferenceSummary: selectedReferenceSummary || "No selected references."
  };
}
