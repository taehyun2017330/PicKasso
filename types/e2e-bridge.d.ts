import type { PlannerInput } from "@/lib/types";
import type { OrchestrationRecipe } from "@/lib/ai/promptOrchestrator";
import type { TraceStore } from "@/store/traceStore.types";

declare global {
  interface Window {
    /**
     * Test-only bridge attached by <E2EBridge /> when NEXT_PUBLIC_E2E=1.
     * Lets the Playwright suite drive and inspect the real store and the
     * real steering functions without scraping the DOM.
     */
    __pickasso?: {
      store: {
        getState: () => TraceStore;
        setState: (
          partial: Partial<TraceStore> | ((state: TraceStore) => Partial<TraceStore>)
        ) => void;
        subscribe: (listener: (state: TraceStore, prev: TraceStore) => void) => () => void;
      };
      reset: () => void;
      plannerInputForNode: (nodeId: string) => PlannerInput | null;
      recipeForNode: (nodeId: string) => OrchestrationRecipe | null;
    };
  }
}
