import type { Brand, ExplorationThread, ImageVariant, TraceMemory, TraceNode } from "@/lib/types";
import { compactText } from "@/lib/utils";

interface TraceMemoryInput {
  brand: Brand | null;
  thread: ExplorationThread | null;
  nodes: TraceNode[];
  selectedVariants?: ImageVariant[];
  currentNode?: TraceNode | null;
}

/**
 * Returns the ancestor nodes on the path from the root to (but excluding)
 * `currentNode`, ordered root-first so that recency slicing keeps the
 * signals closest to the current node. Falls back to all thread nodes when
 * there is no current node or it has no parents (e.g. first generation),
 * which preserves the original whole-thread behaviour for those cases.
 */
function ancestorPathNodes(
  currentNode: TraceNode | null | undefined,
  allNodes: TraceNode[]
): TraceNode[] {
  if (!currentNode || currentNode.parentNodeIds.length === 0) return allNodes;

  const byId = new Map(allNodes.map((node) => [node.id, node]));
  const collected: TraceNode[] = [];
  const seen = new Set<string>();
  let frontier = [...currentNode.parentNodeIds];

  // Walk up the DAG: nearest ancestors first, then their parents.
  while (frontier.length) {
    const next: string[] = [];
    for (const id of frontier) {
      if (seen.has(id)) continue;
      seen.add(id);
      const node = byId.get(id);
      if (!node) continue;
      collected.push(node);
      next.push(...node.parentNodeIds);
    }
    frontier = next;
  }

  if (collected.length === 0) return allNodes;
  // collected is nearest-first; reverse so the closest ancestor lands last
  // and survives the trailing `slice(-N)` recency window.
  return collected.reverse();
}

export function summarizeTraceMemory({
  brand,
  thread,
  nodes,
  selectedVariants = [],
  currentNode = null
}: TraceMemoryInput): TraceMemory {
  const warmSignals: string[] = [];
  const coldSignals: string[] = [];
  const customSteers: string[] = [];
  const promptHistory: string[] = [];

  // Signal memory is scoped to the path the user actually walked to reach
  // this node. Branches the user explored and abandoned no longer leak their
  // likes/dislikes into an unrelated refinement.
  const pathNodes = ancestorPathNodes(currentNode, nodes);

  for (const node of pathNodes) {
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

  // Structural ancestry counts stay thread-wide: they describe the shape of
  // the whole exploration, not what to preserve or avoid.
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
