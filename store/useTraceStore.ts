"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createBrandThreadActions } from "@/store/actions/brandThreadActions";
import { createJobToastActions } from "@/store/actions/jobToastActions";
import { createNodeLifecycleActions } from "@/store/actions/nodeLifecycleActions";
import { createSelectionFeedbackActions } from "@/store/actions/selectionFeedbackActions";
import { initialTraceData } from "@/store/traceStore.initial";
import type { TraceStore, TraceStoreData } from "@/store/traceStore.types";
import type { TraceNode, TraceStatus } from "@/lib/types";

export const TRACE_PERSIST_KEY = "pickasso-trace-v1";

// A reload interrupts any in-flight generation. Non-terminal statuses are
// downgraded to "error" so the trace stays intact and the node/variant is
// retryable instead of showing a permanently stuck spinner. "done" variants
// keep their status; their base64 src is restored separately from the
// IndexedDB image cache by useHydrateImageCache.
function settleStatus(status: TraceStatus | undefined): TraceStatus | undefined {
  return status === "queued" || status === "running" ? "error" : status;
}

function sanitizeRehydratedNodes(nodes: Record<string, TraceNode>): Record<string, TraceNode> {
  const next: Record<string, TraceNode> = {};
  for (const [id, node] of Object.entries(nodes)) {
    const interrupted = node.status === "queued" || node.status === "running";
    next[id] = {
      ...node,
      status: settleStatus(node.status) ?? node.status,
      error: interrupted ? node.error ?? "Interrupted by reload — retry to continue." : node.error,
      variants: node.variants.map((variant) => ({
        ...variant,
        status: settleStatus(variant.status) ?? variant.status
      }))
    };
  }
  return next;
}

export const useTraceStore = create<TraceStore>()(
  persist(
    (set, get) => ({
      ...initialTraceData,
      ...createBrandThreadActions(set, get),
      ...createNodeLifecycleActions(set),
      ...createSelectionFeedbackActions(set, get),
      ...createJobToastActions(set)
    }),
    {
      name: TRACE_PERSIST_KEY,
      version: 1,
      // Manual rehydration (triggered on client mount) keeps the server and
      // first client render identical, avoiding a Next.js hydration mismatch.
      skipHydration: true,
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : // No-op storage on the server; rehydrate never runs there.
            {
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined
            }
      ),
      // Persist structure only. Image src lives in the IndexedDB image cache,
      // so it is stripped here to keep the snapshot small and quota-safe.
      // jobs/toasts/selection are transient runtime state and are dropped.
      partialize: (state): Partial<TraceStoreData> => ({
        brands: state.brands,
        threads: state.threads,
        activeThreadId: state.activeThreadId,
        nodes: Object.fromEntries(
          Object.entries(state.nodes).map(([id, node]) => [
            id,
            {
              ...node,
              variants: node.variants.map((variant) => ({ ...variant, src: "" }))
            }
          ])
        )
      }),
      merge: (persisted, current) => {
        const data = (persisted ?? {}) as Partial<TraceStoreData>;
        return {
          ...current,
          ...data,
          nodes: data.nodes ? sanitizeRehydratedNodes(data.nodes) : current.nodes
        };
      }
    }
  )
);

/** Clears the persisted trace snapshot (used by clearDemo). */
export function clearPersistedTrace() {
  void useTraceStore.persist.clearStorage();
}
