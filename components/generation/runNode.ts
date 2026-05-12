import { summarizeTraceMemory } from "@/lib/ai/traceMemory";
import { resolveImagePromptSituation } from "@/lib/ai/promptOrchestrator";
import type { ImageVariant, RuntimeConfig } from "@/lib/types";
import { compactText, findVariant } from "@/lib/utils";
import { runVariant } from "@/components/generation/runVariant";
import { ensureTask, cancelHandles, isNodeStopped } from "@/components/generation/taskRegistry";
import type { NodeTaskMapRef } from "@/components/generation/types";
import { useTraceStore } from "@/store/useTraceStore";

function compactPlanningVariant(variant: ImageVariant): ImageVariant {
  return {
    ...variant,
    src: "",
    prompt: compactText(variant.prompt, 700),
    error: undefined
  };
}

export async function runNode(
  nodeId: string,
  attempt: number,
  config: RuntimeConfig,
  tasks: NodeTaskMapRef
) {
  const store = useTraceStore.getState();
  const task = ensureTask(nodeId, tasks);

  try {
    let state = useTraceStore.getState();
    let node = state.nodes[nodeId];
    if (!node || node.attempt !== attempt || isNodeStopped(node)) return;

    if (!node.variants.length) {
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
        selectedVariants: planningVariants
      });

      const response = await fetch("/api/trace/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          traceMemory,
          actionMode: node.mode,
          selectedVariants: planningVariants,
          userPrompt: node.userPrompt,
          seed: `${node.id}:${node.attempt}`,
          nodeDepth: node.depth,
          outputCount: node.outputCount ?? 4,
          runtimeConfig: config
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Planner request failed.");
      }

      const plan = await response.json();
      state = useTraceStore.getState();
      node = state.nodes[nodeId];
      if (!node || node.attempt !== attempt || isNodeStopped(node)) return;
      store.setNodePlan(nodeId, plan);
    }

    state = useTraceStore.getState();
    node = state.nodes[nodeId];
    if (!node || node.attempt !== attempt || isNodeStopped(node)) return;
    store.setNodeStatus(nodeId, "running");

    const thread = state.threads.find((item) => item.id === node.threadId) ?? null;
    const brand = thread ? state.brands.find((item) => item.id === thread.brandId) ?? null : null;
    const referenceIds = node.parentVariantIds;
    const references = referenceIds
      .map((variantId) => findVariant(state.nodes, variantId))
      .filter((variant): variant is ImageVariant => Boolean(variant?.src));

    const variants = useTraceStore.getState().nodes[nodeId]?.variants.filter((variant) => variant.status !== "done") ?? [];
    const promptSituation = resolveImagePromptSituation({
      mode: node.mode,
      outputCount: node.outputCount,
      depth: node.depth,
      parentVariantCount: node.parentVariantIds.length,
      activeVariantCount: variants.length,
      hasExistingVariants: node.variants.length > 0,
      attempt: node.attempt
    });

    variants.forEach((variant, index) => {
      runVariant({
        nodeId,
        attempt,
        variantId: variant.id,
        label: variant.styleLabel,
        prompt: variant.prompt,
        category: brand?.category || "open visual exploration",
        brand,
        references,
        promptSituation,
        index,
        config,
        task
      });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed.";
    const latest = useTraceStore.getState().nodes[nodeId];
    if (!latest || latest.attempt !== attempt || latest.status === "cancelled") return;
    useTraceStore.getState().setNodeStatus(nodeId, "error", message);
    useTraceStore.getState().addToast(message);
    cancelHandles(nodeId, tasks.current);
  }
}
