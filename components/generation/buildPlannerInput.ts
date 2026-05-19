import { summarizeTraceMemory } from "@/lib/ai/traceMemory";
import type {
  ImageVariant,
  NextGenerationDecision,
  PlannerInput,
  RuntimeConfig,
  TraceNode
} from "@/lib/types";
import { compactText, findVariant } from "@/lib/utils";
import type { TraceStoreData } from "@/store/traceStore.types";

export function compactPlanningVariant(variant: ImageVariant): ImageVariant {
  return {
    ...variant,
    src: "",
    prompt: compactText(variant.prompt, 700),
    error: undefined
  };
}

/**
 * Builds the exact PlannerInput that runNode sends to /api/trace/plan for a
 * given node. Extracted so both the live generation path and the E2E test
 * bridge construct the planner input identically — the steering tests assert
 * against this without re-implementing (and drifting from) runNode.
 */
export function buildPlannerInput(
  state: Pick<TraceStoreData, "threads" | "brands" | "nodes">,
  node: TraceNode,
  config?: RuntimeConfig
): PlannerInput {
  const thread = state.threads.find((item) => item.id === node.threadId) ?? null;
  const brand = thread ? state.brands.find((item) => item.id === thread.brandId) ?? null : null;
  const threadNodes = Object.values(state.nodes).filter((item) => item.threadId === node.threadId);
  const selectedVariants = node.parentVariantIds
    .map((variantId) => findVariant(state.nodes, variantId))
    .filter((variant): variant is ImageVariant => Boolean(variant));
  const planningVariants = selectedVariants.map(compactPlanningVariant);
  const traceMemory = summarizeTraceMemory({
    brand,
    thread,
    nodes: threadNodes,
    selectedVariants: planningVariants,
    currentNode: node
  });
  const originatingDecision = node.parentNodeIds
    .map((parentId) => state.nodes[parentId]?.decision)
    .find((decision): decision is NextGenerationDecision => Boolean(decision));

  return {
    brand,
    traceMemory,
    actionMode: node.mode,
    selectedVariants: planningVariants,
    userPrompt: node.userPrompt,
    seed: `${node.id}:${node.attempt}`,
    nodeDepth: node.depth,
    outputCount: node.outputCount ?? 4,
    runtimeConfig: config,
    originatingDecision
  };
}
