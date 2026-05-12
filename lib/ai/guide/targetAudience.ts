import "server-only";

import { createMockTargetAudienceSuggestions } from "@/lib/ai/guide/mockTargetAudience";
import { createRealTargetAudienceSuggestions } from "@/lib/ai/guide/openAiTargetAudience";
import type { TargetAudienceSuggestionInput, TargetAudienceSuggestionOutput } from "@/lib/ai/guide/types";
import { getAiModelRoute } from "@/lib/ai/modelRoutes";
import { isRealOpenAIEnabled } from "@/lib/ai/openAiSettings";

export async function suggestTargetAudiences(
  input: TargetAudienceSuggestionInput
): Promise<TargetAudienceSuggestionOutput> {
  const model = getAiModelRoute("targetAudienceGuide").model;

  if (isRealOpenAIEnabled() && model) {
    try {
      const output = await createRealTargetAudienceSuggestions(input, model);
      if (output.suggestions.length) return output;
    } catch {
      return createMockTargetAudienceSuggestions(input, model);
    }
  }

  return createMockTargetAudienceSuggestions(input, model);
}
