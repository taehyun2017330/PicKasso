import { findVariantWithNode, nowIso } from "@/lib/utils";
import type { TraceGet, TraceSet, TraceStore } from "@/store/traceStore.types";

type SelectionFeedbackActions = Pick<
  TraceStore,
  "addFeedback" | "toggleReferenceVariant" | "clearSelectedVariants"
>;

export function createSelectionFeedbackActions(set: TraceSet, get: TraceGet): SelectionFeedbackActions {
  return {
    addFeedback: (variantId, feedback) => {
      set((state) => {
        const found = findVariantWithNode(state.nodes, variantId);
        if (!found) return state;
        const { node } = found;
        const variants = node.variants.map((variant) =>
          variant.id === variantId
            ? {
                ...variant,
                feedback: {
                  ...feedback,
                  createdAt: nowIso()
                }
              }
            : variant
        );

        return {
          nodes: {
            ...state.nodes,
            [node.id]: {
              ...node,
              variants,
              updatedAt: nowIso()
            }
          }
        };
      });
    },

    toggleReferenceVariant: (variantId) => {
      const state = get();
      const selected = state.selectedVariantIds;
      const found = findVariantWithNode(state.nodes, variantId);
      const variant = found?.variant;
      const variantLoading = variant?.status === "queued" || variant?.status === "running";
      if (!variant || variantLoading || variant.status === "cancelled" || !variant.src) return;

      if (selected.includes(variantId)) {
        set({ selectedVariantIds: selected.filter((id) => id !== variantId) });
        return;
      }

      if (selected.length >= 9) {
        state.addToast("Use up to 9 images in a direction");
        return;
      }

      set({ selectedVariantIds: [...selected, variantId] });
    },

    clearSelectedVariants: () => set({ selectedVariantIds: [] })
  };
}
