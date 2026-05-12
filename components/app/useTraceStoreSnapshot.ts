"use client";

import { useShallow } from "zustand/react/shallow";

import { useTraceStore } from "@/store/useTraceStore";

export function useTraceStoreSnapshot() {
  const brands = useTraceStore((state) => state.brands);
  const threads = useTraceStore((state) => state.threads);
  const nodes = useTraceStore((state) => state.nodes);
  const activeThreadId = useTraceStore((state) => state.activeThreadId);
  const selectedVariantIds = useTraceStore((state) => state.selectedVariantIds);
  const toasts = useTraceStore((state) => state.toasts);
  const actions = useTraceStore(
    useShallow((state) => ({
      createBrand: state.createBrand,
      startThread: state.startThread,
      createChildNode: state.createChildNode,
      setActiveThread: state.setActiveThread,
      hydrateVariantSources: state.hydrateVariantSources,
      addFeedback: state.addFeedback,
      toggleReferenceVariant: state.toggleReferenceVariant,
      clearSelectedVariants: state.clearSelectedVariants,
      cancelNode: state.cancelNode,
      retryNode: state.retryNode,
      retryVariant: state.retryVariant,
      skipTurn: state.skipTurn,
      setTurnDecision: state.setTurnDecision,
      clearDemo: state.clearDemo,
      addToast: state.addToast,
      removeToast: state.removeToast
    }))
  );

  return {
    brands,
    threads,
    nodes,
    activeThreadId,
    selectedVariantIds,
    toasts,
    actions
  };
}
