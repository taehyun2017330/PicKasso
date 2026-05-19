"use client";

import { useEffect } from "react";

import { buildPlannerInput } from "@/components/generation/buildPlannerInput";
import { resolveOrchestrationRecipe } from "@/lib/ai/promptOrchestrator";
import { useTraceStore } from "@/store/useTraceStore";

/**
 * Test-only window bridge. Renders nothing and attaches the live store plus a
 * few real, pure steering functions to `window.__pickasso` so the Playwright
 * suite can drive the actual app and assert against the same code the app
 * runs. Gated by NEXT_PUBLIC_E2E so it is inert in normal use.
 */
export function E2EBridge() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_E2E !== "1" || typeof window === "undefined") return;

    window.__pickasso = {
      store: useTraceStore,
      reset: () => useTraceStore.getState().clearDemo(),
      // The exact PlannerInput runNode would send for this node, so recipe
      // assertions exercise the real construction path, not a copy of it.
      plannerInputForNode: (nodeId: string) => {
        const state = useTraceStore.getState();
        const node = state.nodes[nodeId];
        return node ? buildPlannerInput(state, node) : null;
      },
      recipeForNode: (nodeId: string) => {
        const state = useTraceStore.getState();
        const node = state.nodes[nodeId];
        return node ? resolveOrchestrationRecipe(buildPlannerInput(state, node)) : null;
      }
    };

    return () => {
      delete window.__pickasso;
    };
  }, []);

  return null;
}
