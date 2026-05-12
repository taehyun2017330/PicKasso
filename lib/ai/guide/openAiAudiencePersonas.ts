import "server-only";

import { createOpenAIClient } from "@/lib/ai/openAiClient";
import { getOpenAIGuideTimeoutMs } from "@/lib/ai/openAiSettings";
import type { AudiencePersona, AudiencePersonaGenerationOutput } from "@/lib/ai/guide/audienceSimulation";

export interface AudiencePersonaGenerationInput {
  audience: string;
  brandName: string;
  category: string;
  realMode?: boolean;
}

interface RawPersona {
  name: string;
  role: string;
  context: string;
  priority: string;
}

const audiencePersonaSchema = {
  type: "object",
  additionalProperties: false,
  required: ["personas"],
  properties: {
    personas: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "role", "context", "priority"],
        properties: {
          name: { type: "string" },
          role: { type: "string" },
          context: { type: "string" },
          priority: { type: "string" }
        }
      }
    }
  }
};

function compact(value: unknown, fallback: string, maxLength = 170) {
  const text = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  return (text || fallback).slice(0, maxLength);
}

function toPersona(item: RawPersona, index: number): AudiencePersona {
  return {
    id: `persona-${index + 1}`,
    name: compact(item.name, `Persona ${index + 1}`, 60),
    role: compact(item.role, "Target buyer", 56),
    context: compact(item.context, "Decides whether this image makes the brand worth trying.", 210),
    priority: compact(item.priority, "clear reason to choose the brand", 120)
  };
}

function buildPersonaPrompt(input: AudiencePersonaGenerationInput) {
  return {
    system:
      "You generate three concise, editable personas for an AI guide that will score brand images. Return JSON only. Personas must feel like actual people with practical buying contexts, not broad market segments. Avoid sensitive targeting, protected traits, stereotypes, and private personal data. Keep every field short enough for a compact UI.",
    user: JSON.stringify({
      brandName: input.brandName || "Unnamed brand",
      category: input.category || "Other / Custom",
      targetAudience: input.audience || "people likely to buy from this brand",
      instruction:
        "Create exactly 3 distinct people. Use realistic names, a short lens/role, one buying context sentence, and one short priority they will use when judging images."
    })
  };
}

export async function createRealAudiencePersonas(
  input: AudiencePersonaGenerationInput,
  model: string
): Promise<AudiencePersonaGenerationOutput> {
  const openai = createOpenAIClient();
  const prompt = buildPersonaPrompt(input);
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
      max_output_tokens: 650,
      text: {
        format: {
          type: "json_schema",
          name: "audience_personas",
          schema: audiencePersonaSchema,
          strict: true
        }
      } as never
    },
    { timeout }
  );

  const parsed = JSON.parse(response.output_text) as { personas?: RawPersona[] };
  const personas = (parsed.personas ?? []).slice(0, 3).map(toPersona);

  return { source: "openai", model, personas };
}
