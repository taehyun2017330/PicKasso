import "server-only";

import {
  simulateAudienceResponseForVariants,
  type AudienceSimulationResult
} from "@/lib/ai/guide/audienceSimulation";
import {
  createRealAudienceSimulation,
  type AudienceSimulationInput
} from "@/lib/ai/guide/openAiAudienceSimulation";
import { getAiModelRoute } from "@/lib/ai/modelRoutes";
import { isRealOpenAIEnabled } from "@/lib/ai/openAiSettings";

export async function scoreAudienceImages(input: AudienceSimulationInput): Promise<AudienceSimulationResult> {
  const model = getAiModelRoute("audienceImageReview").model;
  const shouldUseReal = input.realMode !== false && isRealOpenAIEnabled();

  if (shouldUseReal && model) {
    try {
      return await createRealAudienceSimulation(input, model);
    } catch {
      return simulateAudienceResponseForVariants({
        ...input,
        scoreSource: "mock",
        scoreModel: model
      });
    }
  }

  return simulateAudienceResponseForVariants({
    ...input,
    scoreSource: "mock",
    scoreModel: model
  });
}
