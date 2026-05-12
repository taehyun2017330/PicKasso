import type { ImageVariant, TraceStatus } from "@/lib/types";
import { describePromptForUser } from "@/lib/ai/promptOrchestrator";
import { inferVariantMetadata } from "@/lib/feedback/dynamicChips";
import type { BrandProfile } from "@/lib/feedback/types";
import { createId, findVariantWithNode, nowIso } from "@/lib/utils";
import type { TraceSet, TraceStore } from "@/store/traceStore.types";
import { cacheImageSource } from "@/lib/imageCache";

function orderVariantsByDisplaySlot(variants: ImageVariant[]) {
  return [...variants].sort((a, b) => {
    const aHasOrder = typeof a.displayOrder === "number";
    const bHasOrder = typeof b.displayOrder === "number";
    if (aHasOrder && bHasOrder) return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    if (aHasOrder) return -1;
    if (bHasOrder) return 1;
    return 0;
  });
}

type NodeLifecycleActions = Pick<
  TraceStore,
  | "setNodePlan"
  | "setNodeStatus"
  | "setVariantStatus"
  | "hydrateVariantSources"
  | "completeVariant"
  | "cancelNode"
  | "retryNode"
  | "retryVariant"
  | "skipTurn"
  | "setTurnDecision"
>;

