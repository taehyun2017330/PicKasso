import "server-only";

import {
  createAudiencePersonas,
  type AudienceBrandContext,
  type AudiencePersonaGenerationOutput
} from "@/lib/ai/guide/audienceSimulation";
import {
  createRealAudiencePersonas,
  type AudiencePersonaGenerationInput
} from "@/lib/ai/guide/openAiAudiencePersonas";
import { getAiModelRoute } from "@/lib/ai/modelRoutes";
import { isRealOpenAIEnabled } from "@/lib/ai/openAiSettings";

function fallbackPersonas(
  input: AudiencePersonaGenerationInput,
  model: string | null = null
): AudiencePersonaGenerationOutput {
  const brand: AudienceBrandContext = {
    name: input.brandName,
    category: input.category,
    targetAudience: input.audience
  };

  return {
    source: "mock",
    model,
    personas: createAudiencePersonas({ audience: input.audience, brand })
  };
}

export async function generateAudiencePersonas(
  input: AudiencePersonaGenerationInput
): Promise<AudiencePersonaGenerationOutput> {
  const model = getAiModelRoute("audiencePersonas").model;
  const shouldUseReal = input.realMode !== false && isRealOpenAIEnabled();

  if (shouldUseReal && model) {
    try {
      const output = await createRealAudiencePersonas(input, model);
      if (output.personas.length === 3) return output;
    } catch {
      return fallbackPersonas(input, model);
    }
  }

  return fallbackPersonas(input, model);
}
