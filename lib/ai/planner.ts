import type { PlannerInput, PlannerOutput } from "@/lib/types";
import { mockPlanTraceNode } from "@/lib/ai/planner/mockPlanner";
import { createRealPlanTraceNode } from "@/lib/ai/planner/openAiPlanner";
import { isRealOpenAIEnabled } from "@/lib/ai/openAiSettings";
import { customBakeryPlannerOutput, isCustomBakeryBrand } from "@/lib/customBakeryFixture";

export { mockPlanTraceNode };

export async function planTraceNode(input: PlannerInput): Promise<PlannerOutput> {
  if (
    isCustomBakeryBrand(input.brand) &&
    input.actionMode === "wide" &&
    input.nodeDepth === 1 &&
    input.selectedVariants.length === 0 &&
    (input.outputCount ?? 9) === 9
  ) {
    return customBakeryPlannerOutput();
  }

  const shouldUseReal = isRealOpenAIEnabled() && input.runtimeConfig?.realMode !== false;

  if (!shouldUseReal) return mockPlanTraceNode(input);

  return createRealPlanTraceNode(input);
}
