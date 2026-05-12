import "server-only";

import { createOpenAIClient } from "@/lib/ai/openAiClient";
import { getOpenAIGuideTimeoutMs } from "@/lib/ai/openAiSettings";
import {
  buildTargetAudienceSuggestionPrompt,
  targetAudienceSuggestionSchema
} from "@/lib/ai/guide/targetAudiencePrompt";
import type {
  TargetAudienceSuggestion,
  TargetAudienceSuggestionInput,
  TargetAudienceSuggestionOutput
} from "@/lib/ai/guide/types";

interface RawSuggestion {
  label: string;
  audience: string;
  rationale: string;
}

function toSuggestion(item: RawSuggestion, index: number): TargetAudienceSuggestion {
  const fallback = `Suggestion ${index + 1}`;
  const audience = item.audience.trim() || fallback;
  const rawLabel = item.label.trim();
  const label = rawLabel && !/^\d+$/.test(rawLabel) ? rawLabel : audience;

  return {
    id: `audience-${index + 1}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    label,
    audience,
    rationale: item.rationale.trim() || "A compact audience direction for this brand."
  };
}

export async function createRealTargetAudienceSuggestions(
  input: TargetAudienceSuggestionInput,
  model: string
): Promise<TargetAudienceSuggestionOutput> {
  const openai = createOpenAIClient();
  const prompt = buildTargetAudienceSuggestionPrompt(input);
  const timeout = getOpenAIGuideTimeoutMs();

  const response = await openai.responses.create(
    {
      model,
      input: [
        {
          role: "system",
          content: prompt.system
        },
        {
          role: "user",
          content: prompt.user
        }
      ],
      max_output_tokens: 700,
      text: {
        format: {
          type: "json_schema",
          name: "target_audience_suggestions",
          schema: targetAudienceSuggestionSchema,
          strict: true
        }
      } as never
    },
    { timeout }
  );

  const parsed = JSON.parse(response.output_text) as { suggestions?: RawSuggestion[] };
  const suggestions = (parsed.suggestions ?? []).slice(0, 6).map(toSuggestion);

  return { source: "openai", model, suggestions };
}