export function createNodeLifecycleActions(set: TraceSet): NodeLifecycleActions {
  return {
    setNodePlan: (nodeId, plan) => {
      set((state) => {
        const node = state.nodes[nodeId];
        if (!node) return state;
        const outputCount = node.outputCount ?? 9;
        const thread = state.threads.find((item) => item.id === node.threadId) ?? null;
        const brand = thread ? state.brands.find((item) => item.id === thread.brandId) ?? null : null;
        const brandProfile: BrandProfile | null = brand
          ? {
              id: brand.id,
              name: brand.name,
              category: brand.category,
              goal: brand.goal,
              audience: brand.targetAudience
            }
          : null;
        const variants: ImageVariant[] = plan.directions.slice(0, outputCount).map((direction) => ({
          id: createId("variant"),
          nodeId,
          src: "",
          prompt: direction.prompt,
          styleLabel: direction.label,
          metadata: {
            ...inferVariantMetadata({
              label: direction.label,
              prompt: direction.prompt,
              brand: brandProfile
            }),
            visualSummary: direction.description || describePromptForUser(direction.prompt, direction.label)
          },
          status: "queued"
        }));

        return {
          nodes: {
            ...state.nodes,
            [nodeId]: {
              ...node,
              title: plan.nodeTitle,
              plannerSummary: `${plan.strategy} ${plan.traceSummary}`,
              generatedPrompts: plan.directions.map((direction) => direction.prompt),
              variants,
              updatedAt: nowIso()
            }
          }
        };
      });
    },

    setNodeStatus: (nodeId, status, error) => {
      set((state) => {
        const node = state.nodes[nodeId];
        if (!node) return state;

        return {
          nodes: {
            ...state.nodes,
            [nodeId]: {
              ...node,
              status,
              error,
              updatedAt: nowIso()
            }
          }
        };
      });
    },

    setVariantStatus: (variantId, status, error) => {
      set((state) => {
        const found = findVariantWithNode(state.nodes, variantId);
        if (!found) return state;
        const { node } = found;
        const variants = node.variants.map((variant) =>
          variant.id === variantId ? { ...variant, status, error } : variant
        );

        return {
          nodes: {
            ...state.nodes,
            [node.id]: {
              ...node,
              variants,
              status: status === "error" ? "error" : node.status,
              error: status === "error" ? error : node.error,
              updatedAt: nowIso()
            }
          }
        };
      });
    },

    hydrateVariantSources: (sources) => {
      if (!Object.keys(sources).length) return;

      set((state) => {
        const nodes = Object.fromEntries(
          Object.entries(state.nodes).map(([nodeId, node]) => [
            nodeId,
            {
              ...node,
              variants: node.variants.map((variant) => {
                const src = sources[variant.id];
                return src ? { ...variant, src } : variant;
              })
            }
          ])
        );

        return { nodes };
      });
    },

    completeVariant: (variantId, src, prompt, styleLabel) => {
      void cacheImageSource(variantId, src).catch(() => undefined);

      set((state) => {
        const found = findVariantWithNode(state.nodes, variantId);
        if (!found) return state;
        const { node } = found;
        const completedAt = nowIso();
        const nextDisplayOrder =
          Math.max(-1, ...node.variants.map((variant) => variant.displayOrder ?? -1)) + 1;
        const variants = orderVariantsByDisplaySlot(node.variants.map((variant) =>
          variant.id === variantId
            ? {
                ...variant,
                src,
                prompt,
                styleLabel,
                displayOrder: variant.displayOrder ?? nextDisplayOrder,
                completedAt,
                status: "done" as TraceStatus,
                error: undefined
              }
            : variant
        ));
        const allComplete = variants.length > 0 && variants.every((variant) => variant.status === "done");

        return {
          nodes: {
            ...state.nodes,
            [node.id]: {
              ...node,
              variants,
              status: allComplete ? "done" : node.status,
              updatedAt: nowIso()
            }
          }
        };
      });
    },

    cancelNode: (nodeId) => {
      set((state) => {
        const node = state.nodes[nodeId];
        if (!node) return state;
        const variants = node.variants.map((variant) =>
          variant.status === "done" ? variant : { ...variant, status: "cancelled" as TraceStatus }
        );
        const jobs = Object.fromEntries(
          Object.entries(state.jobs).map(([id, job]) => [
            id,
            job.nodeId === nodeId && job.status !== "done"
              ? { ...job, status: "cancelled" as TraceStatus, progress: job.progress, updatedAt: nowIso() }
              : job
          ])
        );

        return {
          nodes: {
            ...state.nodes,
            [nodeId]: {
              ...node,
              status: "cancelled",
              variants,
              updatedAt: nowIso()
            }
          },
          jobs
        };
      });
    },

    retryNode: (nodeId) => {
      set((state) => {
        const node = state.nodes[nodeId];
        if (!node) return state;
        const jobs = Object.fromEntries(Object.entries(state.jobs).filter(([, job]) => job.nodeId !== nodeId));

        return {
          nodes: {
            ...state.nodes,
            [nodeId]: {
              ...node,
              status: "queued",
              error: undefined,
              plannerSummary: "",
              generatedPrompts: [],
              variants: [],
              attempt: node.attempt + 1,
              decision: undefined,
              feedbackAnswers: undefined,
              turnSkipped: undefined,
              turnFreeText: undefined,
              updatedAt: nowIso()
            }
          },
          jobs
        };
      });
    },

    retryVariant: (variantId) => {
      set((state) => {
        const found = findVariantWithNode(state.nodes, variantId);
        if (!found) return state;

        const { node } = found;
        const jobs = Object.fromEntries(
          Object.entries(state.jobs).filter(([, job]) => job.nodeId !== node.id || job.variantId !== variantId)
        );
        const variants = node.variants.map((variant) =>
          variant.id === variantId
            ? {
                ...variant,
                src: "",
                status: "queued" as TraceStatus,
                error: undefined,
                completedAt: undefined,
                feedback: undefined
              }
            : variant
        );

        return {
          selectedVariantIds: state.selectedVariantIds.filter((id) => id !== variantId),
          nodes: {
            ...state.nodes,
            [node.id]: {
              ...node,
              status: "queued" as TraceStatus,
              error: undefined,
              variants,
              attempt: node.attempt + 1,
              updatedAt: nowIso()
            }
          },
          jobs
        };
      });
    },

    skipTurn: (nodeId, freeText = "") => {
      set((state) => {
        const node = state.nodes[nodeId];
        if (!node) return state;

        return {
          nodes: {
            ...state.nodes,
            [nodeId]: {
              ...node,
              turnSkipped: true,
              turnFreeText: freeText,
              updatedAt: nowIso()
            }
          }
        };
      });
    },

    setTurnDecision: (nodeId, decision, answers) => {
      set((state) => {
        const node = state.nodes[nodeId];
        if (!node) return state;

        return {
          nodes: {
            ...state.nodes,
            [nodeId]: {
              ...node,
              decision,
              feedbackAnswers: answers,
              updatedAt: nowIso()
            }
          }
        };
      });
    }
  };
}
